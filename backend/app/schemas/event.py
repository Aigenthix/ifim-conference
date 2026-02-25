"""Event schemas."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


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
    how_it_works: str = Field(..., min_length=40, max_length=500)
    business_impact: str = Field(..., min_length=40, max_length=500)
    implementation_steps: list[str] = Field(..., min_length=3, max_length=5)
    kpis: list[str] = Field(..., min_length=3, max_length=5)

    @field_validator("implementation_steps", "kpis")
    @classmethod
    def validate_text_list(cls, value: list[str]) -> list[str]:
        cleaned = [str(item).strip() for item in value if str(item).strip()]
        if len(cleaned) < 3:
            raise ValueError("At least 3 items are required")
        return cleaned[:5]


class StrategyCompassTopicsResponse(BaseModel):
    """Response payload for strategy compass topics."""

    topics: list[StrategyCompassTopic]
