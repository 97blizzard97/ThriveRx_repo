"""Script OCR + fuzzy match — med core module."""

from app.schemas.medications import ScanScriptResponse


def process_script_image(image_bytes: bytes) -> ScanScriptResponse:
    _ = image_bytes
    return ScanScriptResponse(extracted_text="", matches=[])
