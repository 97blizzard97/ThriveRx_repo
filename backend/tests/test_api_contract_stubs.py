from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Medicine


def test_api_v1_world_stub(client: TestClient) -> None:
    response = client.get("/api/v1/me/world")
    assert response.status_code == 200
    assert response.json() == {"trees": [], "world_expansion_level": 0}


def test_api_v1_medications_search_stub(client: TestClient) -> None:
    response = client.get("/api/v1/medicines/search", params={"q": "met"})
    assert response.status_code == 200
    assert response.json() == []


def test_api_v1_carer_boundary_shape(client: TestClient) -> None:
    response = client.get("/api/v1/carer/medications")
    assert response.status_code == 200
    body = response.json()
    assert "items" in body
    assert body["items"] == []


def test_add_medication_creates_tree(client: TestClient, db: Session) -> None:
    medicine = Medicine(
        names={"en": "Metformin", "zh": "二甲双胍", "vi": "Metformin"},
        content={
            "en": {
                "what_its_for": "Type 2 diabetes (general info).",
                "how_usually_taken": "With meals as directed on the label.",
                "common_side_effects": "Nausea, stomach upset.",
                "check_with_pharmacist_if": "You have kidney problems.",
                "translation_reviewed": False,
            }
        },
        source_metadata={"note": "Demo seed for tests only"},
    )
    db.add(medicine)
    db.commit()
    db.refresh(medicine)

    add = client.post(
        "/api/v1/me/medications",
        json={"medicine_id": str(medicine.id), "indication_key": "general"},
    )
    assert add.status_code == 201
    patient_med_id = add.json()["id"]

    world = client.get("/api/v1/me/world")
    assert world.status_code == 200
    trees = world.json()["trees"]
    assert len(trees) == 1
    assert trees[0]["patient_medication_id"] == patient_med_id
    assert trees[0]["growth_stage"] == "budding"
