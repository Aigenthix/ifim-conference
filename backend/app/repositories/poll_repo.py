"""Poll repository."""
from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.poll import Poll, PollOption, PollVote
from app.repositories.base import BaseRepository


class PollRepository(BaseRepository[Poll]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(Poll, session)

    async def get_active_by_event(self, event_id: uuid.UUID) -> Sequence[Poll]:
        stmt = (
            select(Poll)
            .options(selectinload(Poll.options))
            .where(Poll.event_id == event_id, Poll.is_active.is_(True))
        )
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def get_with_options(self, poll_id: uuid.UUID) -> Poll | None:
        stmt = (
            select(Poll)
            .options(selectinload(Poll.options))
            .where(Poll.id == poll_id)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def create_with_options(
        self, *, event_id: uuid.UUID, question: str, option_texts: list[str]
    ) -> Poll:
        poll = Poll(event_id=event_id, question=question)
        self._session.add(poll)
        await self._session.flush()

        for idx, text in enumerate(option_texts):
            option = PollOption(
                poll_id=poll.id, option_text=text, display_order=idx
            )
            self._session.add(option)

        await self._session.flush()
        await self._session.refresh(poll)
        return poll


class PollVoteRepository(BaseRepository[PollVote]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(PollVote, session)

    async def has_voted(
        self, poll_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        stmt = select(PollVote).where(
            PollVote.poll_id == poll_id,
            PollVote.user_id == user_id,
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def bulk_create(self, votes: list[dict]) -> None:
        """Batch insert votes from Redis flush."""
        for v in votes:
            self._session.add(PollVote(**v))
        await self._session.flush()
