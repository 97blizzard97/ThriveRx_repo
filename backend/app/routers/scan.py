from fastapi import APIRouter, File, UploadFile

from app.schemas.medications import ScanScriptResponse
from app.services import scan as scan_service

router = APIRouter(prefix="/api/v1/scan", tags=["scan"])


@router.post("/script", response_model=ScanScriptResponse)
async def scan_script(
    file: UploadFile = File(...),
) -> ScanScriptResponse:
    image_bytes = await file.read()
    return scan_service.process_script_image(image_bytes)
