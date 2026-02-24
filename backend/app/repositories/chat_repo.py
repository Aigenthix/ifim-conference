"""Chat log repository."""
from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat_log import ChatLog
from app.repositories.base import BaseRepository


class ChatLogRepository(BaseRepository[ChatLog]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(ChatLog, session)

    async def get_by_event(
        self, event_id: uuid.UUID, *, limit: int = 50
    ) -> Sequence[ChatLog]:
        stmt = (
            select(ChatLog)
            .where(ChatLog.event_id == event_id)
            .order_by(ChatLog.created_at.desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def count_by_event(self, event_id: uuid.UUID) -> int:
        stmt = (
            select(func.count())
            .select_from(ChatLog)
            .where(ChatLog.event_id == event_id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one()

    async def top_queries(
        self, event_id: uuid.UUID, *, limit: int = 10
    ) -> list[str]:
        """Return most frequent query strings for analytics."""
        stmt = (
            select(ChatLog.query, func.count().label("cnt"))
            .where(ChatLog.event_id == event_id)
            .group_by(ChatLog.query)
            .order_by(func.count().desc())
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return [row[0] for row in result.all()]
