"""Poll routes — CRUD & voting."""
from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.api.deps import CurrentUser, DBSession, Redis
from app.schemas.poll import PollCreateRequest, PollResponse, VoteRequest, VoteResponse
from app.services.poll_service import PollService

router = APIRouter(prefix="/polls", tags=["polls"])


@router.get(
    "/{poll_id}",
    response_model=PollResponse,
    summary="Get poll with live counts",
)
async def get_poll(
    poll_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
    redis: Redis,
) -> PollResponse:
    service = PollService(session=session, redis=redis)
    return await service.get_poll(poll_id)


@router.post(
    "/{poll_id}/vote",
    response_model=VoteResponse,
    summary="Cast a vote (Redis atomic)",
)
async def vote(
    poll_id: uuid.UUID,
    payload: VoteRequest,
    user: CurrentUser,
    session: DBSession,
    redis: Redis,
) -> VoteResponse:
    service = PollService(session=session, redis=redis)
    return await service.cast_vote(
        poll_id=poll_id,
        user_id=user.user_id,
        event_id=user.event_id,
        vote=payload,
    )


@router.post(
    "/",
    response_model=PollResponse,
    status_code=201,
    summary="Create poll (admin)",
)
async def create_poll(
    payload: PollCreateRequest,
    user: CurrentUser,
    session: DBSession,
    redis: Redis,
) -> PollResponse:
    service = PollService(session=session, redis=redis)
    return await service.create_poll(payload)


@router.get(
    "/event/{event_id}",
    response_model=list[PollResponse],
    summary="List active polls for an event",
)
async def list_polls(
    event_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
    redis: Redis,
) -> list[PollResponse]:
    service = PollService(session=session, redis=redis)
    return await service.get_event_polls(event_id)


@router.post(
    "/generate/{event_id}",
    status_code=201,
    summary="Generate a new AI poll question",
)
async def generate_ai_poll(
    event_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
    redis: Redis,
) -> dict:
    from app.services.poll_generator import create_ai_poll
    from app.services.chatbot_service import ChatbotService

    chatbot = ChatbotService(session=session, redis=redis)
    context = await chatbot._build_event_context(event_id)

    success = await create_ai_poll(
        session=session,
        redis=redis,
        event_id=event_id,
        event_context=context,
    )
    if success:
        return {"status": "generated"}
    return {"status": "failed", "message": "AI could not generate a poll"}
