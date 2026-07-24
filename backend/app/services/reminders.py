"""Reminder schedules — med core module."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import PatientMedication, Reminder
from app.schemas.medications import FrequencyCode, ReminderSchedule

# Schedule prompts only — not clinical dosing advice.
FREQUENCY_DEFAULT_TIMES: dict[str, list[str]] = {
    "od": ["08:00"],
    "mane": ["08:00"],
    "nocte": ["21:00"],
    "bd": ["08:00", "20:00"],
    "tds": ["08:00", "14:00", "20:00"],
    "qds": ["08:00", "12:00", "16:00", "20:00"],
}

DEFAULT_TIMEZONE = "Australia/Sydney"


def default_times_for_frequency(frequency_code: FrequencyCode | str) -> list[str]:
    return list(FREQUENCY_DEFAULT_TIMES.get(str(frequency_code), ["08:00"]))


def create_reminder_for_patient_medication(
    db: Session,
    patient_medication_id: UUID,
    frequency_code: FrequencyCode | str,
    timezone: str = DEFAULT_TIMEZONE,
) -> Reminder:
    """Create or update a Reminder with default local times from frequency_code."""
    existing = db.scalar(
        select(Reminder).where(
            Reminder.patient_medication_id == patient_medication_id
        )
    )
    times = default_times_for_frequency(frequency_code)
    if existing is not None:
        existing.times_local = times
        existing.timezone = timezone
        return existing

    reminder = Reminder(
        patient_medication_id=patient_medication_id,
        times_local=times,
        timezone=timezone,
    )
    db.add(reminder)
    return reminder


def list_reminders(db: Session, user_id: UUID) -> list[ReminderSchedule]:
    rows = db.scalars(
        select(Reminder)
        .join(
            PatientMedication,
            Reminder.patient_medication_id == PatientMedication.id,
        )
        .where(PatientMedication.user_id == user_id)
    ).all()
    return [
        ReminderSchedule(
            patient_medication_id=r.patient_medication_id,
            times_local=list(r.times_local or []),
            timezone=r.timezone,
        )
        for r in rows
    ]


def upsert_reminder(
    db: Session, user_id: UUID, schedule: ReminderSchedule
) -> ReminderSchedule:
    row = db.get(PatientMedication, schedule.patient_medication_id)
    if row is None or row.user_id != user_id:
        msg = "Patient medication not found"
        raise LookupError(msg)

    existing = db.scalar(
        select(Reminder).where(
            Reminder.patient_medication_id == schedule.patient_medication_id
        )
    )
    if existing is None:
        existing = Reminder(
            patient_medication_id=schedule.patient_medication_id,
            times_local=list(schedule.times_local),
            timezone=schedule.timezone,
        )
        db.add(existing)
    else:
        existing.times_local = list(schedule.times_local)
        existing.timezone = schedule.timezone

    db.commit()
    db.refresh(existing)
    return ReminderSchedule(
        patient_medication_id=existing.patient_medication_id,
        times_local=list(existing.times_local or []),
        timezone=existing.timezone,
    )
