from uuid import UUID

from fastapi import APIRouter

from app.schemas.carer import CarerMedicationList, PairingCodeResponse
from app.services import carer as carer_service

router = APIRouter(prefix="/api/v1", tags=["carer"])


@router.post("/me/carer/pairing-code", response_model=PairingCodeResponse)
def create_pairing_code() -> PairingCodeResponse:
    stub_patient = UUID(int=0)
    return carer_service.create_pairing_code(stub_patient)


@router.get("/carer/medications", response_model=CarerMedicationList)
def carer_medications() -> CarerMedicationList:
    """Read-only med list — no tree/engagement (see docs/SCHEMA_AND_API_CONTRACT.md)."""
    stub_carer = UUID(int=0)
    return carer_service.list_carer_medications(stub_carer)
