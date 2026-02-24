"""Chat / chatbot schemas."""
from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class ChatQueryRequest(BaseModel):
    event_id: uuid.UUID
    query: str = Field(..., min_length=1, max_length=1000)


class ChatQueryResponse(BaseModel):
    query: str
    response: str
    sources: list[str] = []
