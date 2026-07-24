"""Medication catalog and patient list — med core module."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.constants import normalize_locale
from app.models import DoseEvent, Medicine, PatientMedication, Reminder, Tree
from app.schemas.medications import (
    CommonStrength,
    MedicineDetail,
    MedicineSummary,
    PatientMedicationCreate,
    PatientMedicationUpdate,
)
from app.schemas.medications import (
    PatientMedication as PatientMedicationSchema,
)
from app.services import reminders as reminders_service
from app.services import world_trees as world_trees_service


def _medicine_display_name(medicine: Medicine, locale: str = "en") -> str:
    names = medicine.names or {}
    return str(names.get(locale) or names.get("en") or "Unknown")


def _parse_common_strengths(raw: list | None) -> list[CommonStrength]:
    if not raw:
        return []
    strengths: list[CommonStrength] = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        amount = item.get("amount")
        unit = item.get("unit")
        if amount is None or unit is None:
            continue
        strengths.append(CommonStrength(amount=float(amount), unit=str(unit)))
    return strengths


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
        common_strengths=_parse_common_strengths(medicine.common_strengths),
    )


def _times_for_patient_med(db: Session, patient_medication_id: UUID) -> list[str]:
    reminder = db.scalar(
        select(Reminder).where(
            Reminder.patient_medication_id == patient_medication_id
        )
    )
    if reminder is None:
        return []
    return list(reminder.times_local or [])


def _patient_med_to_schema(
    db: Session, row: PatientMedication
) -> PatientMedicationSchema:
    return PatientMedicationSchema(
        id=row.id,
        medicine_id=row.medicine_id,
        indication_key=row.indication_key,
        form=row.form,  # type: ignore[arg-type]
        dose_amount=row.dose_amount,
        dose_unit=row.dose_unit,  # type: ignore[arg-type]
        frequency_code=row.frequency_code,  # type: ignore[arg-type]
        with_food=row.with_food,
        added_at=row.added_at,
        times_local=_times_for_patient_med(db, row.id),
    )


def search_medicines(
    db: Session, query: str, locale: str = "en"
) -> list[MedicineSummary]:
    resolved_locale = normalize_locale(locale)
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
        MedicineSummary(
            id=m.id, display_name=_medicine_display_name(m, resolved_locale)
        )
        for m in medicines
    ]


def get_medicine(
    db: Session, medicine_id: UUID, locale: str = "en"
) -> MedicineDetail | None:
    medicine = db.get(Medicine, medicine_id)
    if medicine is None:
        return None
    return _medicine_to_detail(medicine, normalize_locale(locale))


def list_patient_medications(
    db: Session, user_id: UUID
) -> list[PatientMedicationSchema]:
    rows = db.scalars(
        select(PatientMedication)
        .where(PatientMedication.user_id == user_id)
        .order_by(PatientMedication.added_at.desc())
    ).all()
    return [_patient_med_to_schema(db, r) for r in rows]


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
        form=payload.form,
        dose_amount=payload.dose_amount,
        dose_unit=payload.dose_unit,
        frequency_code=payload.frequency_code,
        with_food=payload.with_food,
    )
    db.add(row)
    db.flush()
    world_trees_service.create_tree_for_patient_medication(db, row.id)
    reminders_service.create_reminder_for_patient_medication(
        db, row.id, payload.frequency_code
    )
    db.commit()
    db.refresh(row)
    return _patient_med_to_schema(db, row)


def update_patient_medication(
    db: Session,
    user_id: UUID,
    patient_medication_id: UUID,
    payload: PatientMedicationUpdate,
) -> PatientMedicationSchema:
    row = db.get(PatientMedication, patient_medication_id)
    if row is None or row.user_id != user_id:
        msg = "Patient medication not found"
        raise LookupError(msg)

    frequency_changed = row.frequency_code != payload.frequency_code
    row.form = payload.form
    row.dose_amount = payload.dose_amount
    row.dose_unit = payload.dose_unit
    row.frequency_code = payload.frequency_code
    row.with_food = payload.with_food

    if frequency_changed:
        reminders_service.create_reminder_for_patient_medication(
            db, row.id, payload.frequency_code
        )

    db.commit()
    db.refresh(row)
    return _patient_med_to_schema(db, row)


def remove_patient_medication(
    db: Session, user_id: UUID, patient_medication_id: UUID
) -> None:
    row = db.get(PatientMedication, patient_medication_id)
    if row is None or row.user_id != user_id:
        msg = "Patient medication not found"
        raise LookupError(msg)

    # Explicit cleanup — SQLite may not enforce ON DELETE CASCADE.
    tree = db.scalar(
        select(Tree).where(Tree.patient_medication_id == patient_medication_id)
    )
    if tree is not None:
        db.delete(tree)
    reminder = db.scalar(
        select(Reminder).where(
            Reminder.patient_medication_id == patient_medication_id
        )
    )
    if reminder is not None:
        db.delete(reminder)
    for event in db.scalars(
        select(DoseEvent).where(
            DoseEvent.patient_medication_id == patient_medication_id
        )
    ).all():
        db.delete(event)

    db.delete(row)
    db.commit()
