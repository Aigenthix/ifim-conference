"""Community chat routes — live chat between event attendees."""
from __future__ import annotations

from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, Query
from pydantic import BaseModel
from sqlalchemy import select

from app.api.deps import CurrentUser, DBSession
from app.models.community_message import CommunityMessage
from app.models.user import User

router = APIRouter(prefix="/community", tags=["community"])


class SendMessageRequest(BaseModel):
    event_id: str
    message: str
    reply_to_id: str | None = None
    reply_to_user_name: str | None = None
    reply_to_message: str | None = None


class MessageItem(BaseModel):
    id: str
    user_id: str
    user_name: str
    message: str
    created_at: str
    reply_to_id: str | None = None
    reply_to_user_name: str | None = None
    reply_to_message: str | None = None


class ChatListResponse(BaseModel):
    messages: list[MessageItem]


@router.post(
    "/send",
    response_model=MessageItem,
    status_code=201,
    summary="Send a community chat message",
)
async def send_message(
    payload: SendMessageRequest,
    user: CurrentUser,
    session: DBSession,
) -> MessageItem:
    # Fetch user name
    user_result = await session.execute(
        select(User).where(User.id == user.user_id)
    )
    db_user = user_result.scalar_one_or_none()
    user_name = db_user.name if db_user else "Anonymous"

    # Handle reply references safely
    reply_to_uuid = None
    if payload.reply_to_id:
        try:
            reply_to_uuid = uuid.UUID(payload.reply_to_id)
        except ValueError:
            pass

    msg = CommunityMessage(
        event_id=uuid.UUID(payload.event_id),
        user_id=user.user_id,
        user_name=user_name,
        message=payload.message,
        reply_to_id=reply_to_uuid,
        reply_to_user_name=payload.reply_to_user_name,
        reply_to_message=payload.reply_to_message,
    )
    session.add(msg)
    await session.commit()
    await session.refresh(msg)

    return MessageItem(
        id=str(msg.id),
        user_id=str(msg.user_id),
        user_name=msg.user_name,
        message=msg.message,
        created_at=msg.created_at.isoformat() if msg.created_at else "",
        reply_to_id=str(msg.reply_to_id) if msg.reply_to_id else None,
        reply_to_user_name=msg.reply_to_user_name,
        reply_to_message=msg.reply_to_message,
    )


@router.get(
    "/{event_id}",
    response_model=ChatListResponse,
    summary="Get community chat messages for an event",
)
async def get_messages(
    event_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
    after: str | None = Query(default=None, description="Return messages created after this ISO timestamp"),
    limit: int = Query(default=200, ge=1, le=500),
) -> ChatListResponse:
    after_dt: datetime | None = None
    if after:
        try:
            parsed = datetime.fromisoformat(after.replace("Z", "+00:00"))
            after_dt = parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            after_dt = None

    if after_dt:
        stmt = (
            select(CommunityMessage)
            .where(
                CommunityMessage.event_id == event_id,
                CommunityMessage.created_at > after_dt,
            )
            .order_by(CommunityMessage.created_at.asc())
            .limit(limit)
        )
        result = await session.execute(stmt)
        messages = result.scalars().all()
    else:
        stmt = (
            select(CommunityMessage)
            .where(CommunityMessage.event_id == event_id)
            .order_by(CommunityMessage.created_at.desc())
            .limit(limit)
        )
        result = await session.execute(stmt)
        # Return oldest->newest for consistent append rendering in UI.
        messages = list(reversed(result.scalars().all()))

    items = [
        MessageItem(
            id=str(m.id),
            user_id=str(m.user_id),
            user_name=m.user_name,
            message=m.message,
            created_at=m.created_at.isoformat() if m.created_at else "",
            reply_to_id=str(m.reply_to_id) if m.reply_to_id else None,
            reply_to_user_name=m.reply_to_user_name,
            reply_to_message=m.reply_to_message,
        )
        for m in messages
    ]

    return ChatListResponse(messages=items)
