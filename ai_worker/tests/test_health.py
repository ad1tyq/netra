"""
Tests for the health and model-info endpoints.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create a test client."""
    with TestClient(app) as c:
        yield c


class TestHealthEndpoint:
    """Tests for GET /internal/ai/health."""

    def test_health_returns_200(self, client: TestClient):
        response = client.get("/internal/ai/health")
        assert response.status_code == 200

    def test_health_response_shape(self, client: TestClient):
        data = client.get("/internal/ai/health").json()
        assert "status" in data
        assert "model_loaded" in data
        assert "uptime_seconds" in data

    def test_health_status_is_healthy(self, client: TestClient):
        """Even in stub mode, the service should report healthy."""
        data = client.get("/internal/ai/health").json()
        assert data["status"] == "healthy"

    def test_health_uptime_is_positive(self, client: TestClient):
        data = client.get("/internal/ai/health").json()
        assert data["uptime_seconds"] >= 0


class TestModelInfoEndpoint:
    """Tests for GET /internal/ai/model-info."""

    def test_model_info_returns_200(self, client: TestClient):
        response = client.get("/internal/ai/model-info")
        assert response.status_code == 200

    def test_model_info_response_shape(self, client: TestClient):
        data = client.get("/internal/ai/model-info").json()
        assert "classifier" in data
        assert "classifier_version" in data
        assert "detector" in data
        assert "detector_version" in data
        assert "input_size" in data
        assert "stub_mode" in data

    def test_model_info_input_size_is_224(self, client: TestClient):
        data = client.get("/internal/ai/model-info").json()
        assert data["input_size"] == [224, 224]

    def test_model_info_stub_mode_without_weights(self, client: TestClient):
        """Without real weights, stub_mode should be True."""
        data = client.get("/internal/ai/model-info").json()
        assert data["stub_mode"] is True
