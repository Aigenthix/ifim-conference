"""Auth request/response schemas."""
from __future__ import annotations

import uuid

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """QR-scan registration request."""

    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=20, pattern=r"^\+?[0-9\-\s]+$")
    event_slug: str = Field(..., min_length=1, max_length=200)


class RegisterResponse(BaseModel):
    """Registration response with JWT."""

    user_id: uuid.UUID
    event_id: uuid.UUID
    access_token: str
    token_type: str = "bearer"


class TokenPayloadSchema(BaseModel):
    """Decoded JWT claims."""

    sub: str
    eid: str
    jti: str
    exp: int
