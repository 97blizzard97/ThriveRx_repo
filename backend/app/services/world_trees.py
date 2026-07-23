"""Trees and world — world module."""

import random
from datetime import date
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import PatientMedication, Tree
from app.schemas.common import GrowthStage
from app.schemas.world import DailyPressResponse, TreeState, WorldSummary

TREE_SPECIES = ("oak", "maple", "birch", "willow", "cedar")


def _tree_to_state(tree: Tree) -> TreeState:
    today = date.today()
    can_press = tree.last_press_date != today
    return TreeState(
        patient_medication_id=tree.patient_medication_id,
        species_key=tree.species_key,
        growth_stage=GrowthStage(tree.growth_stage),
        accumulated_growth_days=tree.accumulated_growth_days,
        can_press_today=can_press,
        last_press_date=tree.last_press_date,
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
    tree = Tree(
        patient_medication_id=patient_medication_id,
        species_key=random.choice(TREE_SPECIES),
        growth_stage=GrowthStage.budding.value,
    )
    db.add(tree)
    db.flush()
    return tree


def get_world(db: Session, user_id: UUID) -> WorldSummary:
    trees = _trees_for_user(db, user_id)
    states = [_tree_to_state(t) for t in trees]
    mature_count = sum(1 for t in trees if t.growth_stage == GrowthStage.mature.value)
    return WorldSummary(trees=states, world_expansion_level=mature_count)


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
    db.commit()
    db.refresh(tree)
    return DailyPressResponse(tree=_tree_to_state(tree), pressed=True)
