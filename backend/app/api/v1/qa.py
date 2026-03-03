"""Q&A routes — session-based audience questions."""
from __future__ import annotations

from datetime import datetime, timezone
import re
import uuid

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from sqlalchemy import select

from app.api.deps import CurrentUser, DBSession
from app.core.exceptions import ForbiddenError, NotFoundError, ValidationError
from app.models.qa_question import QAQuestion
from app.models.session import Session
from app.models.user import User

router = APIRouter(prefix="/qa", tags=["qa"])


STANDARD_QA_SESSION_TEMPLATES: list[dict[str, object]] = [
    {
        "title": "Next Big Thing 2030",
        "speaker_name": "Hitesh Mali",
        "day": 1,
        "time_range": "07:00 – 08:00 PM",
        "display_order": 1,
    },
    {
        "title": "Progress Through Process",
        "speaker_name": "Nikhil Naik",
        "day": 2,
        "time_range": "10:00 – 10:45 AM",
        "display_order": 1,
    },
    {
        "title": "Future In Focus",
        "speaker_name": "Siddharth Karnawat",
        "day": 2,
        "time_range": "11:00 – 11:45 AM",
        "display_order": 2,
    },
    {
        "title": "Book Journey - The Ideal Entrepreneur",
        "speaker_name": "Rahul Agarwal",
        "day": 2,
        "time_range": "12:15 – 01:00 PM",
        "display_order": 3,
    },
    {
        "title": "The Powerful Comeback",
        "speaker_name": "Hitesh Mali",
        "day": 2,
        "time_range": "02:15 – 02:30 PM",
        "display_order": 4,
    },
    {
        "title": "Succession Plan for Financial Distributors",
        "speaker_name": "Jatin Popat",
        "day": 2,
        "time_range": "02:30 – 03:15 PM",
        "display_order": 5,
    },
    {
        "title": "From Insight to Action",
        "speaker_name": "Hitesh Mali",
        "day": 2,
        "time_range": "03:45 – 04:45 PM",
        "display_order": 6,
    },
]


def _canonical_title(value: str) -> str:
    lowered = value.strip().lower().replace("—", " ")
    lowered = re.sub(r"\s+by\s+.+$", "", lowered)
    return re.sub(r"[^a-z0-9]+", "", lowered)


def _time_lookup() -> dict[str, str]:
    return {
        _canonical_title(str(item["title"])): str(item["time_range"])
        for item in STANDARD_QA_SESSION_TEMPLATES
    }


def _normalize_alias(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.strip().lower())


def _session_alias_lookup() -> dict[str, tuple[int, str]]:
    aliases: dict[str, tuple[int, str]] = {}
    for template in STANDARD_QA_SESSION_TEMPLATES:
        day = int(template["day"])
        title_key = _canonical_title(str(template["title"]))
        display_order = int(template["display_order"])

        candidates = {
            f"day{day}{title_key}",
            f"day{day}{display_order}",
            f"sessionday{day}{display_order}",
            f"fallbackday{day}{display_order}",
            title_key,
        }
        for candidate in candidates:
            aliases[_normalize_alias(candidate)] = (day, title_key)

    return aliases


def _client_session_id(day: int, display_order: int) -> str:
    safe_day = max(day, 1)
    safe_order = max(display_order, 1)
    return f"fallback-day{safe_day}-{safe_order}"


async def _resolve_selected_session(
    *,
    raw_session_id: str,
    event_id: uuid.UUID,
    synced_sessions: list[Session],
    session: DBSession,
) -> Session:
    session_token = raw_session_id.strip()
    if not session_token:
        raise ValidationError("Session id is required")

    # Primary path: real UUID session id from synced session list.
    try:
        parsed_session_id = uuid.UUID(session_token)
        result = await session.execute(
            select(Session).where(
                Session.id == parsed_session_id,
                Session.event_id == event_id,
                Session.is_active.is_(True),
            )
        )
        selected = result.scalar_one_or_none()
        if selected:
            return selected
    except ValueError:
        pass

    # Fallback path: alias IDs (for example: fallback-day1-1).
    alias_target = _session_alias_lookup().get(_normalize_alias(session_token))
    if alias_target:
        target_day, target_title_key = alias_target
        for row in synced_sessions:
            if row.day == target_day and _canonical_title(row.title) == target_title_key:
                return row

    raise NotFoundError("Session not found for this event")


async def _ensure_standard_qa_sessions(
    event_id: uuid.UUID,
    session: DBSession,
) -> list[Session]:
    existing_result = await session.execute(
        select(Session).where(
            Session.event_id == event_id,
            Session.is_active.is_(True),
        )
    )
    existing = list(existing_result.scalars().all())

    by_key: dict[str, Session] = {}
    for row in existing:
        key = f"{row.day}:{_canonical_title(row.title)}"
        by_key[key] = row

    synced: list[Session] = []
    created: list[Session] = []
    dirty = False

    for template in STANDARD_QA_SESSION_TEMPLATES:
        day = int(template["day"])
        title = str(template["title"])
        speaker_name = str(template["speaker_name"])
        display_order = int(template["display_order"])
        key = f"{day}:{_canonical_title(title)}"

        row = by_key.get(key)
        if row:
            # Ensure existing session is marked qa_protected
            if not row.qa_protected:
                row.qa_protected = True
                dirty = True
            synced.append(row)
            continue

        row = Session(
            event_id=event_id,
            title=title,
            speaker_name=speaker_name,
            day=day,
            display_order=display_order,
            is_active=True,
            qa_protected=True,
        )
        session.add(row)
        created.append(row)
        synced.append(row)
        by_key[key] = row

    if created or dirty:
        await session.commit()
        for row in created:
            await session.refresh(row)

    return sorted(
        synced,
        key=lambda row: (row.day, row.display_order, row.title.lower()),
    )


class AskQuestionRequest(BaseModel):
    event_id: uuid.UUID
    session_id: str = Field(min_length=1, max_length=160)
    question: str = Field(min_length=1, max_length=280)


class QuestionItem(BaseModel):
    id: str
    session_id: str
    user_name: str
    question: str
    answer: str | None = None
    created_at: str


class QAListResponse(BaseModel):
    questions: list[QuestionItem]


class QASessionItem(BaseModel):
    id: str
    title: str
    speaker_name: str | None = None
    day: str
    day_number: int
    time_range: str
    display_order: int


class QASessionListResponse(BaseModel):
    sessions: list[QASessionItem]


@router.get(
    "/{event_id}/sessions",
    response_model=QASessionListResponse,
    summary="Get Day 1 / Day 2 Q&A sessions",
)
async def get_qa_sessions(
    event_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
) -> QASessionListResponse:
    if user.event_id != event_id and user.event_id != uuid.UUID("00000000-0000-0000-0000-000000000000"):
        raise ForbiddenError("You are not authorized to access this event")

    rows = await _ensure_standard_qa_sessions(event_id, session)
    time_by_title = _time_lookup()

    return QASessionListResponse(
        sessions=[
            QASessionItem(
                id=_client_session_id(row.day, row.display_order),
                title=row.title,
                speaker_name=row.speaker_name,
                day=f"Day {row.day}",
                day_number=row.day,
                time_range=time_by_title.get(_canonical_title(row.title), "Live Session"),
                display_order=row.display_order,
            )
            for row in rows
        ]
    )


@router.post(
    "/ask",
    response_model=QuestionItem,
    status_code=201,
    summary="Ask a question for a session",
)
async def ask_question(
    payload: AskQuestionRequest,
    user: CurrentUser,
    session: DBSession,
) -> QuestionItem:
    if payload.event_id != user.event_id and user.event_id != uuid.UUID("00000000-0000-0000-0000-000000000000"):
        raise ForbiddenError("You are not authorized to ask in this event")

    cleaned_question = payload.question.strip()
    if not cleaned_question:
        raise ValidationError("Question cannot be empty")

    synced_sessions = await _ensure_standard_qa_sessions(payload.event_id, session)
    selected_session = await _resolve_selected_session(
        raw_session_id=payload.session_id,
        event_id=payload.event_id,
        synced_sessions=synced_sessions,
        session=session,
    )

    user_result = await session.execute(select(User).where(User.id == user.user_id))
    db_user = user_result.scalar_one_or_none()
    user_name = db_user.name if db_user else "Anonymous"

    qa = QAQuestion(
        event_id=payload.event_id,
        session_id=selected_session.id,
        user_id=user.user_id,
        user_name=user_name,
        question=cleaned_question,
        answer=None,
    )
    session.add(qa)
    await session.commit()
    await session.refresh(qa)

    return QuestionItem(
        id=str(qa.id),
        session_id=_client_session_id(selected_session.day, selected_session.display_order),
        user_name=qa.user_name,
        question=qa.question,
        answer=None,
        created_at=qa.created_at.isoformat() if qa.created_at else "",
    )


@router.get(
    "/{event_id}",
    response_model=QAListResponse,
    summary="Get all Q&A questions for an event",
)
async def get_questions(
    event_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
    after: str | None = Query(default=None, description="Return questions created after this ISO timestamp"),
    limit: int = Query(default=250, ge=1, le=500),
) -> QAListResponse:
    if user.event_id != event_id and user.event_id != uuid.UUID("00000000-0000-0000-0000-000000000000"):
        raise ForbiddenError("You are not authorized to access this event")

    after_dt: datetime | None = None
    if after:
        try:
            parsed = datetime.fromisoformat(after.replace("Z", "+00:00"))
            after_dt = parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except ValueError:
            after_dt = None

    if after_dt:
        result = await session.execute(
            select(QAQuestion)
            .where(
                QAQuestion.event_id == event_id,
                QAQuestion.created_at > after_dt,
            )
            .order_by(QAQuestion.created_at.asc())
            .limit(limit)
        )
        questions = result.scalars().all()
    else:
        result = await session.execute(
            select(QAQuestion)
            .where(QAQuestion.event_id == event_id)
            .order_by(QAQuestion.created_at.desc())
            .limit(limit)
        )
        # Return oldest->newest to make client-side incremental merge deterministic.
        questions = list(reversed(result.scalars().all()))

    sessions_result = await session.execute(
        select(Session.id, Session.day, Session.display_order).where(
            Session.event_id == event_id,
            Session.is_active.is_(True),
        )
    )
    client_session_ids: dict[str, str] = {}
    for session_id, day, display_order in sessions_result.all():
        client_session_ids[str(session_id)] = _client_session_id(
            int(day),
            int(display_order),
        )

    items = [
        QuestionItem(
            id=str(q.id),
            session_id=client_session_ids.get(str(q.session_id), str(q.session_id)),
            user_name=q.user_name,
            question=q.question,
            answer=None,
            created_at=q.created_at.isoformat() if q.created_at else "",
        )
        for q in questions
    ]

    return QAListResponse(questions=items)
