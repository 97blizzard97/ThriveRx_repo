"""Medication catalog and patient list — med core module."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Medicine, PatientMedication
from app.schemas.medications import (
    MedicineDetail,
    MedicineSummary,
    PatientMedicationCreate,
)
from app.schemas.medications import (
    PatientMedication as PatientMedicationSchema,
)
from app.services import world_trees as world_trees_service


def _medicine_display_name(medicine: Medicine, locale: str = "en") -> str:
    names = medicine.names or {}
    return str(names.get(locale) or names.get("en") or "Unknown")


def _medicine_to_detail(medicine: Medicine, locale: str = "en") -> MedicineDetail:
    content = medicine.content or {}
    block = content.get(locale) or content.get("en") or {}
    return MedicineDetail(
        id=medicine.id,
        display_name=_medicine_display_name(medicine, locale),
        what_its_for=str(block.get("what_its_for", "")),
        how_usually_taken=str(block.get("how_usually_taken", "")),
        common_side_effects=str(block.get("common_side_effects", "")),
        check_with_pharmacist_if=str(block.get("check_with_pharmacist_if", "")),
        translation_reviewed=bool(block.get("translation_reviewed", False)),
    )


def _patient_med_to_schema(row: PatientMedication) -> PatientMedicationSchema:
    return PatientMedicationSchema(
        id=row.id,
        medicine_id=row.medicine_id,
        indication_key=row.indication_key,
        added_at=row.added_at,
    )


def search_medicines(db: Session, query: str) -> list[MedicineSummary]:
    medicines = db.scalars(select(Medicine)).all()
    q = query.strip().lower()
    if q:

        def matches(medicine: Medicine) -> bool:
            names = medicine.names or {}
            hay = " ".join(
                str(names.get(key, "")) for key in ("en", "zh", "vi")
            ).lower()
            return q in hay

        medicines = [m for m in medicines if matches(m)]
    return [
        MedicineSummary(id=m.id, display_name=_medicine_display_name(m))
        for m in medicines
    ]


def get_medicine(db: Session, medicine_id: UUID) -> MedicineDetail | None:
    medicine = db.get(Medicine, medicine_id)
    if medicine is None:
        return None
    return _medicine_to_detail(medicine)


def list_patient_medications(
    db: Session, user_id: UUID
) -> list[PatientMedicationSchema]:
    rows = db.scalars(
        select(PatientMedication)
        .where(PatientMedication.user_id == user_id)
        .order_by(PatientMedication.added_at.desc())
    ).all()
    return [_patient_med_to_schema(r) for r in rows]


def add_patient_medication(
    db: Session, user_id: UUID, payload: PatientMedicationCreate
) -> PatientMedicationSchema:
    medicine = db.get(Medicine, payload.medicine_id)
    if medicine is None:
        msg = "Medicine not found"
        raise ValueError(msg)

    row = PatientMedication(
        user_id=user_id,
        medicine_id=payload.medicine_id,
        indication_key=payload.indication_key,
    )
    db.add(row)
    db.flush()
    world_trees_service.create_tree_for_patient_medication(db, row.id)
    db.commit()
    db.refresh(row)
    return _patient_med_to_schema(row)


def remove_patient_medication(
    db: Session, user_id: UUID, patient_medication_id: UUID
) -> None:
    row = db.get(PatientMedication, patient_medication_id)
    if row is None or row.user_id != user_id:
        msg = "Patient medication not found"
        raise LookupError(msg)
    db.delete(row)
    db.commit()
