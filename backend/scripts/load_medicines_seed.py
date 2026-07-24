"""Load demo medicine catalog from seeds/medicines.json into the database."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.database import SessionLocal
from app.services.seed_loader import load_medicines_seed


def main() -> None:
    db = SessionLocal()
    try:
        count = load_medicines_seed(db)
        print(f"Loaded {count} medicine(s) from seeds/medicines.json")
    finally:
        db.close()


if __name__ == "__main__":
    main()
