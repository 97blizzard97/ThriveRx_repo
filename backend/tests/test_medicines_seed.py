from sqlalchemy.orm import Session

from app.services.medicines import get_medicine, search_medicines
from app.services.seed_loader import load_medicines_seed


def test_load_seed_and_search(db: Session) -> None:
    count = load_medicines_seed(db)
    assert count == 15

    metformin = search_medicines(db, "metformin")
    assert len(metformin) == 1
    assert metformin[0].display_name == "Metformin"

    metformin_zh = search_medicines(db, "metformin", locale="zh")
    assert metformin_zh[0].display_name == "二甲双胍"

    all_meds = search_medicines(db, "")
    assert len(all_meds) == 15

    paracetamol_zh = search_medicines(db, "扑热")
    assert len(paracetamol_zh) == 1

    perindopril = search_medicines(db, "perindopril")
    assert len(perindopril) == 1
    assert perindopril[0].display_name == "Perindopril"

    detail = get_medicine(db, metformin[0].id, locale="vi")
    assert detail is not None
    assert detail.display_name == "Metformin"
    assert "đái tháo đường" in detail.what_its_for.lower()
    assert len(detail.common_strengths) >= 2
    assert detail.common_strengths[0].amount == 500
    assert detail.common_strengths[0].unit == "mg"

    salbutamol = search_medicines(db, "salbutamol")
    sal_detail = get_medicine(db, salbutamol[0].id)
    assert sal_detail is not None
    assert any(s.unit == "mcg" for s in sal_detail.common_strengths)
