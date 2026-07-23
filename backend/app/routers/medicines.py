from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.schemas.medications import (
    MedicineDetail,
    MedicineSummary,
    PatientMedication,
    PatientMedicationCreate,
)
from app.services import medicines as medicines_service

router = APIRouter(prefix="/api/v1/medicines", tags=["medications"])


@router.get("/search", response_model=list[MedicineSummary])
def search_medicines(q: str = "") -> list[MedicineSummary]:
    return medicines_service.search_medicines(q)


@router.get("/{medicine_id}", response_model=MedicineDetail)
def get_medicine(medicine_id: UUID) -> MedicineDetail:
    detail = medicines_service.get_medicine(medicine_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return detail


me_router = APIRouter(prefix="/api/v1/me/medications", tags=["medications"])


@me_router.get("", response_model=list[PatientMedication])
def list_my_medications() -> list[PatientMedication]:
    # TODO: resolve user from session
    stub_user = UUID(int=0)
    return medicines_service.list_patient_medications(stub_user)


@me_router.post("", status_code=501)
def add_my_medication(payload: PatientMedicationCreate) -> PatientMedication:
    _ = payload
    raise HTTPException(status_code=501, detail="Stub — wire DB and tree creation hook")


@me_router.delete("/{patient_medication_id}", status_code=501)
def remove_my_medication(patient_medication_id: UUID) -> None:
    _ = patient_medication_id
    raise HTTPException(status_code=501, detail="Stub — wire DB")
