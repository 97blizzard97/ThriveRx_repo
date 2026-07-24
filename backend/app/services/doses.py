"""Today's dose slots — med core module (schedule UX, not adherence scoring)."""

from datetime import date, datetime
from typing import cast
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.constants import normalize_locale
from app.models import DoseEvent, Medicine, PatientMedication, Reminder, Tree
from app.schemas.medications import (
    DoseMarkRequest,
    DoseMarkResponse,
    DoseSlot,
    DoseStatus,
    TodayDoseMedication,
)
from app.services import world_trees as world_trees_service


def _medicine_display_name(medicine: Medicine, locale: str = "en") -> str:
    names = medicine.names or {}
    return str(names.get(locale) or names.get("en") or "Unknown")


def _reminder_times(db: Session, patient_medication_id: UUID) -> list[str]:
    reminder = db.scalar(
        select(Reminder).where(
            Reminder.patient_medication_id == patient_medication_id
        )
    )
    if reminder is None:
        return []
    return list(reminder.times_local or [])


def _events_for_day(
    db: Session, patient_medication_id: UUID, local_date: date
) -> dict[str, str]:
    rows = db.scalars(
        select(DoseEvent).where(
            DoseEvent.patient_medication_id == patient_medication_id,
            DoseEvent.local_date == local_date,
        )
    ).all()
    return {row.time_local: row.status for row in rows}


def _all_slots_taken(times: list[str], status_by_time: dict[str, str]) -> bool:
    if not times:
        return False
    return all(status_by_time.get(t) == "taken" for t in times)


def _tree_can_grow_today(db: Session, patient_medication_id: UUID) -> bool:
    tree = db.scalar(
        select(Tree).where(Tree.patient_medication_id == patient_medication_id)
    )
    if tree is None:
        return False
    return tree.last_press_date != date.today()


def _slot_status(raw: str | None) -> DoseStatus | None:
    if raw in ("taken", "skipped"):
        return cast(DoseStatus, raw)
    return None


def list_today_doses(
    db: Session, user_id: UUID, locale: str = "en"
) -> list[TodayDoseMedication]:
    resolved_locale = normalize_locale(locale)
    today = date.today()
    rows = db.scalars(
        select(PatientMedication)
        .where(PatientMedication.user_id == user_id)
        .order_by(PatientMedication.added_at.desc())
    ).all()

    result: list[TodayDoseMedication] = []
    for row in rows:
        medicine = db.get(Medicine, row.medicine_id)
        display_name = (
            _medicine_display_name(medicine, resolved_locale)
            if medicine is not None
            else "Unknown"
        )
        times = _reminder_times(db, row.id)
        status_by_time = _events_for_day(db, row.id, today)
        slots = [
            DoseSlot(time_local=t, status=_slot_status(status_by_time.get(t)))
            for t in times
        ]
        all_taken = _all_slots_taken(times, status_by_time)
        result.append(
            TodayDoseMedication(
                patient_medication_id=row.id,
                medicine_id=row.medicine_id,
                display_name=display_name,
                local_date=today,
                slots=slots,
                all_taken=all_taken,
                can_grow_today=_tree_can_grow_today(db, row.id),
            )
        )
    return result


def mark_dose(
    db: Session,
    user_id: UUID,
    patient_medication_id: UUID,
    payload: DoseMarkRequest,
) -> DoseMarkResponse:
    row = db.get(PatientMedication, patient_medication_id)
    if row is None or row.user_id != user_id:
        msg = "Patient medication not found"
        raise LookupError(msg)

    times = _reminder_times(db, patient_medication_id)
    if payload.time_local not in times:
        msg = "time_local is not on this medication's schedule"
        raise ValueError(msg)

    today = date.today()
    existing = db.scalar(
        select(DoseEvent).where(
            DoseEvent.patient_medication_id == patient_medication_id,
            DoseEvent.local_date == today,
            DoseEvent.time_local == payload.time_local,
        )
    )
    if existing is None:
        existing = DoseEvent(
            patient_medication_id=patient_medication_id,
            local_date=today,
            time_local=payload.time_local,
            status=payload.status,
            recorded_at=datetime.utcnow(),
        )
        db.add(existing)
    else:
        existing.status = payload.status
        existing.recorded_at = datetime.utcnow()

    db.flush()

    status_by_time = _events_for_day(db, patient_medication_id, today)
    all_taken = _all_slots_taken(times, status_by_time)

    daily_press_recorded = False
    if all_taken:
        press = world_trees_service.record_daily_press(
            db, user_id, patient_medication_id
        )
        if press is None:
            db.commit()
        else:
            daily_press_recorded = press.pressed
    else:
        db.commit()

    return DoseMarkResponse(
        patient_medication_id=patient_medication_id,
        local_date=today,
        time_local=payload.time_local,
        status=payload.status,
        all_taken=all_taken,
        daily_press_recorded=daily_press_recorded,
    )
