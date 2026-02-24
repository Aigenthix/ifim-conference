"""Event schemas."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class EventLobbyResponse(BaseModel):
    """Full lobby payload for a registered attendee."""

    id: uuid.UUID
    title: str
    slug: str
    description: str | None = None
    overview: Any | None = None
    speakers: Any | None = None
    team: Any | None = None
    starts_at: datetime
    ends_at: datetime
    is_active: bool

    model_config = {"from_attributes": True}


class EventCreateRequest(BaseModel):
    """Admin: create a new event."""

    title: str = Field(..., min_length=1, max_length=500)
    slug: str = Field(..., min_length=1, max_length=200, pattern=r"^[a-z0-9\-]+$")
    description: str | None = None
    starts_at: datetime
    ends_at: datetime
    speakers_json: str | None = None
    team_json: str | None = None
    overview_json: str | None = None


class StrategyCompassTopic(BaseModel):
    """Single strategy compass wheel topic."""

    title: str = Field(..., min_length=3, max_length=120)
    explanation: str = Field(..., min_length=20, max_length=280)


class StrategyCompassTopicsResponse(BaseModel):
    """Response payload for strategy compass topics."""

    topics: list[StrategyCompassTopic]
