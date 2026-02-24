"""Certificate repository."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.certificate import Certificate
from app.repositories.base import BaseRepository


class CertificateRepository(BaseRepository[Certificate]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Certificate, session)

    async def get_by_user_and_event(
        self, user_id: uuid.UUID, event_id: uuid.UUID
    ) -> Certificate | None:
        stmt = select(Certificate).where(
            Certificate.user_id == user_id,
            Certificate.event_id == event_id,
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()
