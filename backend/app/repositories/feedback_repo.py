"""Feedback repository."""
from __future__ import annotations

import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.feedback import Feedback
from app.repositories.base import BaseRepository


class FeedbackRepository(BaseRepository[Feedback]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Feedback, session)

    async def get_by_user_and_event(
        self, user_id: uuid.UUID, event_id: uuid.UUID
    ) -> Feedback | None:
        stmt = select(Feedback).where(
            Feedback.user_id == user_id,
            Feedback.event_id == event_id,
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def average_rating(self, event_id: uuid.UUID) -> float:
        stmt = (
            select(func.avg(Feedback.rating))
            .where(Feedback.event_id == event_id)
        )
        result = await self._session.execute(stmt)
        return float(result.scalar_one() or 0.0)

    async def count_by_event(self, event_id: uuid.UUID) -> int:
        stmt = (
            select(func.count())
            .select_from(Feedback)
            .where(Feedback.event_id == event_id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one()
