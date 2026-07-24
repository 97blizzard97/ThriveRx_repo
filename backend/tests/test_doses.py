from datetime import date
from uuid import UUID

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import DoseEvent, Medicine, Tree


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


def _add_bd_med(client: TestClient, medicine_id: UUID) -> UUID:
    add = client.post(
        "/api/v1/me/medications",
        json={
            "medicine_id": str(medicine_id),
            "form": "tablet",
            "dose_amount": 500,
            "dose_unit": "mg",
            "frequency_code": "bd",
        },
    )
    assert add.status_code == 201
    return UUID(add.json()["id"])


def test_today_doses_lists_slots_from_reminder(
    client: TestClient, db: Session
) -> None:
    medicine = _seed_medicine(db)
    patient_med_id = _add_bd_med(client, medicine.id)

    response = client.get("/api/v1/me/doses/today")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    item = body[0]
    assert item["patient_medication_id"] == str(patient_med_id)
    assert item["display_name"] == "Metformin"
    assert [s["time_local"] for s in item["slots"]] == ["08:00", "20:00"]
    assert all(s["status"] is None for s in item["slots"])
    assert item["all_taken"] is False
    assert item["can_grow_today"] is True


def test_mark_dose_slot_and_all_taken_records_daily_press(
    client: TestClient, db: Session
) -> None:
    medicine = _seed_medicine(db, "Aspirin")
    patient_med_id = _add_bd_med(client, medicine.id)

    first = client.put(
        f"/api/v1/me/doses/{patient_med_id}",
        json={"time_local": "08:00", "status": "taken"},
    )
    assert first.status_code == 200
    first_body = first.json()
    assert first_body["status"] == "taken"
    assert first_body["all_taken"] is False
    assert first_body["daily_press_recorded"] is False

    tree = db.scalars(
        select(Tree).where(Tree.patient_medication_id == patient_med_id)
    ).one()
    assert tree.last_press_date is None
    assert tree.accumulated_growth_days == 0

    second = client.put(
        f"/api/v1/me/doses/{patient_med_id}",
        json={"time_local": "20:00", "status": "taken"},
    )
    assert second.status_code == 200
    second_body = second.json()
    assert second_body["all_taken"] is True
    assert second_body["daily_press_recorded"] is True

    db.expire_all()
    tree = db.scalars(
        select(Tree).where(Tree.patient_medication_id == patient_med_id)
    ).one()
    assert tree.last_press_date == date.today()
    assert tree.accumulated_growth_days == 1

    events = db.scalars(
        select(DoseEvent).where(DoseEvent.patient_medication_id == patient_med_id)
    ).all()
    assert len(events) == 2
    assert {e.time_local: e.status for e in events} == {
        "08:00": "taken",
        "20:00": "taken",
    }


def test_all_taken_second_press_is_idempotent(
    client: TestClient, db: Session
) -> None:
    medicine = _seed_medicine(db, "Ibuprofen")
    patient_med_id = _add_bd_med(client, medicine.id)

    client.put(
        f"/api/v1/me/doses/{patient_med_id}",
        json={"time_local": "08:00", "status": "taken"},
    )
    first_complete = client.put(
        f"/api/v1/me/doses/{patient_med_id}",
        json={"time_local": "20:00", "status": "taken"},
    )
    assert first_complete.json()["daily_press_recorded"] is True

    # Re-mark a slot as taken again — still all taken, but press is idempotent.
    again = client.put(
        f"/api/v1/me/doses/{patient_med_id}",
        json={"time_local": "20:00", "status": "taken"},
    )
    assert again.status_code == 200
    assert again.json()["all_taken"] is True
    assert again.json()["daily_press_recorded"] is False

    db.expire_all()
    tree = db.scalars(
        select(Tree).where(Tree.patient_medication_id == patient_med_id)
    ).one()
    assert tree.accumulated_growth_days == 1


def test_skip_does_not_grow_tree(client: TestClient, db: Session) -> None:
    medicine = _seed_medicine(db, "Amoxicillin")
    patient_med_id = _add_bd_med(client, medicine.id)

    client.put(
        f"/api/v1/me/doses/{patient_med_id}",
        json={"time_local": "08:00", "status": "taken"},
    )
    skipped = client.put(
        f"/api/v1/me/doses/{patient_med_id}",
        json={"time_local": "20:00", "status": "skipped"},
    )
    assert skipped.status_code == 200
    assert skipped.json()["all_taken"] is False
    assert skipped.json()["daily_press_recorded"] is False

    db.expire_all()
    tree = db.scalars(
        select(Tree).where(Tree.patient_medication_id == patient_med_id)
    ).one()
    assert tree.last_press_date is None
    assert tree.accumulated_growth_days == 0


def test_mark_unknown_time_returns_400(client: TestClient, db: Session) -> None:
    medicine = _seed_medicine(db)
    patient_med_id = _add_bd_med(client, medicine.id)

    response = client.put(
        f"/api/v1/me/doses/{patient_med_id}",
        json={"time_local": "12:00", "status": "taken"},
    )
    assert response.status_code == 400


def test_list_medications_includes_times_local(
    client: TestClient, db: Session
) -> None:
    medicine = _seed_medicine(db)
    patient_med_id = _add_bd_med(client, medicine.id)

    listed = client.get("/api/v1/me/medications")
    assert listed.status_code == 200
    items = listed.json()
    assert len(items) == 1
    assert items[0]["id"] == str(patient_med_id)
    assert items[0]["times_local"] == ["08:00", "20:00"]
