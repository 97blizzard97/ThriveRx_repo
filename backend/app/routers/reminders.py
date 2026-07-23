from uuid import UUID

from fastapi import APIRouter

from app.schemas.medications import ReminderSchedule
from app.services import reminders as reminders_service

router = APIRouter(prefix="/api/v1/me/reminders", tags=["reminders"])


@router.get("", response_model=list[ReminderSchedule])
def list_reminders() -> list[ReminderSchedule]:
    stub_user = UUID(int=0)
    return reminders_service.list_reminders(stub_user)


@router.put("/{patient_medication_id}", response_model=ReminderSchedule)
def set_reminder(
    patient_medication_id: UUID, schedule: ReminderSchedule
) -> ReminderSchedule:
    if schedule.patient_medication_id != patient_medication_id:
        schedule = schedule.model_copy(
            update={"patient_medication_id": patient_medication_id}
        )
    stub_user = UUID(int=0)
    return reminders_service.upsert_reminder(stub_user, schedule)
