"""Chatbot routes — RAG-powered queries."""
from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import CurrentUser, DBSession, Redis
from app.schemas.chat import ChatQueryRequest, ChatQueryResponse
from app.services.chatbot_service import ChatbotService

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


@router.post(
    "/query",
    response_model=ChatQueryResponse,
    summary="Ask a question (RAG-powered)",
)
async def ask_question(
    payload: ChatQueryRequest,
    user: CurrentUser,
    session: DBSession,
    redis: Redis,
) -> ChatQueryResponse:
    service = ChatbotService(session=session, redis=redis)
    return await service.ask(user_id=user.user_id, payload=payload)
