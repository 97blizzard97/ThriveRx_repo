"""Load curated medicines from backend/seeds/medicines.json into the DB."""

from __future__ import annotations

import json
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from app.models import Medicine

SEEDS_PATH = Path(__file__).resolve().parents[1] / "seeds" / "medicines.json"


def load_medicines_seed(db: Session) -> int:
    raw = json.loads(SEEDS_PATH.read_text(encoding="utf-8"))
    entries = raw.get("medicines", [])
    inserted = 0
    for entry in entries:
        med_id = entry.get("id")
        medicine = Medicine(
            id=uuid.UUID(med_id) if med_id else uuid.uuid4(),
            names=entry.get("names", {}),
            content=entry.get("content", {}),
            source_metadata=entry.get("source_metadata", {}),
        )
        db.merge(medicine)
        inserted += 1
    db.commit()
    return inserted
