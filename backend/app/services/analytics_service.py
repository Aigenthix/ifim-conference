"""
Analytics service — dashboard data aggregation.

Combines Redis real-time data with PostgreSQL historical data.
"""
from __future__ import annotations

import uuid

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.chat_repo import ChatLogRepository
from app.repositories.feedback_repo import FeedbackRepository
from app.repositories.poll_repo import PollRepository
from app.repositories.registration_repo import RegistrationRepository
from app.schemas.admin import DashboardResponse


class AnalyticsService:
    """Aggregates analytics for the admin dashboard."""

    def __init__(
        self,
        session: AsyncSession,
        redis: aioredis.Redis,
    ) -> None:
        self._reg_repo = RegistrationRepository(session)
        self._poll_repo = PollRepository(session)
        self._feedback_repo = FeedbackRepository(session)
        self._chat_repo = ChatLogRepository(session)
        self._redis = redis

    async def get_dashboard(self, event_id: uuid.UUID) -> DashboardResponse:
        """
        Build dashboard payload from Redis (live data) + PostgreSQL (historical).
        """
        # Real-time from Redis
        live_users = int(await self._redis.get(f"analytics:{event_id}:live") or 0)

        # Historical from PostgreSQL
        total_regs = await self._reg_repo.count_by_event(event_id)

        # Poll stats
        polls = await self._poll_repo.get_active_by_event(event_id)
        total_polls = len(polls)
        total_votes = 0
        for poll in polls:
            votes_key = f"poll:{poll.id}:votes"
            counts = await self._redis.hgetall(votes_key)
            total_votes += sum(int(v) for v in counts.values())

        # Feedback stats
        total_feedback = await self._feedback_repo.count_by_event(event_id)
        avg_rating = await self._feedback_repo.average_rating(event_id)

        # Chat stats
        total_queries = await self._chat_repo.count_by_event(event_id)
        top_queries = await self._chat_repo.top_queries(event_id, limit=10)

        return DashboardResponse(
            total_registrations=total_regs,
            live_concurrent_users=live_users,
            total_polls=total_polls,
            total_votes=total_votes,
            total_feedback=total_feedback,
            average_rating=avg_rating,
            total_queries=total_queries,
            top_queries=top_queries,
        )
