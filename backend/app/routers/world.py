from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.schemas.world import DailyPressResponse, TreeState, WorldSummary
from app.services import world_trees as world_service

router = APIRouter(prefix="/api/v1/me", tags=["world"])


@router.get("/world", response_model=WorldSummary)
def get_world() -> WorldSummary:
    stub_user = UUID(int=0)
    return world_service.get_world(stub_user)


@router.get("/trees", response_model=list[TreeState])
def list_trees() -> list[TreeState]:
    stub_user = UUID(int=0)
    return world_service.list_trees(stub_user)


@router.get("/trees/{patient_medication_id}", response_model=TreeState)
def get_tree(patient_medication_id: UUID) -> TreeState:
    stub_user = UUID(int=0)
    tree = world_service.get_tree(stub_user, patient_medication_id)
    if tree is None:
        raise HTTPException(status_code=404, detail="Tree not found")
    return tree


@router.post(
    "/trees/{patient_medication_id}/daily-press",
    response_model=DailyPressResponse,
)
def daily_press(patient_medication_id: UUID) -> DailyPressResponse:
    stub_user = UUID(int=0)
    result = world_service.record_daily_press(stub_user, patient_medication_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Tree not found")
    return result
