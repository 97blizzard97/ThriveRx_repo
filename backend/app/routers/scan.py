import base64
import binascii
import re

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.medications import ScanScriptResponse
from app.services import scan as scan_service

router = APIRouter(prefix="/api/v1/scan", tags=["scan"])

_DATA_URL_RE = re.compile(
    r"^data:(image/[\w.+-]+);base64,(.+)$",
    re.DOTALL | re.IGNORECASE,
)


def _decode_image_base64(raw: str) -> tuple[bytes, str] | None:
    """Decode raw base64 or a data-URL; used by web clients over tunnels."""
    text = raw.strip()
    if not text:
        return None
    content_type = "image/jpeg"
    match = _DATA_URL_RE.match(text)
    if match:
        content_type = match.group(1).lower()
        text = match.group(2)
    # Whitespace/newlines from FormData are common.
    text = re.sub(r"\s+", "", text)
    try:
        return base64.b64decode(text, validate=False), content_type
    except (binascii.Error, ValueError):
        return None


@router.post("/script", response_model=ScanScriptResponse)
async def scan_script(
    db: Session = Depends(get_db),
    file: UploadFile | None = File(default=None),
    text_hint: str = Form(default=""),
    image_base64: str = Form(default=""),
) -> ScanScriptResponse:
    """Upload a script/label image and/or a typed hint; returns catalog matches.

    OCR runs on the backend when ``GOOGLE_API_KEY`` (AI Studio / Gemini)
    or ``OPENAI_API_KEY`` is configured. Without a key, pass ``text_hint``
    so fuzzy match still works for demos.

    Web / Cloudflare demos should prefer ``image_base64`` — multipart file
    parts often lose their filename through mobile browsers and get rejected.
    """
    image_bytes: bytes | None = None
    content_type = "image/jpeg"

    if image_base64.strip():
        decoded = _decode_image_base64(image_base64)
        if decoded is None:
            raise HTTPException(status_code=400, detail="Invalid image_base64")
        image_bytes, content_type = decoded
    elif file is not None:
        # Some clients send a non-file part named "file" (no filename) which
        # Starlette exposes as a plain string — reject that clearly.
        if not hasattr(file, "read"):
            raise HTTPException(
                status_code=400,
                detail="Invalid file upload — send image_base64 instead",
            )
        image_bytes = await file.read()
        if file.content_type:
            content_type = file.content_type

    if not image_bytes and not text_hint.strip():
        raise HTTPException(
            status_code=400,
            detail="Provide an image file, image_base64, and/or text_hint",
        )

    return scan_service.process_script_scan(
        db,
        image_bytes=image_bytes,
        content_type=content_type,
        text_hint=text_hint,
    )
