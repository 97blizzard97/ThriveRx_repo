"""Growth-stage thresholds and pause-not-reset behavior (PRD §7.3)."""

from datetime import date, timedelta

import pytest
from sqlalchemy.orm import Session

from app.constants import STUB_USER_ID
from app.models import Medicine, PatientMedication, Tree
from app.schemas.common import GrowthStage
from app.services import world_trees
from app.services.users import ensure_stub_user


@pytest.mark.parametrize(
    ("days", "expected"),
    [
        (0, GrowthStage.budding),
        (14, GrowthStage.budding),
        (15, GrowthStage.small),
        (59, GrowthStage.small),
        (60, GrowthStage.large),
        (179, GrowthStage.large),
        (180, GrowthStage.mature),
        (400, GrowthStage.mature),
    ],
)
def test_growth_stage_for_days(days: int, expected: GrowthStage) -> None:
    assert world_trees.growth_stage_for_days(days) == expected


@pytest.mark.parametrize(
    ("days", "expected_substage"),
    [
        (0, None),
        (1, None),
        (2, 1),
        (3, 1),
        (4, 2),
        (6, 2),
        (7, 3),
        (9, 3),
        (10, 4),
        (12, 4),
        (13, 5),
        (14, 5),
        (15, None),  # past budding entirely
        (100, None),
    ],
)
def test_budding_substage_for_days(days: int, expected_substage: int | None) -> None:
    assert world_trees.budding_substage_for_days(days) == expected_substage


def test_stage_progress_ramps_within_each_stage() -> None:
    assert world_trees.stage_progress_for_days(GrowthStage.budding, 0) == 0.0
    assert world_trees.stage_progress_for_days(GrowthStage.small, 15) == 0.0
    assert world_trees.stage_progress_for_days(GrowthStage.large, 60) == 0.0
    assert world_trees.stage_progress_for_days(GrowthStage.mature, 180) == 1.0
    assert world_trees.stage_progress_for_days(GrowthStage.mature, 10_000) == 1.0

    small_mid = world_trees.stage_progress_for_days(GrowthStage.small, 37)
    assert 0.0 < small_mid < 1.0


@pytest.mark.parametrize(
    ("days", "expected_units"),
    [
        (179, 0),
        (180, 0),
        (209, 0),
        (210, 1),
        (239, 1),
        (240, 2),
    ],
)
def test_mature_expansion_units_for_days(days: int, expected_units: int) -> None:
    assert world_trees.mature_expansion_units_for_days(days) == expected_units


def _make_tree(db: Session, accumulated_growth_days: int = 0) -> Tree:
    ensure_stub_user(db)
    medicine = Medicine(names={"en": "Test Med"}, content={}, source_metadata={})
    db.add(medicine)
    db.flush()
    patient_medication = PatientMedication(
        user_id=STUB_USER_ID, medicine_id=medicine.id
    )
    db.add(patient_medication)
    db.flush()
    tree = world_trees.create_tree_for_patient_medication(db, patient_medication.id)
    tree.accumulated_growth_days = accumulated_growth_days
    db.commit()
    db.refresh(tree)
    return tree


def test_tree_gets_random_persisted_planet_position(db: Session) -> None:
    """Position is generated once at creation and stays stable on refetch."""
    tree = _make_tree(db)
    assert -90.0 <= tree.planet_lat <= 90.0
    assert -180.0 <= tree.planet_lon <= 180.0

    first = world_trees.get_tree(db, STUB_USER_ID, tree.patient_medication_id)
    second = world_trees.get_tree(db, STUB_USER_ID, tree.patient_medication_id)
    assert first is not None and second is not None
    assert first.planet_lat == second.planet_lat
    assert first.planet_lon == second.planet_lon


def test_tree_state_reflects_derived_stage_not_stale_column(db: Session) -> None:
    """growth_stage/sub-stage/progress are always recomputed from days, so a
    tree created before this logic existed (or edited directly) still reports
    correctly — no drift between the stored column and the real thresholds."""
    tree = _make_tree(db, accumulated_growth_days=61)
    tree.growth_stage = "budding"  # simulate a stale/out-of-sync stored value
    db.commit()

    state = world_trees.get_tree(db, STUB_USER_ID, tree.patient_medication_id)
    assert state is not None
    assert state.growth_stage == GrowthStage.large
    assert state.budding_substage is None


def test_daily_press_pauses_not_resets_on_missed_days(db: Session) -> None:
    """A gap of any length between presses must never decrease
    accumulated_growth_days — it only advances by 1 on the next valid press."""
    tree = _make_tree(db, accumulated_growth_days=5)
    tree.last_press_date = date.today() - timedelta(days=10)  # missed 9 days
    db.commit()

    result = world_trees.record_daily_press(
        db, STUB_USER_ID, tree.patient_medication_id
    )
    assert result is not None
    assert result.pressed is True
    assert result.tree.accumulated_growth_days == 6  # +1, regardless of gap size
    assert result.tree.last_press_date == date.today()


def test_daily_press_idempotent_same_day(db: Session) -> None:
    tree = _make_tree(db, accumulated_growth_days=3)
    tree.last_press_date = date.today()
    db.commit()

    result = world_trees.record_daily_press(
        db, STUB_USER_ID, tree.patient_medication_id
    )
    assert result is not None
    assert result.pressed is False
    assert result.tree.accumulated_growth_days == 3


def test_mature_tree_stops_growing_stage_but_feeds_world_expansion(
    db: Session,
) -> None:
    tree = _make_tree(db, accumulated_growth_days=209)
    world = world_trees.get_world(db, STUB_USER_ID)
    assert world.trees[0].growth_stage == GrowthStage.mature
    assert world.world_expansion_level == 0

    tree.accumulated_growth_days = 210
    db.commit()
    world = world_trees.get_world(db, STUB_USER_ID)
    assert world.trees[0].growth_stage == GrowthStage.mature  # capped, no further stage
    assert world.world_expansion_level == 1  # but the world/planet gained a bonus unit
