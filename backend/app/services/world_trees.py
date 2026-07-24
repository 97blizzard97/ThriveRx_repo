"""Trees and world — world module.

Growth-stage timeline (PRD §7.3, thresholds agreed 2026-07-24):

    day  0-1   budding (just planted)
    day  2-3   budding, sub-stage 1
    day  4-6   budding, sub-stage 2
    day  7-9   budding, sub-stage 3
    day 10-12  budding, sub-stage 4
    day 13-14  budding, sub-stage 5
    day 15     -> small        (continuous slow growth, no further discrete jump)
    day 60     -> large        (2 months; visual asset swap)
    day 180    -> mature       (6 months; visual asset swap, final size)

Past day 180 the tree itself stops growing further; continued daily presses
instead feed the surrounding world/planet expansion (extra saplings appearing
nearby), per PRD §7.3's "past the maturity cap" behavior. `accumulated_growth_days`
itself never decreases and is never reset — a missed day only pauses further
progress until the next press (see `record_daily_press`).
"""

import math
import random
from datetime import date
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import PatientMedication, Tree
from app.schemas.common import GrowthStage
from app.schemas.world import DailyPressResponse, TreeState, WorldSummary

TREE_SPECIES = ("oak", "maple", "birch", "willow", "cedar")

# Day (accumulated_growth_days) at which each budding sub-stage begins.
# Index 0 -> sub-stage 1, ... index 4 -> sub-stage 5.
BUDDING_SUBSTAGE_START_DAYS: tuple[int, ...] = (2, 4, 7, 10, 13)
BUDDING_SUBSTAGE_COUNT = len(BUDDING_SUBSTAGE_START_DAYS)

SMALL_START_DAY = 15
LARGE_START_DAY = 60
MATURE_START_DAY = 180

# Once mature, every this-many further accumulated days adds one "bonus"
# sapling/expansion unit to the world instead of growing the tree itself.
MATURE_EXPANSION_INTERVAL_DAYS = 30


def growth_stage_for_days(accumulated_growth_days: int) -> GrowthStage:
    if accumulated_growth_days >= MATURE_START_DAY:
        return GrowthStage.mature
    if accumulated_growth_days >= LARGE_START_DAY:
        return GrowthStage.large
    if accumulated_growth_days >= SMALL_START_DAY:
        return GrowthStage.small
    return GrowthStage.budding


def budding_substage_for_days(accumulated_growth_days: int) -> int | None:
    """1-5 while in the budding stage's numbered sub-stages, else None.

    Days 0-1 are the initial "just planted" look and also return None —
    callers distinguish that from "past budding" via `growth_stage`.
    """
    if accumulated_growth_days >= SMALL_START_DAY:
        return None
    substage = 0
    for i, threshold in enumerate(BUDDING_SUBSTAGE_START_DAYS, start=1):
        if accumulated_growth_days >= threshold:
            substage = i
    return substage or None


def stage_progress_for_days(
    stage: GrowthStage, accumulated_growth_days: int
) -> float:
    """0.0-1.0 progress through the current stage, for continuous size growth."""
    if stage == GrowthStage.mature:
        return 1.0
    start, end = {
        GrowthStage.budding: (0, SMALL_START_DAY),
        GrowthStage.small: (SMALL_START_DAY, LARGE_START_DAY),
        GrowthStage.large: (LARGE_START_DAY, MATURE_START_DAY),
    }[stage]
    progress = (accumulated_growth_days - start) / (end - start)
    return max(0.0, min(1.0, progress))


def mature_expansion_units_for_days(accumulated_growth_days: int) -> int:
    """Bonus world-expansion units a mature tree has earned past its cap."""
    if accumulated_growth_days < MATURE_START_DAY:
        return 0
    days_past_cap = accumulated_growth_days - MATURE_START_DAY
    return days_past_cap // MATURE_EXPANSION_INTERVAL_DAYS


def random_point_on_sphere() -> tuple[float, float]:
    """Uniformly-distributed random (lat, lon) in degrees.

    Using asin(2u-1) for latitude (rather than a plain uniform draw over
    [-90, 90]) avoids clustering points near the poles.
    """
    u, v = random.random(), random.random()
    lat = math.degrees(math.asin(2 * u - 1))
    lon = 360.0 * v - 180.0
    return lat, lon


def _tree_to_state(tree: Tree) -> TreeState:
    today = date.today()
    can_press = tree.last_press_date != today
    stage = growth_stage_for_days(tree.accumulated_growth_days)
    return TreeState(
        patient_medication_id=tree.patient_medication_id,
        species_key=tree.species_key,
        growth_stage=stage,
        budding_substage=budding_substage_for_days(tree.accumulated_growth_days),
        stage_progress=stage_progress_for_days(stage, tree.accumulated_growth_days),
        accumulated_growth_days=tree.accumulated_growth_days,
        can_press_today=can_press,
        last_press_date=tree.last_press_date,
        planet_lat=tree.planet_lat,
        planet_lon=tree.planet_lon,
    )


def _trees_for_user(db: Session, user_id: UUID) -> list[Tree]:
    return list(
        db.scalars(
            select(Tree)
            .join(PatientMedication)
            .where(PatientMedication.user_id == user_id)
            .options(joinedload(Tree.patient_medication))
        ).all()
    )


def create_tree_for_patient_medication(
    db: Session, patient_medication_id: UUID
) -> Tree:
    """Integration hook — called from med core after POST /me/medications."""
    existing = db.scalar(
        select(Tree).where(Tree.patient_medication_id == patient_medication_id)
    )
    if existing is not None:
        return existing
    lat, lon = random_point_on_sphere()
    tree = Tree(
        patient_medication_id=patient_medication_id,
        species_key=random.choice(TREE_SPECIES),
        growth_stage=GrowthStage.budding.value,
        planet_lat=lat,
        planet_lon=lon,
    )
    db.add(tree)
    db.flush()
    return tree


def get_world(db: Session, user_id: UUID) -> WorldSummary:
    trees = _trees_for_user(db, user_id)
    states = [_tree_to_state(t) for t in trees]
    expansion_level = sum(
        mature_expansion_units_for_days(t.accumulated_growth_days) for t in trees
    )
    return WorldSummary(trees=states, world_expansion_level=expansion_level)


def list_trees(db: Session, user_id: UUID) -> list[TreeState]:
    return [_tree_to_state(t) for t in _trees_for_user(db, user_id)]


def get_tree(
    db: Session, user_id: UUID, patient_medication_id: UUID
) -> TreeState | None:
    tree = db.scalar(
        select(Tree)
        .join(PatientMedication)
        .where(
            Tree.patient_medication_id == patient_medication_id,
            PatientMedication.user_id == user_id,
        )
    )
    if tree is None:
        return None
    return _tree_to_state(tree)


def record_daily_press(
    db: Session, user_id: UUID, patient_medication_id: UUID
) -> DailyPressResponse | None:
    tree = db.scalar(
        select(Tree)
        .join(PatientMedication)
        .where(
            Tree.patient_medication_id == patient_medication_id,
            PatientMedication.user_id == user_id,
        )
    )
    if tree is None:
        return None

    today = date.today()
    if tree.last_press_date == today:
        db.commit()
        return DailyPressResponse(tree=_tree_to_state(tree), pressed=False)

    tree.last_press_date = today
    tree.accumulated_growth_days += 1
    tree.growth_stage = growth_stage_for_days(tree.accumulated_growth_days).value
    db.commit()
    db.refresh(tree)
    return DailyPressResponse(tree=_tree_to_state(tree), pressed=True)
