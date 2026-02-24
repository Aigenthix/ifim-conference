"""
Certificate service — check status and get download URL.
"""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.repositories.certificate_repo import CertificateRepository
from app.schemas.certificate import CertificateResponse


class CertificateService:
    def __init__(self, session: AsyncSession) -> None:
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
