"""Certificate routes — download from local disk."""
from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.api.deps import CurrentUser, DBSession
from app.core.config import get_settings
from app.core.exceptions import NotFoundError
from app.schemas.certificate import CertificateResponse
from app.services.certificate_service import CertificateService

router = APIRouter(prefix="/certificates", tags=["certificates"])


@router.get(
    "/me",
    response_model=CertificateResponse,
    summary="Get my certificate status for current event",
)
async def get_my_certificate(
    user: CurrentUser,
    session: DBSession,
) -> CertificateResponse:
    service = CertificateService(session=session)
    return await service.get_certificate(
        user_id=user.user_id,
        event_id=user.event_id,
    )


@router.get(
    "/download/{event_id}/{filename}",
    summary="Download certificate PDF",
    response_class=FileResponse,
)
async def download_certificate(
    event_id: uuid.UUID,
    filename: str,
    user: CurrentUser,
) -> FileResponse:
    """Serve certificate PDF from local disk — only the owner can download."""
    settings = get_settings()

    # Ensure the user can only download their own certificate
    expected_filename = f"{user.user_id}.pdf"
    if filename != expected_filename:
        raise NotFoundError("You can only download your own certificate")

    cert_path = Path(settings.CERTIFICATES_DIR) / str(event_id) / filename

    # Security: prevent path traversal
    try:
        cert_path.resolve().relative_to(Path(settings.CERTIFICATES_DIR).resolve())
    except ValueError:
        raise NotFoundError("Certificate not found")

    if not cert_path.exists():
        raise NotFoundError("Certificate not found")

    return FileResponse(
        path=str(cert_path),
        filename=filename,
        media_type="application/pdf",
    )


@router.get(
    "/image/{event_id}/{filename:path}",
    summary="Download certificate image",
    response_class=FileResponse,
)
async def download_certificate_image(
    event_id: uuid.UUID,
    filename: str,
    user: CurrentUser,
) -> FileResponse:
    """Serve certificate image (JPG) from local disk."""
    settings = get_settings()

    cert_path = Path(settings.CERTIFICATES_DIR) / str(event_id) / filename

    # Security: prevent path traversal
    try:
        cert_path.resolve().relative_to(Path(settings.CERTIFICATES_DIR).resolve())
    except ValueError:
        raise NotFoundError("Certificate not found")

    if not cert_path.exists():
        raise NotFoundError("Certificate not found")

    # Determine media type
    suffix = cert_path.suffix.lower()
    media_type = "image/jpeg" if suffix in (".jpg", ".jpeg") else "image/png"

    return FileResponse(
        path=str(cert_path),
        filename=filename,
        media_type=media_type,
    )
