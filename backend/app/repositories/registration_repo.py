"""Registration repository."""
from __future__ import annotations

import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.registration import Registration
from app.repositories.base import BaseRepository


class RegistrationRepository(BaseRepository[Registration]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Registration, session)

    async def get_by_user_and_event(
        self, user_id: uuid.UUID, event_id: uuid.UUID
    ) -> Registration | None:
        stmt = select(Registration).where(
            Registration.user_id == user_id,
            Registration.event_id == event_id,
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def count_by_event(self, event_id: uuid.UUID) -> int:
        stmt = (
            select(func.count())
            .select_from(Registration)
            .where(Registration.event_id == event_id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def is_registered(
        self, user_id: uuid.UUID, event_id: uuid.UUID
    ) -> bool:
        return (await self.get_by_user_and_event(user_id, event_id)) is not None
