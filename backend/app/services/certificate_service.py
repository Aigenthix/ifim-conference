"""
Certificate service — check status and get download URL.
"""
from __future__ import annotations

import uuid
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import NotFoundError
from app.models.event import Event
from app.models.user import User
from app.repositories.certificate_repo import CertificateRepository
from app.schemas.certificate import CertificateResponse
from app.services.feedback_service import FeedbackService


class CertificateService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = CertificateRepository(session)

    async def get_certificate(
        self, user_id: uuid.UUID, event_id: uuid.UUID
    ) -> CertificateResponse:
        cert = await self._repo.get_by_user_and_event(user_id, event_id)
        if not cert:
            raise NotFoundError("No certificate found. Submit feedback first.")

        return CertificateResponse(
            id=cert.id,
            user_id=cert.user_id,
            event_id=cert.event_id,
            pdf_url=cert.pdf_url,
            status=cert.status,
        )

    async def regenerate_certificate_pdf(
        self, user_id: uuid.UUID, event_id: uuid.UUID
    ) -> str:
        """
        Re-render certificate PDF using the latest template.
        This lets existing users pick up template fixes on next download.
        """
        cert = await self._repo.get_by_user_and_event(user_id, event_id)
        if not cert:
            raise NotFoundError("No certificate found. Submit feedback first.")

        user = await self._session.get(User, user_id)
        event = await self._session.get(Event, event_id)
        if not user or not event:
            raise NotFoundError("Certificate not found")

        pdf_buffer = FeedbackService._render_certificate_pdf(
            name=user.name,
            event_title=event.title,
            event_date=event.starts_at.strftime("%B %d, %Y"),
        )

        settings = get_settings()
        cert_dir = Path(settings.CERTIFICATES_DIR) / str(event_id)
        cert_dir.mkdir(parents=True, exist_ok=True)

        filename = f"{user_id}.pdf"
        cert_path = cert_dir / filename
        cert_path.write_bytes(pdf_buffer.getvalue())

        cert.pdf_url = f"/api/v1/certificates/download/{event_id}/{filename}"
        cert.status = "ready"
        await self._session.commit()

        return str(cert_path)
