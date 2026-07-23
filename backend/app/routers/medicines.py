from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.constants import STUB_USER_ID
from app.database import get_db
from app.schemas.medications import (
    MedicineDetail,
    MedicineSummary,
    PatientMedication,
    PatientMedicationCreate,
)
from app.services import medicines as medicines_service
from app.services.users import ensure_stub_user

router = APIRouter(prefix="/api/v1/medicines", tags=["medications"])


@router.get("/search", response_model=list[MedicineSummary])
def search_medicines(
    q: str = "",
    db: Session = Depends(get_db),
) -> list[MedicineSummary]:
    return medicines_service.search_medicines(db, q)


@router.get("/{medicine_id}", response_model=MedicineDetail)
def get_medicine(
    medicine_id: UUID,
    db: Session = Depends(get_db),
) -> MedicineDetail:
    detail = medicines_service.get_medicine(db, medicine_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return detail


me_router = APIRouter(prefix="/api/v1/me/medications", tags=["medications"])


@me_router.get("", response_model=list[PatientMedication])
def list_my_medications(db: Session = Depends(get_db)) -> list[PatientMedication]:
    ensure_stub_user(db)
    return medicines_service.list_patient_medications(db, STUB_USER_ID)


@me_router.post("", response_model=PatientMedication, status_code=201)
def add_my_medication(
    payload: PatientMedicationCreate,
    db: Session = Depends(get_db),
) -> PatientMedication:
    ensure_stub_user(db)
    try:
        return medicines_service.add_patient_medication(db, STUB_USER_ID, payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@me_router.delete("/{patient_medication_id}", status_code=204)
def remove_my_medication(
    patient_medication_id: UUID,
    db: Session = Depends(get_db),
) -> None:
    ensure_stub_user(db)
    try:
        medicines_service.remove_patient_medication(
            db, STUB_USER_ID, patient_medication_id
        )
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
