from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

MedicationForm = Literal["tablet", "capsule", "liquid", "inhaler"]
DoseUnit = Literal["mg", "g", "mL", "mcg", "puff"]
FrequencyCode = Literal["od", "bd", "tds", "qds", "mane", "nocte"]
DoseStatus = Literal["taken", "skipped"]


def _validate_hhmm(value: str) -> str:
    parts = value.split(":")
    if len(parts) != 2:
        msg = "time_local must be HH:MM"
        raise ValueError(msg)
    hour_s, minute_s = parts
    if not (hour_s.isdigit() and minute_s.isdigit()):
        msg = "time_local must be HH:MM"
        raise ValueError(msg)
    hour, minute = int(hour_s), int(minute_s)
    if not (0 <= hour <= 23 and 0 <= minute <= 59):
        msg = "time_local must be a valid clock time"
        raise ValueError(msg)
    return f"{hour:02d}:{minute:02d}"


class CommonStrength(BaseModel):
    amount: float
    unit: DoseUnit | str


class MedicineSummary(BaseModel):
    id: UUID
    display_name: str


class MedicineDetail(MedicineSummary):
    what_its_for: str
    how_usually_taken: str
    common_side_effects: str
    check_with_pharmacist_if: str
    translation_reviewed: bool = False
    common_strengths: list[CommonStrength] = Field(default_factory=list)


class PatientMedicationCreate(BaseModel):
    medicine_id: UUID
    indication_key: str | None = None
    form: MedicationForm
    dose_amount: float
    dose_unit: DoseUnit
    frequency_code: FrequencyCode
    with_food: bool | None = None


class PatientMedicationUpdate(BaseModel):
    form: MedicationForm
    dose_amount: float
    dose_unit: DoseUnit
    frequency_code: FrequencyCode
    with_food: bool | None = None


class PatientMedication(BaseModel):
    id: UUID
    medicine_id: UUID
    indication_key: str | None
    form: MedicationForm
    dose_amount: float
    dose_unit: DoseUnit
    frequency_code: FrequencyCode
    with_food: bool | None
    added_at: datetime
    times_local: list[str] = Field(
        default_factory=list,
        description="From Reminder; schedule prompts only",
    )


class ReminderSchedule(BaseModel):
    patient_medication_id: UUID
    times_local: list[str] = Field(
        ...,
        description="Local times HH:MM, e.g. ['08:00', '20:00']",
    )
    timezone: str = "Australia/Sydney"

    @field_validator("times_local")
    @classmethod
    def normalize_times(cls, value: list[str]) -> list[str]:
        if not value:
            msg = "times_local must include at least one time"
            raise ValueError(msg)
        return [_validate_hhmm(item) for item in value]


class DoseSlot(BaseModel):
    time_local: str
    status: DoseStatus | None = None


class TodayDoseMedication(BaseModel):
    patient_medication_id: UUID
    medicine_id: UUID
    display_name: str
    local_date: date
    slots: list[DoseSlot]
    all_taken: bool
    can_grow_today: bool = Field(
        description=(
            "True when this med's tree has not yet received today's daily press. "
            "Completing all slots as Taken records the press. Soft UI hint only — "
            "no points or streaks."
        ),
    )


class DoseMarkRequest(BaseModel):
    time_local: str
    status: DoseStatus

    @field_validator("time_local")
    @classmethod
    def normalize_time(cls, value: str) -> str:
        return _validate_hhmm(value)


class DoseMarkResponse(BaseModel):
    patient_medication_id: UUID
    local_date: date
    time_local: str
    status: DoseStatus
    all_taken: bool
    daily_press_recorded: bool = Field(
        description=(
            "True only when this mark completed all Taken slots and a new "
            "daily press was recorded"
        ),
    )


class ScanMatch(BaseModel):
    medicine_id: UUID
    display_name: str
    confidence: float


class ScanScriptResponse(BaseModel):
    extracted_text: str
    matches: list[ScanMatch]

