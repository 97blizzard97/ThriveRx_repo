"""Trees and world — world module (stub until patient meds + DB exist)."""

from uuid import UUID

from app.schemas.world import DailyPressResponse, TreeState, WorldSummary


def get_world(user_id: UUID) -> WorldSummary:
    _ = user_id
    return WorldSummary(trees=[], world_expansion_level=0)


def list_trees(user_id: UUID) -> list[TreeState]:
    _ = user_id
    return []


def get_tree(user_id: UUID, patient_medication_id: UUID) -> TreeState | None:
    _ = user_id, patient_medication_id
    return None


def record_daily_press(
    user_id: UUID, patient_medication_id: UUID
) -> DailyPressResponse | None:
    _ = user_id, patient_medication_id
    return None
