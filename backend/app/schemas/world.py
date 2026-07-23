from datetime import date
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.common import GrowthStage


class TreeState(BaseModel):
    patient_medication_id: UUID
    species_key: str
    growth_stage: GrowthStage
    accumulated_growth_days: int = Field(
        ge=0,
        description="Never decreases; pauses when daily press missed",
    )
    can_press_today: bool
    last_press_date: date | None = None


class WorldSummary(BaseModel):
    trees: list[TreeState]
    world_expansion_level: int = Field(
        0,
        ge=0,
        description="Increases when mature trees trigger environment growth (PRD §7.3)",
    )


class DailyPressResponse(BaseModel):
    tree: TreeState
    pressed: bool = Field(
        description="False if already pressed today (idempotent response)",
    )
