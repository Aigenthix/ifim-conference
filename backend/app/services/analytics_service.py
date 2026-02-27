"""
Analytics service — dashboard data aggregation.

Combines Redis real-time data with PostgreSQL historical data.
"""
from __future__ import annotations

import asyncio
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

    DASHBOARD_CACHE_TTL_SECONDS = 5

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

    async def _get_live_users(self, event_id: uuid.UUID) -> int:
        try:
            return int(await self._redis.get(f"analytics:{event_id}:live") or 0)
        except Exception:
            return 0

    async def _get_total_votes(self, polls: list) -> int:
        if not polls:
            return 0
        try:
            pipeline = self._redis.pipeline()
            for poll in polls:
                pipeline.hvals(f"poll:{poll.id}:votes")
            rows = await pipeline.execute()
            return sum(sum(int(v) for v in values) for values in rows)
        except Exception:
            # Degrade gracefully when Redis is unavailable.
            return 0

    async def get_dashboard(self, event_id: uuid.UUID) -> DashboardResponse:
        """
        Build dashboard payload from Redis (live data) + PostgreSQL (historical).
        """
        cache_key = f"analytics:{event_id}:dashboard:v1"
        try:
            cached = await self._redis.get(cache_key)
            if cached:
                return DashboardResponse.model_validate_json(cached)
        except Exception:
            # Ignore cache-read issues and compute fresh payload.
            pass

        live_users = await self._get_live_users(event_id)
        total_regs = await self._reg_repo.count_by_event(event_id)
        polls = await self._poll_repo.get_active_by_event(event_id)
        total_feedback = await self._feedback_repo.count_by_event(event_id)
        avg_rating = await self._feedback_repo.average_rating(event_id)
        total_queries = await self._chat_repo.count_by_event(event_id)
        top_queries = await self._chat_repo.top_queries(event_id, limit=10)

        total_polls = len(polls)
        total_votes = await self._get_total_votes(list(polls))

        payload = DashboardResponse(
            total_registrations=total_regs,
            live_concurrent_users=live_users,
            total_polls=total_polls,
            total_votes=total_votes,
            total_feedback=total_feedback,
            average_rating=avg_rating,
            total_queries=total_queries,
            top_queries=top_queries,
        )
        try:
            await self._redis.set(
                cache_key,
                payload.model_dump_json(),
                ex=self.DASHBOARD_CACHE_TTL_SECONDS,
            )
        except Exception:
            pass
        return payload
