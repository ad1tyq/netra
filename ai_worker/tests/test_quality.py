"""
Tests for the quality-check endpoint.
"""

import io

import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def _make_test_image(
    width: int = 400,
    height: int = 400,
    blur: bool = False,
    dark: bool = False,
    bright: bool = False,
) -> bytes:
    """
    Generate a synthetic test image in memory.

    Args:
        blur: If True, apply heavy Gaussian blur (should trigger RETAKE).
        dark: If True, make very dark (underexposed).
        bright: If True, make very bright (overexposed).

    Returns:
        JPEG bytes of the generated image.
    """
    if dark:
        image = np.full((height, width, 3), 20, dtype=np.uint8)
    elif bright:
        image = np.full((height, width, 3), 250, dtype=np.uint8)
    else:
        # Normal fundus-like image: reddish-orange gradient
        image = np.zeros((height, width, 3), dtype=np.uint8)
        image[:, :, 2] = 160  # Red channel
        image[:, :, 1] = 80   # Green channel
        # Add some texture so it's not perfectly uniform
        noise = np.random.RandomState(42).randint(0, 40, (height, width, 3), dtype=np.uint8)
        image = cv2.add(image, noise)

    if blur:
        image = cv2.GaussianBlur(image, (51, 51), 0)

    _, buffer = cv2.imencode(".jpg", image)
    return buffer.tobytes()


class TestQualityCheckEndpoint:
    """Tests for POST /internal/ai/quality-check."""

    def test_quality_check_returns_200(self, client: TestClient):
        img_bytes = _make_test_image()
        response = client.post(
            "/internal/ai/quality-check",
            files={"file": ("test.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        )
        assert response.status_code == 200

    def test_quality_check_response_shape(self, client: TestClient):
        img_bytes = _make_test_image()
        data = client.post(
            "/internal/ai/quality-check",
            files={"file": ("test.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        ).json()
        assert data["status"] == "success"
        assert "quality" in data
        assert "quality_status" in data
        assert "gradable" in data["quality"]
        assert "blur_score" in data["quality"]
        assert "exposure" in data["quality"]

    def test_sharp_image_is_gradable(self, client: TestClient):
        img_bytes = _make_test_image(blur=False)
        data = client.post(
            "/internal/ai/quality-check",
            files={"file": ("sharp.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        ).json()
        assert data["quality"]["gradable"] is True
        assert data["quality_status"] == "GRADABLE"

    def test_blurry_image_requires_retake(self, client: TestClient):
        img_bytes = _make_test_image(blur=True)
        data = client.post(
            "/internal/ai/quality-check",
            files={"file": ("blurry.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        ).json()
        assert data["quality"]["gradable"] is False
        assert data["quality_status"] == "RETAKE_REQUIRED"

    def test_dark_image_is_underexposed(self, client: TestClient):
        img_bytes = _make_test_image(dark=True)
        data = client.post(
            "/internal/ai/quality-check",
            files={"file": ("dark.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        ).json()
        assert data["quality"]["exposure"] == "underexposed"
        assert data["quality"]["gradable"] is False

    def test_bright_image_is_overexposed(self, client: TestClient):
        img_bytes = _make_test_image(bright=True)
        data = client.post(
            "/internal/ai/quality-check",
            files={"file": ("bright.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        ).json()
        assert data["quality"]["exposure"] == "overexposed"
        assert data["quality"]["gradable"] is False
