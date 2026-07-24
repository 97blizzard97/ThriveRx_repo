from datetime import date
from uuid import UUID

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import DoseEvent, Medicine, Reminder, Tree


def test_api_v1_world_stub(client: TestClient) -> None:
    response = client.get("/api/v1/me/world")
    assert response.status_code == 200
    assert response.json() == {"trees": [], "world_expansion_level": 0}


def test_api_v1_medications_search_stub(client: TestClient) -> None:
    response = client.get("/api/v1/medicines/search", params={"q": "met"})
    assert response.status_code == 200
    assert response.json() == []


def test_medicine_detail_includes_common_strengths(
    client: TestClient, db: Session
) -> None:
    medicine = Medicine(
        names={"en": "Metformin", "zh": "二甲双胍", "vi": "Metformin"},
        content={
            "en": {
                "what_its_for": "Type 2 diabetes (general info).",
                "how_usually_taken": "With meals as directed on the label.",
                "common_side_effects": "Nausea, stomach upset.",
                "check_with_pharmacist_if": "You have kidney problems.",
                "translation_reviewed": True,
            }
        },
        source_metadata={"note": "Demo seed for tests only"},
        common_strengths=[
            {"amount": 500, "unit": "mg"},
            {"amount": 1000, "unit": "mg"},
        ],
    )
    db.add(medicine)
    db.commit()
    db.refresh(medicine)

    response = client.get(f"/api/v1/medicines/{medicine.id}")
    assert response.status_code == 200
    body = response.json()
    assert "common_strengths" in body
    assert body["common_strengths"] == [
        {"amount": 500.0, "unit": "mg"},
        {"amount": 1000.0, "unit": "mg"},
    ]


def test_list_medications_includes_dosing_fields(
    client: TestClient, db: Session
) -> None:
    medicine = Medicine(
        names={"en": "Aspirin", "zh": "阿司匹林", "vi": "Aspirin"},
        content={
            "en": {
                "what_its_for": "Demo.",
                "how_usually_taken": "",
                "common_side_effects": "",
                "check_with_pharmacist_if": "",
            }
        },
        source_metadata={},
        common_strengths=[{"amount": 100, "unit": "mg"}],
    )
    db.add(medicine)
    db.commit()
    db.refresh(medicine)

    add = client.post(
        "/api/v1/me/medications",
        json={
            "medicine_id": str(medicine.id),
            "form": "tablet",
            "dose_amount": 100,
            "dose_unit": "mg",
            "frequency_code": "mane",
            "with_food": False,
        },
    )
    assert add.status_code == 201

    listed = client.get("/api/v1/me/medications")
    assert listed.status_code == 200
    items = listed.json()
    assert len(items) == 1
    assert items[0]["form"] == "tablet"
    assert items[0]["dose_amount"] == 100
    assert items[0]["dose_unit"] == "mg"
    assert items[0]["frequency_code"] == "mane"
    assert items[0]["with_food"] is False


def test_api_v1_carer_boundary_shape(client: TestClient) -> None:
    response = client.get("/api/v1/carer/medications")
    assert response.status_code == 200
    body = response.json()
    assert "items" in body
    assert body["items"] == []


def test_add_medication_creates_tree_and_reminder(
    client: TestClient, db: Session
) -> None:
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
        common_strengths=[
            {"amount": 500, "unit": "mg"},
            {"amount": 1000, "unit": "mg"},
        ],
    )
    db.add(medicine)
    db.commit()
    db.refresh(medicine)

    add = client.post(
        "/api/v1/me/medications",
        json={
            "medicine_id": str(medicine.id),
            "indication_key": "general",
            "form": "tablet",
            "dose_amount": 500,
            "dose_unit": "mg",
            "frequency_code": "bd",
            "with_food": True,
        },
    )
    assert add.status_code == 201
    body = add.json()
    patient_med_id = UUID(body["id"])
    assert body["form"] == "tablet"
    assert body["dose_amount"] == 500
    assert body["dose_unit"] == "mg"
    assert body["frequency_code"] == "bd"
    assert body["with_food"] is True

    world = client.get("/api/v1/me/world")
    assert world.status_code == 200
    trees = world.json()["trees"]
    assert len(trees) == 1
    assert trees[0]["patient_medication_id"] == str(patient_med_id)
    assert trees[0]["growth_stage"] == "budding"

    db.expire_all()
    reminder = db.scalars(
        select(Reminder).where(Reminder.patient_medication_id == patient_med_id)
    ).one()
    assert reminder.times_local == ["08:00", "20:00"]

    reminders = client.get("/api/v1/me/reminders")
    assert reminders.status_code == 200
    reminder_list = reminders.json()
    assert len(reminder_list) == 1
    assert reminder_list[0]["patient_medication_id"] == str(patient_med_id)
    assert reminder_list[0]["times_local"] == ["08:00", "20:00"]


def test_add_medication_qds_reminder_times(
    client: TestClient, db: Session
) -> None:
    medicine = Medicine(
        names={"en": "Amoxicillin", "zh": "阿莫西林", "vi": "Amoxicillin"},
        content={
            "en": {
                "what_its_for": "Infection (demo).",
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

    add = client.post(
        "/api/v1/me/medications",
        json={
            "medicine_id": str(medicine.id),
            "form": "capsule",
            "dose_amount": 500,
            "dose_unit": "mg",
            "frequency_code": "qds",
        },
    )
    assert add.status_code == 201
    patient_med_id = UUID(add.json()["id"])
    db.expire_all()
    reminder = db.scalars(
        select(Reminder).where(Reminder.patient_medication_id == patient_med_id)
    ).one()
    assert reminder.times_local == ["08:00", "12:00", "16:00", "20:00"]


def test_patch_medication_updates_dosing_and_reminder_times(
    client: TestClient, db: Session
) -> None:
    medicine = Medicine(
        names={"en": "Ibuprofen", "zh": "布洛芬", "vi": "Ibuprofen"},
        content={
            "en": {
                "what_its_for": "Pain (demo).",
                "how_usually_taken": "",
                "common_side_effects": "",
                "check_with_pharmacist_if": "",
            }
        },
        source_metadata={},
        common_strengths=[{"amount": 200, "unit": "mg"}],
    )
    db.add(medicine)
    db.commit()
    db.refresh(medicine)

    add = client.post(
        "/api/v1/me/medications",
        json={
            "medicine_id": str(medicine.id),
            "form": "tablet",
            "dose_amount": 200,
            "dose_unit": "mg",
            "frequency_code": "od",
            "with_food": False,
        },
    )
    assert add.status_code == 201
    patient_med_id = UUID(add.json()["id"])

    patched = client.patch(
        f"/api/v1/me/medications/{patient_med_id}",
        json={
            "form": "capsule",
            "dose_amount": 400,
            "dose_unit": "mg",
            "frequency_code": "tds",
            "with_food": True,
        },
    )
    assert patched.status_code == 200
    body = patched.json()
    assert body["form"] == "capsule"
    assert body["dose_amount"] == 400
    assert body["dose_unit"] == "mg"
    assert body["frequency_code"] == "tds"
    assert body["with_food"] is True

    db.expire_all()
    reminder = db.scalars(
        select(Reminder).where(Reminder.patient_medication_id == patient_med_id)
    ).one()
    assert reminder.times_local == ["08:00", "14:00", "20:00"]


def test_patch_medication_same_frequency_keeps_custom_times(
    client: TestClient, db: Session
) -> None:
    medicine = Medicine(
        names={"en": "Paracetamol", "zh": "对乙酰氨基酚", "vi": "Paracetamol"},
        content={
            "en": {
                "what_its_for": "Pain (demo).",
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

    add = client.post(
        "/api/v1/me/medications",
        json={
            "medicine_id": str(medicine.id),
            "form": "tablet",
            "dose_amount": 500,
            "dose_unit": "mg",
            "frequency_code": "bd",
        },
    )
    assert add.status_code == 201
    patient_med_id = UUID(add.json()["id"])

    custom = client.put(
        f"/api/v1/me/reminders/{patient_med_id}",
        json={
            "patient_medication_id": str(patient_med_id),
            "times_local": ["09:30", "21:30"],
            "timezone": "Australia/Sydney",
        },
    )
    assert custom.status_code == 200

    patched = client.patch(
        f"/api/v1/me/medications/{patient_med_id}",
        json={
            "form": "tablet",
            "dose_amount": 1000,
            "dose_unit": "mg",
            "frequency_code": "bd",
            "with_food": True,
        },
    )
    assert patched.status_code == 200
    assert patched.json()["dose_amount"] == 1000

    db.expire_all()
    reminder = db.scalars(
        select(Reminder).where(Reminder.patient_medication_id == patient_med_id)
    ).one()
    assert reminder.times_local == ["09:30", "21:30"]


def test_delete_medication_removes_tree_and_reminder(
    client: TestClient, db: Session
) -> None:
    medicine = Medicine(
        names={"en": "Atorvastatin", "zh": "阿托伐他汀", "vi": "Atorvastatin"},
        content={
            "en": {
                "what_its_for": "Cholesterol (demo).",
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

    add = client.post(
        "/api/v1/me/medications",
        json={
            "medicine_id": str(medicine.id),
            "form": "tablet",
            "dose_amount": 20,
            "dose_unit": "mg",
            "frequency_code": "nocte",
        },
    )
    assert add.status_code == 201
    patient_med_id = UUID(add.json()["id"])

    deleted = client.delete(f"/api/v1/me/medications/{patient_med_id}")
    assert deleted.status_code == 204

    listed = client.get("/api/v1/me/medications")
    assert listed.status_code == 200
    assert listed.json() == []

    world = client.get("/api/v1/me/world")
    assert world.status_code == 200
    assert world.json()["trees"] == []

    reminders = client.get("/api/v1/me/reminders")
    assert reminders.status_code == 200
    assert reminders.json() == []

    db.expire_all()
    assert (
        db.scalars(
            select(Reminder).where(Reminder.patient_medication_id == patient_med_id)
        ).first()
        is None
    )
    assert (
        db.scalars(
            select(Tree).where(Tree.patient_medication_id == patient_med_id)
        ).first()
        is None
    )


def test_delete_medication_with_dose_events(
    client: TestClient, db: Session
) -> None:
    """DoseEvent rows must be cleared before PatientMedication (SQLite FK)."""
    medicine = Medicine(
        names={"en": "Metformin", "zh": "二甲双胍", "vi": "Metformin"},
        content={
            "en": {
                "what_its_for": "Diabetes (demo).",
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

    add = client.post(
        "/api/v1/me/medications",
        json={
            "medicine_id": str(medicine.id),
            "form": "tablet",
            "dose_amount": 500,
            "dose_unit": "mg",
            "frequency_code": "bd",
        },
    )
    assert add.status_code == 201
    patient_med_id = UUID(add.json()["id"])

    marked = client.put(
        f"/api/v1/me/doses/{patient_med_id}",
        json={"time_local": "08:00", "status": "taken"},
    )
    assert marked.status_code == 200

    db.expire_all()
    assert (
        db.scalars(
            select(DoseEvent).where(
                DoseEvent.patient_medication_id == patient_med_id,
                DoseEvent.local_date == date.today(),
            )
        ).first()
        is not None
    )

    deleted = client.delete(f"/api/v1/me/medications/{patient_med_id}")
    assert deleted.status_code == 204
    assert deleted.content == b""

    listed = client.get("/api/v1/me/medications")
    assert listed.status_code == 200
    assert listed.json() == []

    db.expire_all()
    assert (
        db.scalars(
            select(DoseEvent).where(
                DoseEvent.patient_medication_id == patient_med_id
            )
        ).first()
        is None
    )


def test_patch_medication_not_found(client: TestClient) -> None:
    missing = UUID("00000000-0000-4000-8000-000000000099")
    response = client.patch(
        f"/api/v1/me/medications/{missing}",
        json={
            "form": "tablet",
            "dose_amount": 10,
            "dose_unit": "mg",
            "frequency_code": "od",
            "with_food": None,
        },
    )
    assert response.status_code == 404
