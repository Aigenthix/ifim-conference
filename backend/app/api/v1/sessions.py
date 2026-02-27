"""Sessions CRUD API."""
from __future__ import annotations

import uuid

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import select

from app.api.deps import CurrentUser, DBSession
from app.models.session import Session

router = APIRouter(prefix="/sessions", tags=["sessions"])


# ── Schemas ────────────────────────────────────────────────

class SessionCreate(BaseModel):
    event_id: str
    title: str
    speaker_name: str | None = None
    speaker_title: str | None = None
    day: int = 1
    display_order: int = 0
    audio_url: str | None = None
    video_url: str | None = None
    description: str | None = None

class SessionResponse(BaseModel):
    id: str
    event_id: str
    title: str
    speaker_name: str | None
    speaker_title: str | None
    day: int
    display_order: int
    audio_url: str | None
    video_url: str | None
    description: str | None
    is_active: bool
    created_at: str

class SessionsListResponse(BaseModel):
    sessions: list[SessionResponse]


# ── Public: list sessions for an event ─────────────────────

@router.get(
    "/event/{event_id}",
    response_model=SessionsListResponse,
    summary="List sessions for an event",
)
async def get_event_sessions(
    event_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
) -> SessionsListResponse:
    stmt = (
        select(Session)
        .where(Session.event_id == event_id, Session.is_active == True)
        .order_by(Session.day, Session.display_order)
    )
    result = await session.execute(stmt)
    rows = result.scalars().all()

    return SessionsListResponse(
        sessions=[
            SessionResponse(
                id=str(s.id),
                event_id=str(s.event_id),
                title=s.title,
                speaker_name=s.speaker_name,
                speaker_title=s.speaker_title,
                day=s.day,
                display_order=s.display_order,
                audio_url=s.audio_url,
                video_url=s.video_url,
                description=s.description,
                is_active=s.is_active,
                created_at=str(s.created_at),
            )
            for s in rows
        ]
    )


# ── Admin: create session ─────────────────────────────────

@router.post(
    "/",
    response_model=SessionResponse,
    status_code=201,
    summary="Create a session (admin)",
)
async def create_session(
    payload: SessionCreate,
    user: CurrentUser,
    session: DBSession,
) -> SessionResponse:
    new_session = Session(
        id=uuid.uuid4(),
        event_id=uuid.UUID(payload.event_id),
        title=payload.title,
        speaker_name=payload.speaker_name,
        speaker_title=payload.speaker_title,
        day=payload.day,
        display_order=payload.display_order,
        audio_url=payload.audio_url,
        video_url=payload.video_url,
        description=payload.description,
    )
    session.add(new_session)
    await session.commit()
    await session.refresh(new_session)

    return SessionResponse(
        id=str(new_session.id),
        event_id=str(new_session.event_id),
        title=new_session.title,
        speaker_name=new_session.speaker_name,
        speaker_title=new_session.speaker_title,
        day=new_session.day,
        display_order=new_session.display_order,
        audio_url=new_session.audio_url,
        video_url=new_session.video_url,
        description=new_session.description,
        is_active=new_session.is_active,
        created_at=str(new_session.created_at),
    )


# ── Admin: delete session ─────────────────────────────────

@router.delete(
    "/{session_id}",
    status_code=204,
    summary="Delete a session (admin)",
)
async def delete_session(
    session_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
) -> None:
    stmt = select(Session).where(Session.id == session_id)
    result = await session.execute(stmt)
    s = result.scalar_one_or_none()
    if s:
        await session.delete(s)
        await session.commit()
