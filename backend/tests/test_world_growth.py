"""Stage mapping and demo-only garden fast-forward."""

from uuid import UUID

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Medicine, Tree
from app.schemas.common import GrowthStage
from app.services.world_trees import stage_for_growth_days


def test_stage_for_growth_days_thresholds() -> None:
    assert stage_for_growth_days(0) == GrowthStage.budding
    assert stage_for_growth_days(13) == GrowthStage.budding
    assert stage_for_growth_days(14) == GrowthStage.small
    assert stage_for_growth_days(59) == GrowthStage.small
    assert stage_for_growth_days(60) == GrowthStage.large
    assert stage_for_growth_days(179) == GrowthStage.large
    assert stage_for_growth_days(180) == GrowthStage.mature
    assert stage_for_growth_days(365) == GrowthStage.mature


def _seed_medicine(db: Session, name: str = "Metformin") -> Medicine:
    medicine = Medicine(
        names={"en": name, "zh": name, "vi": name},
        content={
            "en": {
                "what_its_for": "Demo.",
                "how_usually_taken": "",
                "common_side_effects": "",
                "check_with_pharmacist_if": "",
            }
        },
        source_metadata={},
    )
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


def _add_od_med(client: TestClient, medicine_id: UUID) -> UUID:
    add = client.post(
        "/api/v1/me/medications",
        json={
            "medicine_id": str(medicine_id),
            "form": "tablet",
            "dose_amount": 500,
            "dose_unit": "mg",
            "frequency_code": "od",
        },
    )
    assert add.status_code == 201
    return UUID(add.json()["id"])


def test_daily_press_advances_stage_at_threshold(
    client: TestClient, db: Session
) -> None:
    medicine = _seed_medicine(db, "StagePress")
    patient_med_id = _add_od_med(client, medicine.id)

    tree = db.scalars(
        select(Tree).where(Tree.patient_medication_id == patient_med_id)
    ).one()
    tree.accumulated_growth_days = 13
    tree.growth_stage = GrowthStage.budding.value
    db.commit()

    response = client.post(f"/api/v1/me/trees/{patient_med_id}/daily-press")
    assert response.status_code == 200
    body = response.json()
    assert body["pressed"] is True
    assert body["tree"]["accumulated_growth_days"] == 14
    assert body["tree"]["growth_stage"] == "small"


def test_demo_advance_adds_days_to_all_trees_and_raises_expansion(
    client: TestClient, db: Session
) -> None:
    med_a = _seed_medicine(db, "DemoA")
    med_b = _seed_medicine(db, "DemoB")
    id_a = _add_od_med(client, med_a.id)
    id_b = _add_od_med(client, med_b.id)

    response = client.post(
        "/api/v1/me/world/demo/advance",
        json={"days": 180},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["days_added"] == 180
    world = body["world"]
    assert len(world["trees"]) == 2
    assert all(t["accumulated_growth_days"] == 180 for t in world["trees"])
    assert all(t["growth_stage"] == "mature" for t in world["trees"])
    assert world["world_expansion_level"] == 2

    db.expire_all()
    for patient_med_id in (id_a, id_b):
        tree = db.scalars(
            select(Tree).where(Tree.patient_medication_id == patient_med_id)
        ).one()
        assert tree.accumulated_growth_days == 180
        assert tree.growth_stage == "mature"
        # Demo path must not fake today's press.
        assert tree.last_press_date is None


def test_demo_advance_adds_from_current(
    client: TestClient, db: Session
) -> None:
    medicine = _seed_medicine(db, "Partial")
    patient_med_id = _add_od_med(client, medicine.id)

    tree = db.scalars(
        select(Tree).where(Tree.patient_medication_id == patient_med_id)
    ).one()
    tree.accumulated_growth_days = 50
    tree.growth_stage = GrowthStage.small.value
    db.commit()

    response = client.post(
        "/api/v1/me/world/demo/advance",
        json={"days": 14},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["days_added"] == 14
    tree_state = body["world"]["trees"][0]
    assert tree_state["accumulated_growth_days"] == 64
    assert tree_state["growth_stage"] == "large"


def test_demo_advance_rejects_out_of_range(client: TestClient) -> None:
    assert (
        client.post("/api/v1/me/world/demo/advance", json={"days": 0}).status_code
        == 422
    )
    assert (
        client.post("/api/v1/me/world/demo/advance", json={"days": 181}).status_code
        == 422
    )


def test_demo_reset_sets_all_trees_to_budding(
    client: TestClient, db: Session
) -> None:
    med_a = _seed_medicine(db, "ResetA")
    med_b = _seed_medicine(db, "ResetB")
    id_a = _add_od_med(client, med_a.id)
    id_b = _add_od_med(client, med_b.id)

    advance = client.post("/api/v1/me/world/demo/advance", json={"days": 180})
    assert advance.status_code == 200

    species_before = {}
    db.expire_all()
    for patient_med_id in (id_a, id_b):
        tree = db.scalars(
            select(Tree).where(Tree.patient_medication_id == patient_med_id)
        ).one()
        species_before[patient_med_id] = tree.species_key
        assert tree.accumulated_growth_days == 180
        assert tree.growth_stage == "mature"

    response = client.post("/api/v1/me/world/demo/reset")
    assert response.status_code == 200
    body = response.json()
    world = body["world"]
    assert len(world["trees"]) == 2
    assert all(t["accumulated_growth_days"] == 0 for t in world["trees"])
    assert all(t["growth_stage"] == "budding" for t in world["trees"])
    assert world["world_expansion_level"] == 0

    db.expire_all()
    for patient_med_id in (id_a, id_b):
        tree = db.scalars(
            select(Tree).where(Tree.patient_medication_id == patient_med_id)
        ).one()
        assert tree.accumulated_growth_days == 0
        assert tree.growth_stage == "budding"
        assert tree.species_key == species_before[patient_med_id]


def test_demo_reset_with_no_trees(client: TestClient) -> None:
    response = client.post("/api/v1/me/world/demo/reset")
    assert response.status_code == 200
    body = response.json()
    assert body["world"]["trees"] == []
    assert body["world"]["world_expansion_level"] == 0
