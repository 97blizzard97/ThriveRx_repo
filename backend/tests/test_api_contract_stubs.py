from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_api_v1_world_stub() -> None:
    response = client.get("/api/v1/me/world")
    assert response.status_code == 200
    assert response.json() == {"trees": [], "world_expansion_level": 0}


def test_api_v1_medications_search_stub() -> None:
    response = client.get("/api/v1/medicines/search", params={"q": "met"})
    assert response.status_code == 200
    assert response.json() == []


def test_api_v1_carer_boundary_shape() -> None:
    response = client.get("/api/v1/carer/medications")
    assert response.status_code == 200
    body = response.json()
    assert "items" in body
    assert body["items"] == []
