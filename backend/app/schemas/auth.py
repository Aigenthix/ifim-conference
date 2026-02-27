"""Auth request/response schemas."""
from __future__ import annotations

import uuid
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, model_validator


class RegisterRequest(BaseModel):
    """QR-scan registration request.
    
    Users can log in with either email OR phone number (plus their name).
    At least one of email or phone must be provided.
    """

    name: str = Field(..., min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=7, max_length=20, pattern=r"^\+?[0-9\-\s]+$")
    event_slug: str = Field(..., min_length=1, max_length=200)

    @model_validator(mode="after")
    def at_least_one_contact(self) -> "RegisterRequest":
        if not self.email and not self.phone:
            raise ValueError("Either email or phone number is required")
        return self


class RegisterResponse(BaseModel):
    """Registration response with JWT."""

    user_id: uuid.UUID
    event_id: uuid.UUID
    access_token: str
    user_name: str = ""
    user_email: str = ""
    user_phone: str = ""
    user_company: Optional[str] = None
    user_food_preference: Optional[str] = None
    user_tshirt_size: Optional[str] = None
    user_growth_focus: Optional[str] = None
    token_type: str = "bearer"


class TokenPayloadSchema(BaseModel):
    """Decoded JWT claims."""

    sub: str
    eid: str
    jti: str
    exp: int
