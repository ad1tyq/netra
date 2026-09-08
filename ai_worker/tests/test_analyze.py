"""
Tests for the full analysis endpoint (POST /internal/ai/analyze).
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


def _make_normal_fundus(width: int = 400, height: int = 400) -> bytes:
    """Generate a sharp, well-exposed synthetic fundus image."""
    image = np.zeros((height, width, 3), dtype=np.uint8)
    image[:, :, 2] = 160
    image[:, :, 1] = 80
    noise = np.random.RandomState(42).randint(0, 40, (height, width, 3), dtype=np.uint8)
    image = cv2.add(image, noise)
    _, buffer = cv2.imencode(".jpg", image)
    return buffer.tobytes()


def _make_blurry_fundus(width: int = 400, height: int = 400) -> bytes:
    """Generate a blurry synthetic fundus image."""
    image = np.full((height, width, 3), 120, dtype=np.uint8)
    image = cv2.GaussianBlur(image, (51, 51), 0)
    _, buffer = cv2.imencode(".jpg", image)
    return buffer.tobytes()


class TestAnalyzeEndpoint:
    """Tests for POST /internal/ai/analyze."""

    def test_analyze_returns_200(self, client: TestClient):
        img_bytes = _make_normal_fundus()
        response = client.post(
            "/internal/ai/analyze",
            files={"file": ("test.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        )
        assert response.status_code == 200

    def test_analyze_success_response_shape(self, client: TestClient):
        """Verify the response matches the JSON contract the Java backend expects."""
        img_bytes = _make_normal_fundus()
        data = client.post(
            "/internal/ai/analyze",
            files={"file": ("fundus.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        ).json()

        assert data["status"] == "success"

        # Quality block
        assert "quality" in data
        assert "gradable" in data["quality"]
        assert "blur_score" in data["quality"]
        assert "exposure" in data["quality"]

        # Screening result (should be present for gradable images)
        assert "screening_result" in data
        if data["quality"]["gradable"]:
            assert data["screening_result"] is not None
            assert "ai_grade" in data["screening_result"]
            assert "referable_probability" in data["screening_result"]
            assert 0 <= data["screening_result"]["ai_grade"] <= 4
            assert 0.0 <= data["screening_result"]["referable_probability"] <= 1.0

        # Recommendation
        assert "recommendation" in data
        if data["quality"]["gradable"]:
            assert data["recommendation"] in ["ROUTINE_ANNUAL_CHECK", "URGENT_REFERRAL"]

        # Lesions
        assert "lesions" in data
        assert isinstance(data["lesions"], list)
        for lesion in data["lesions"]:
            assert lesion["type"] in ["MICROANEURYSM", "HAEMORRHAGE", "EXUDATE"]
            assert len(lesion["bbox"]) == 4
            assert all(0.0 <= v <= 1.0 for v in lesion["bbox"])
            assert 0.0 <= lesion["confidence"] <= 1.0

    def test_analyze_blurry_image_short_circuits(self, client: TestClient):
        """Blurry image should skip classification — no screening_result."""
        img_bytes = _make_blurry_fundus()
        data = client.post(
            "/internal/ai/analyze",
            files={"file": ("blurry.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        ).json()

        assert data["status"] == "success"
        assert data["quality"]["gradable"] is False
        assert data["screening_result"] is None
        assert data["recommendation"] is None
        assert data["lesions"] == []

    def test_analyze_same_image_gives_consistent_results(self, client: TestClient):
        """In stub mode, same image should produce same prediction."""
        img_bytes = _make_normal_fundus()

        data1 = client.post(
            "/internal/ai/analyze",
            files={"file": ("test.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        ).json()

        data2 = client.post(
            "/internal/ai/analyze",
            files={"file": ("test.jpg", io.BytesIO(img_bytes), "image/jpeg")},
        ).json()

        # Stub mode is deterministic per image
        if data1["screening_result"] and data2["screening_result"]:
            assert data1["screening_result"]["ai_grade"] == data2["screening_result"]["ai_grade"]
            assert data1["recommendation"] == data2["recommendation"]

    def test_analyze_invalid_file_returns_error(self, client: TestClient):
        """Non-image bytes should return an error response, not crash."""
        response = client.post(
            "/internal/ai/analyze",
            files={"file": ("bad.txt", io.BytesIO(b"this is not an image"), "text/plain")},
        )
        assert response.status_code == 200  # Graceful error, not 500
        data = response.json()
        assert data["status"] == "error"
        assert data["error_message"] is not None
