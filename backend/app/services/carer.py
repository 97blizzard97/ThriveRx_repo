"""Carer pairing and read-only med view — med core module (strict boundary)."""

from uuid import UUID

from app.schemas.carer import CarerMedicationList, PairingCodeResponse


def create_pairing_code(patient_user_id: UUID) -> PairingCodeResponse:
    _ = patient_user_id
    return PairingCodeResponse(code="STUB-CODE", expires_in_seconds=3600)


def list_carer_medications(carer_user_id: UUID) -> CarerMedicationList:
    """Must never include tree, press, or adherence data."""
    _ = carer_user_id
    return CarerMedicationList(items=[])
