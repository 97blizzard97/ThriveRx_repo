"""Script OCR + fuzzy match — med core module."""

from __future__ import annotations

import base64
import logging
import re

import httpx
from rapidfuzz import fuzz
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Medicine
from app.schemas.medications import ScanMatch, ScanScriptResponse

logger = logging.getLogger(__name__)

# Minimum score (0–100) to surface a catalog match.
_MIN_SCORE = 55.0
_MAX_MATCHES = 5

# Common Australian brand / synonym → catalog English generic (demo catalog only).
_AU_BRAND_ALIASES: dict[str, str] = {
    "diabex": "metformin",
    "diaformin": "metformin",
    "formet": "metformin",
    "glucophage": "metformin",
    "panadol": "paracetamol",
    "panamax": "paracetamol",
    "herron": "paracetamol",
    "amoxil": "amoxicillin",
    "alphamox": "amoxicillin",
    "coversyl": "perindopril",
    "perindo": "perindopril",
    "micardis": "telmisartan",
    "cartia": "aspirin",
    "astrix": "aspirin",
    "cardiprin": "aspirin",
    "betaloc": "metoprolol",
    "minax": "metoprolol",
    "lopressor": "metoprolol",
    "nurofen": "ibuprofen",
    "brufen": "ibuprofen",
    "norvasc": "amlodipine",
    "ozlodip": "amlodipine",
    "crestor": "rosuvastatin",
    "zofran": "ondansetron",
    "ventolin": "salbutamol",
    "asmol": "salbutamol",
    "airomir": "salbutamol",
    "zoloft": "sertraline",
    "eleva": "sertraline",
    "lasix": "furosemide",
    "uremide": "furosemide",
    "fosamax": "alendronate",
    "alendro": "alendronate",
    "alendronic acid": "alendronate",
    "acetaminophen": "paracetamol",
    "albuterol": "salbutamol",
}

_AU_SCRIPT_OCR_PROMPT = """
You are reading a photo of an Australian medicine prescription (PBS-style script)
or an Australian pharmacy / pack label.

Extract ONLY what is visible. Prefer the medicine (drug) name lines — often near
strength (mg, mcg, mL), form (tablet, capsule, inhaler), and directions
(e.g. BD, TDS, mane, nocte, OD).

Rules:
- Return plain text only.
- One medicine name (generic and/or brand if both shown) per line.
- Include strength on the same line when visible (e.g. "Metformin 500 mg").
- Ignore patient name, address, doctor provider number, PBS authority codes,
  pharmacy address, and barcodes unless they contain a drug name.
- Do not invent medicines that are not clearly visible.
- If handwriting is unclear, omit that line rather than guess.
""".strip()


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def expand_au_aliases(text: str) -> str:
    """Append catalog generics when known AU brand names appear in OCR text."""
    normalized = _normalize(text)
    if not normalized:
        return ""
    extras: list[str] = []
    for brand, generic in _AU_BRAND_ALIASES.items():
        if brand in normalized and generic not in normalized:
            extras.append(generic)
    if not extras:
        return text
    return text + "\n" + "\n".join(extras)


def _medicine_names(medicine: Medicine) -> list[str]:
    names = medicine.names or {}
    out: list[str] = []
    for key in ("en", "zh", "vi"):
        value = names.get(key)
        if value:
            out.append(str(value))
    # Also score against known brands that map to this generic.
    en = _normalize(str(names.get("en") or ""))
    for brand, generic in _AU_BRAND_ALIASES.items():
        if generic == en:
            out.append(brand)
    return out


def _display_name(medicine: Medicine) -> str:
    names = medicine.names or {}
    return str(names.get("en") or names.get("zh") or names.get("vi") or "Unknown")


def fuzzy_match_catalog(
    db: Session, query_text: str, *, limit: int = _MAX_MATCHES
) -> list[ScanMatch]:
    """Match free text (OCR or typed hint) against curated catalog names."""
    text = _normalize(expand_au_aliases(query_text))
    if not text:
        return []

    medicines = list(db.scalars(select(Medicine)).all())
    scored: list[tuple[float, Medicine]] = []
    for medicine in medicines:
        best = 0.0
        for name in _medicine_names(medicine):
            normalized = _normalize(name)
            if not normalized:
                continue
            # Prefer containment for short catalog names inside longer OCR blobs.
            if normalized in text:
                ratio = 100.0
            else:
                ratio = float(
                    max(
                        fuzz.partial_ratio(normalized, text),
                        fuzz.token_set_ratio(normalized, text),
                    )
                )
            best = max(best, ratio)
        if best >= _MIN_SCORE:
            scored.append((best, medicine))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [
        ScanMatch(
            medicine_id=medicine.id,
            display_name=_display_name(medicine),
            confidence=round(score / 100.0, 3),
        )
        for score, medicine in scored[:limit]
    ]


def _mime_type(content_type: str) -> str:
    return content_type if content_type.startswith("image/") else "image/jpeg"


def _ocr_with_gemini(image_bytes: bytes, content_type: str) -> str:
    api_key = (settings.google_api_key or "").strip()
    if not api_key:
        return ""

    mime = _mime_type(content_type)
    b64 = base64.standard_b64encode(image_bytes).decode("ascii")
    model = (settings.google_vision_model or "gemini-3.1-flash-lite").strip()
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent"
    )
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": _AU_SCRIPT_OCR_PROMPT},
                    {"inline_data": {"mime_type": mime, "data": b64}},
                ]
            }
        ],
        # Newer Gemini models may spend tokens on "thinking"; keep headroom.
        "generationConfig": {"maxOutputTokens": 1024},
    }
    try:
        response = httpx.post(
            url,
            params={"key": api_key},
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=60.0,
        )
        response.raise_for_status()
        data = response.json()
        parts = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [])
        )
        texts = [str(part.get("text") or "") for part in parts]
        return "\n".join(t for t in texts if t).strip()
    except Exception:
        logger.exception("Gemini vision OCR failed")
        return ""


def _ocr_with_openai(image_bytes: bytes, content_type: str) -> str:
    api_key = (settings.openai_api_key or "").strip()
    if not api_key:
        return ""

    mime = _mime_type(content_type)
    b64 = base64.standard_b64encode(image_bytes).decode("ascii")
    payload = {
        "model": settings.openai_vision_model,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": _AU_SCRIPT_OCR_PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime};base64,{b64}"},
                    },
                ],
            }
        ],
        "max_tokens": 400,
    }
    try:
        response = httpx.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=60.0,
        )
        response.raise_for_status()
        data = response.json()
        return str(data["choices"][0]["message"]["content"] or "").strip()
    except Exception:
        logger.exception("OpenAI vision OCR failed")
        return ""


def extract_text_from_image(
    image_bytes: bytes, content_type: str = "image/jpeg"
) -> str:
    """OCR when configured; otherwise empty (client may supply text_hint)."""
    if not image_bytes:
        return ""
    # Prefer Google AI Studio (Gemini); fall back to OpenAI if set.
    text = _ocr_with_gemini(image_bytes, content_type)
    if text:
        return text
    return _ocr_with_openai(image_bytes, content_type)


def process_script_scan(
    db: Session,
    *,
    image_bytes: bytes | None = None,
    content_type: str = "image/jpeg",
    text_hint: str = "",
) -> ScanScriptResponse:
    """OCR (optional) + fuzzy match; text_hint helps when OCR is unavailable."""
    ocr_text = ""
    if image_bytes:
        ocr_text = extract_text_from_image(image_bytes, content_type)

    hint = text_hint.strip()
    combined = " ".join(part for part in (ocr_text, hint) if part)
    matches = fuzzy_match_catalog(db, combined)
    return ScanScriptResponse(
        extracted_text=ocr_text or hint,
        matches=matches,
    )
