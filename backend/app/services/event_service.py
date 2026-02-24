"""
Event service — lobby data, caching, CRUD.
"""
from __future__ import annotations

import json
import uuid

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.repositories.event_repo import EventRepository
from app.schemas.event import EventCreateRequest, EventLobbyResponse


class EventService:
    """Business logic for event operations."""

    LOBBY_CACHE_TTL = 300  # 5 minutes

    def __init__(
        self,
        session: AsyncSession,
        redis: aioredis.Redis,
    ) -> None:
        self._repo = EventRepository(session)
        self._redis = redis

    async def get_lobby(
        self, slug: str, user_id: uuid.UUID
    ) -> EventLobbyResponse:
        """
        Get event lobby data. Uses Redis cache to avoid
        hitting the DB on every request.
        """
        cache_key = f"event:{slug}:lobby"

        # Try cache first
        cached = await self._redis.get(cache_key)
        if cached:
            return EventLobbyResponse.model_validate_json(cached)

        # Cache miss — fetch from DB
        event = await self._repo.get_by_slug(slug)
        if not event:
            raise NotFoundError(f"Event '{slug}' not found")

        lobby = EventLobbyResponse(
            id=event.id,
            title=event.title,
            slug=event.slug,
            description=event.description,
            overview=json.loads(event.overview_json) if event.overview_json else None,
            speakers=json.loads(event.speakers_json) if event.speakers_json else None,
            team=json.loads(event.team_json) if event.team_json else None,
            starts_at=event.starts_at,
            ends_at=event.ends_at,
            is_active=event.is_active,
        )

        # Cache for 5 minutes
        await self._redis.setex(
            cache_key,
            self.LOBBY_CACHE_TTL,
            lobby.model_dump_json(),
        )

        return lobby

    async def create_event(self, payload: EventCreateRequest) -> EventLobbyResponse:
        """Admin: create a new event."""
        event = await self._repo.create(
            title=payload.title,
            slug=payload.slug,
            description=payload.description,
            starts_at=payload.starts_at,
            ends_at=payload.ends_at,
            speakers_json=payload.speakers_json,
            team_json=payload.team_json,
            overview_json=payload.overview_json,
        )

        return EventLobbyResponse(
            id=event.id,
            title=event.title,
            slug=event.slug,
            description=event.description,
            overview=json.loads(event.overview_json) if event.overview_json else None,
            speakers=json.loads(event.speakers_json) if event.speakers_json else None,
            team=json.loads(event.team_json) if event.team_json else None,
            starts_at=event.starts_at,
            ends_at=event.ends_at,
            is_active=event.is_active,
        )
