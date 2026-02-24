"""Event routes — lobby access."""
from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import CurrentUser, DBSession, Redis
from app.schemas.event import EventCreateRequest, EventLobbyResponse
from app.services.event_service import EventService

router = APIRouter(prefix="/events", tags=["events"])


@router.get(
    "/{slug}/lobby",
    response_model=EventLobbyResponse,
    summary="Get event lobby",
    description="Returns full lobby data for registered attendees. Requires JWT.",
)
async def get_lobby(
    slug: str,
    user: CurrentUser,
    session: DBSession,
    redis: Redis,
) -> EventLobbyResponse:
    service = EventService(session=session, redis=redis)
    return await service.get_lobby(slug, user.user_id)


@router.post(
    "/",
    response_model=EventLobbyResponse,
    status_code=201,
    summary="Create event (admin)",
)
async def create_event(
    payload: EventCreateRequest,
    user: CurrentUser,
    session: DBSession,
    redis: Redis,
) -> EventLobbyResponse:
    service = EventService(session=session, redis=redis)
    return await service.create_event(payload)
