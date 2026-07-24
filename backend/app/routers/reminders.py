from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.constants import STUB_USER_ID
from app.database import get_db
from app.schemas.medications import ReminderSchedule
from app.services import reminders as reminders_service
from app.services.users import ensure_stub_user

router = APIRouter(prefix="/api/v1/me/reminders", tags=["reminders"])


@router.get("", response_model=list[ReminderSchedule])
def list_reminders(db: Session = Depends(get_db)) -> list[ReminderSchedule]:
    ensure_stub_user(db)
    return reminders_service.list_reminders(db, STUB_USER_ID)


@router.put("/{patient_medication_id}", response_model=ReminderSchedule)
def set_reminder(
    patient_medication_id: UUID,
    schedule: ReminderSchedule,
    db: Session = Depends(get_db),
) -> ReminderSchedule:
    if schedule.patient_medication_id != patient_medication_id:
        schedule = schedule.model_copy(
            update={"patient_medication_id": patient_medication_id}
        )
    ensure_stub_user(db)
    try:
        return reminders_service.upsert_reminder(db, STUB_USER_ID, schedule)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
