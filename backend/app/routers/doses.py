from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.constants import STUB_USER_ID
from app.database import get_db
from app.schemas.medications import (
    DoseMarkRequest,
    DoseMarkResponse,
    TodayDoseMedication,
)
from app.services import doses as doses_service
from app.services.users import ensure_stub_user

router = APIRouter(prefix="/api/v1/me/doses", tags=["doses"])


@router.get("/today", response_model=list[TodayDoseMedication])
def list_today_doses(
    locale: str = "en",
    db: Session = Depends(get_db),
) -> list[TodayDoseMedication]:
    ensure_stub_user(db)
    return doses_service.list_today_doses(db, STUB_USER_ID, locale)


@router.put("/{patient_medication_id}", response_model=DoseMarkResponse)
def mark_dose(
    patient_medication_id: UUID,
    payload: DoseMarkRequest,
    db: Session = Depends(get_db),
) -> DoseMarkResponse:
    ensure_stub_user(db)
    try:
        return doses_service.mark_dose(
            db, STUB_USER_ID, patient_medication_id, payload
        )
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
