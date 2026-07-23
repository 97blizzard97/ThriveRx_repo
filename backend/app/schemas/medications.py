from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class MedicineSummary(BaseModel):
    id: UUID
    display_name: str


class MedicineDetail(MedicineSummary):
    what_its_for: str
    how_usually_taken: str
    common_side_effects: str
    check_with_pharmacist_if: str
    translation_reviewed: bool = False


class PatientMedicationCreate(BaseModel):
    medicine_id: UUID
    indication_key: str | None = None


class PatientMedication(BaseModel):
    id: UUID
    medicine_id: UUID
    indication_key: str | None
    added_at: datetime


class ReminderSchedule(BaseModel):
    patient_medication_id: UUID
    times_local: list[str] = Field(
        ...,
        description="Local times HH:MM, e.g. ['08:00', '20:00']",
    )
    timezone: str = "Australia/Sydney"


class ScanMatch(BaseModel):
    medicine_id: UUID
    display_name: str
    confidence: float


class ScanScriptResponse(BaseModel):
    extracted_text: str
    matches: list[ScanMatch]
