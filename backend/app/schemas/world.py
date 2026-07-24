from datetime import date
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.common import GrowthStage


class TreeState(BaseModel):
    patient_medication_id: UUID
    species_key: str
    growth_stage: GrowthStage
    budding_substage: int | None = Field(
        default=None,
        ge=1,
        le=5,
        description=(
            "1-5 while budding (days 2/4/7/10/13 thresholds); None once past "
            "budding, and also None on days 0-1 (initial 'just planted' look)."
        ),
    )
    stage_progress: float = Field(
        ge=0.0,
        le=1.0,
        description=(
            "0-1 progress through the current stage, for continuous size "
            "growth within small/large; always 1.0 once mature."
        ),
    )
    accumulated_growth_days: int = Field(
        ge=0,
        description="Never decreases; pauses when daily press missed",
    )
    can_press_today: bool
    last_press_date: date | None = None
    planet_lat: float = Field(
        ge=-90,
        le=90,
        description="Random position on the world/planet sphere, fixed at creation",
    )
    planet_lon: float = Field(ge=-180, le=180)


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
