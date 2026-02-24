"""Alerts CRUD API with Redis pub/sub for real-time notifications."""
from __future__ import annotations

import json
import uuid

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import select

from app.api.deps import CurrentUser, DBSession, Redis
from app.models.alert import Alert

router = APIRouter(prefix="/alerts", tags=["alerts"])


# ── Schemas ────────────────────────────────────────────────

class AlertCreate(BaseModel):
    event_id: str
    title: str
    message: str
    is_pinned: bool = False

class AlertResponse(BaseModel):
    id: str
    event_id: str
    title: str
    message: str
    is_pinned: bool
    created_at: str

class AlertsListResponse(BaseModel):
    alerts: list[AlertResponse]


def _alert_to_response(a: Alert) -> AlertResponse:
    return AlertResponse(
        id=str(a.id),
        event_id=str(a.event_id),
        title=a.title,
        message=a.message,
        is_pinned=a.is_pinned,
        created_at=str(a.created_at),
    )


# ── Public: list alerts for an event ──────────────────────

@router.get(
    "/event/{event_id}",
    response_model=AlertsListResponse,
    summary="List alerts for an event",
)
async def get_event_alerts(
    event_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
) -> AlertsListResponse:
    stmt = (
        select(Alert)
        .where(Alert.event_id == event_id)
        .order_by(Alert.created_at.desc())
    )
    result = await session.execute(stmt)
    rows = result.scalars().all()
    return AlertsListResponse(alerts=[_alert_to_response(a) for a in rows])


# ── Admin: create alert + publish via Redis ───────────────

@router.post(
    "/",
    response_model=AlertResponse,
    status_code=201,
    summary="Create an alert (admin) — pushes live notification",
)
async def create_alert(
    payload: AlertCreate,
    user: CurrentUser,
    session: DBSession,
    redis: Redis,
) -> AlertResponse:
    new_alert = Alert(
        id=uuid.uuid4(),
        event_id=uuid.UUID(payload.event_id),
        title=payload.title,
        message=payload.message,
        is_pinned=payload.is_pinned,
    )
    session.add(new_alert)
    await session.commit()
    await session.refresh(new_alert)

    # Publish via Redis for real-time notification to all clients
    alert_data = json.dumps({
        "type": "new_alert",
        "alert": {
            "id": str(new_alert.id),
            "title": new_alert.title,
            "message": new_alert.message,
            "is_pinned": new_alert.is_pinned,
            "created_at": str(new_alert.created_at),
        },
    })
    await redis.publish(f"alerts:{payload.event_id}", alert_data)

    return _alert_to_response(new_alert)
