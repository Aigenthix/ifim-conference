"""Feedback schemas."""
from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class FeedbackRequest(BaseModel):
    event_id: uuid.UUID
    rating: int = Field(..., ge=1, le=5)
    comments: str | None = Field(None, max_length=2000)


class FeedbackResponse(BaseModel):
    id: uuid.UUID
    event_id: uuid.UUID
    user_id: uuid.UUID
    rating: int
    comments: str | None = None
    certificate_status: str = "pending"

    model_config = {"from_attributes": True}
