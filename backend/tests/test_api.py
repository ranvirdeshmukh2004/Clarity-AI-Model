"""
Tests for API health check.
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    """Health endpoint should return 200 with status healthy."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "meeting-clarity-ai"
