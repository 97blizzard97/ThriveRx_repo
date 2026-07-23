from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.medications import MedicineDetail


class CarerMedicationItem(BaseModel):
    """Read-only carer view — med list + plain-language info only (PRD §7.4)."""

    patient_medication_id: UUID
    medicine: MedicineDetail


class CarerMedicationList(BaseModel):
    items: list[CarerMedicationItem] = Field(default_factory=list)


class PairingCodeResponse(BaseModel):
    code: str
    expires_in_seconds: int
