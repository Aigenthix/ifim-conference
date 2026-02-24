"""Poll schemas."""
from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class PollOptionSchema(BaseModel):
    id: uuid.UUID
    option_text: str
    display_order: int
    vote_count: int = 0

    model_config = {"from_attributes": True}


class PollResponse(BaseModel):
    id: uuid.UUID
    question: str
    is_active: bool
    options: list[PollOptionSchema] = []

    model_config = {"from_attributes": True}


class PollCreateRequest(BaseModel):
    """Admin: create a poll for an event."""

    event_id: uuid.UUID
    question: str = Field(..., min_length=1)
    options: list[str] = Field(..., min_length=2, max_length=10)


class VoteRequest(BaseModel):
    """Cast a vote on a poll option."""

    option_id: uuid.UUID


class VoteResponse(BaseModel):
    poll_id: uuid.UUID
    option_id: uuid.UUID
    status: str = "recorded"
