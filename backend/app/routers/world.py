from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.constants import STUB_USER_ID
from app.database import get_db
from app.schemas.world import DailyPressResponse, TreeState, WorldSummary
from app.services import world_trees as world_service
from app.services.users import ensure_stub_user

router = APIRouter(prefix="/api/v1/me", tags=["world"])


@router.get("/world", response_model=WorldSummary)
def get_world(db: Session = Depends(get_db)) -> WorldSummary:
    ensure_stub_user(db)
    return world_service.get_world(db, STUB_USER_ID)


@router.get("/trees", response_model=list[TreeState])
def list_trees(db: Session = Depends(get_db)) -> list[TreeState]:
    ensure_stub_user(db)
    return world_service.list_trees(db, STUB_USER_ID)


@router.get("/trees/{patient_medication_id}", response_model=TreeState)
def get_tree(
    patient_medication_id: UUID,
    db: Session = Depends(get_db),
) -> TreeState:
    ensure_stub_user(db)
    tree = world_service.get_tree(db, STUB_USER_ID, patient_medication_id)
    if tree is None:
        raise HTTPException(status_code=404, detail="Tree not found")
    return tree


@router.post(
    "/trees/{patient_medication_id}/daily-press",
    response_model=DailyPressResponse,
)
def daily_press(
    patient_medication_id: UUID,
    db: Session = Depends(get_db),
) -> DailyPressResponse:
    ensure_stub_user(db)
    result = world_service.record_daily_press(db, STUB_USER_ID, patient_medication_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Tree not found")
    return result
