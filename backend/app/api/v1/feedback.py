"""Feedback routes."""
from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.api.deps import CurrentUser, DBSession, Redis
from app.schemas.feedback import FeedbackRequest, FeedbackResponse
from app.services.feedback_service import FeedbackService
from app.repositories.feedback_repo import FeedbackRepository

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post(
    "/",
    response_model=FeedbackResponse,
    status_code=201,
    summary="Submit event feedback",
    description="Submitting feedback triggers inline certificate generation.",
)
async def submit_feedback(
    payload: FeedbackRequest,
    user: CurrentUser,
    session: DBSession,
    redis: Redis,
) -> FeedbackResponse:
    service = FeedbackService(session=session, redis=redis)
    return await service.submit_feedback(user_id=user.user_id, payload=payload)


@router.get(
    "/check/{event_id}",
    summary="Check if user already submitted feedback",
    description="Returns feedback data if exists, null if not.",
)
async def check_feedback(
    event_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
) -> dict:
    repo = FeedbackRepository(session)
    existing = await repo.get_by_user_and_event(user.user_id, event_id)
    if existing:
        return {
            "submitted": True,
            "rating": existing.rating,
            "comments": existing.comments,
        }
    return {"submitted": False}
