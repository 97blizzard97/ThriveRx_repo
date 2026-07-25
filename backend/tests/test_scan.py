from sqlalchemy.orm import Session

from app.models import Medicine
from app.services.scan import (
    expand_au_aliases,
    fuzzy_match_catalog,
    process_script_scan,
)


def _seed_med(db: Session, name_en: str) -> Medicine:
    medicine = Medicine(
        names={"en": name_en, "zh": name_en, "vi": name_en},
        content={"en": {"what_its_for": "demo"}},
        source_metadata={"status": "test"},
        common_strengths=[],
    )
    db.add(medicine)
    db.commit()
    db.refresh(medicine)
    return medicine


def test_fuzzy_match_finds_metformin(db: Session) -> None:
    _seed_med(db, "Metformin")
    _seed_med(db, "Amoxicillin")
    matches = fuzzy_match_catalog(db, "Patient to take metformin 500mg BD")
    assert matches
    assert matches[0].display_name == "Metformin"
    assert matches[0].confidence >= 0.55


def test_fuzzy_match_partial_name(db: Session) -> None:
    _seed_med(db, "Perindopril")
    matches = fuzzy_match_catalog(db, "perindop")
    assert len(matches) == 1
    assert matches[0].display_name == "Perindopril"


def test_process_script_scan_text_hint_only(db: Session) -> None:
    _seed_med(db, "Aspirin")
    result = process_script_scan(db, text_hint="aspirin night dose")
    assert "aspirin" in result.extracted_text.lower()
    assert result.matches
    assert result.matches[0].display_name == "Aspirin"


def test_scan_script_endpoint_text_hint(client, db: Session) -> None:
    _seed_med(db, "Ibuprofen")
    response = client.post(
        "/api/v1/scan/script",
        data={"text_hint": "ibuprofen for pain"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["matches"]
    assert body["matches"][0]["display_name"] == "Ibuprofen"


def test_scan_script_requires_input(client) -> None:
    response = client.post("/api/v1/scan/script", data={})
    assert response.status_code == 400


def test_scan_script_accepts_image_base64(client, db: Session) -> None:
    """Web/Cloudflare path: base64 string field (no multipart filename)."""
    import base64

    _seed_med(db, "Metformin")
    # 1x1 PNG
    png = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    )
    data_url = "data:image/png;base64," + base64.b64encode(png).decode("ascii")
    response = client.post(
        "/api/v1/scan/script",
        data={
            "image_base64": data_url,
            "text_hint": "metformin 500mg",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["matches"]
    assert body["matches"][0]["display_name"] == "Metformin"


def test_au_brand_alias_matches_generic(db: Session) -> None:
    _seed_med(db, "Metformin")
    expanded = expand_au_aliases("Rx: Diabex 500mg BD")
    assert "metformin" in expanded.lower()
    matches = fuzzy_match_catalog(db, "Diabex 500mg tablets")
    assert matches
    assert matches[0].display_name == "Metformin"


def test_au_brand_ventolin_matches_salbutamol(db: Session) -> None:
    _seed_med(db, "Salbutamol")
    matches = fuzzy_match_catalog(db, "Ventolin inhaler PRN")
    assert matches
    assert matches[0].display_name == "Salbutamol"
