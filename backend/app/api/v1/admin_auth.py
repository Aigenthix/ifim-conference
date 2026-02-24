"""Admin auth + management routes."""
from __future__ import annotations

import asyncio
import uuid
from datetime import timedelta
from functools import partial

from fastapi import APIRouter
from pydantic import BaseModel
from sqlalchemy import select

from app.api.deps import DBSession
from app.core.exceptions import AuthError
from app.core.security import create_access_token, verify_password
from app.models.admin import AdminUser

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Schemas ────────────────────────────────────────────────

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class AdminLoginResponse(BaseModel):
    token: str
    admin_id: str
    email: str
    role: str


# ── Login ──────────────────────────────────────────────────

@router.post("/login", response_model=AdminLoginResponse, summary="Admin login")
async def admin_login(
    payload: AdminLoginRequest,
    session: DBSession,
) -> AdminLoginResponse:
    stmt = select(AdminUser).where(AdminUser.email == payload.email)
    result = await session.execute(stmt)
    admin = result.scalar_one_or_none()

    if not admin:
        raise AuthError("Invalid email or password")

    # Run bcrypt verify in a thread to avoid blocking the event loop
    loop = asyncio.get_event_loop()
    password_ok = await loop.run_in_executor(
        None, partial(verify_password, payload.password, admin.hashed_password)
    )

    if not password_ok:
        raise AuthError("Invalid email or password")

    # Create long-lived admin token (24h)
    token = create_access_token(
        user_id=admin.id,
        event_id=uuid.UUID("00000000-0000-0000-0000-000000000000"),
        extra_claims={"role": admin.role},
        expires_delta=timedelta(hours=24),
    )

    return AdminLoginResponse(
        token=token,
        admin_id=str(admin.id),
        email=admin.email,
        role=admin.role,
    )
