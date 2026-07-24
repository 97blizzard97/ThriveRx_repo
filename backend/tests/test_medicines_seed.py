from sqlalchemy.orm import Session

from app.services.medicines import search_medicines
from app.services.seed_loader import load_medicines_seed


def test_load_seed_and_search(db: Session) -> None:
    count = load_medicines_seed(db)
    assert count == 3

    metformin = search_medicines(db, "metformin")
    assert len(metformin) == 1
    assert metformin[0].display_name == "Metformin"

    all_meds = search_medicines(db, "")
    assert len(all_meds) == 3

    paracetamol_zh = search_medicines(db, "扑热")
    assert len(paracetamol_zh) == 1
