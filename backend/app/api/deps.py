"""
FastAPI dependency injection.

Provides reusable dependencies for:
  - Database sessions
  - Redis connections
  - Current authenticated user (JWT)
  - Admin authentication
"""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends, Header, Query
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthError, ForbiddenError
from app.core.security import TokenPayload, decode_access_token
from app.db.session import get_db, get_redis

import redis.asyncio as aioredis


# ── DB Session ─────────────────────────────────────────────

async def db_session(
    session: AsyncSession = Depends(get_db),
) -> AsyncSession:
    return session


# ── Redis ──────────────────────────────────────────────────

async def redis_dep() -> aioredis.Redis:
    return get_redis()


# ── Auth: Extract current user from JWT ────────────────────

async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    token: Annotated[str | None, Query()] = None,
) -> TokenPayload:
    """
    Extract and validate JWT from either:
      - Authorization: Bearer <token> header
      - ?token=<token> query param (for WebSocket)
    """
    raw_token: str | None = None

    if authorization and authorization.startswith("Bearer "):
        raw_token = authorization[7:]
    elif token:
        raw_token = token

    if not raw_token:
        raise AuthError("Missing authentication token")

    try:
        payload = decode_access_token(raw_token)
        return TokenPayload(payload)
    except JWTError:
        raise AuthError("Invalid or expired token")


# ── Convenience aliases ────────────────────────────────────

DBSession = Annotated[AsyncSession, Depends(db_session)]
Redis = Annotated[aioredis.Redis, Depends(redis_dep)]
CurrentUser = Annotated[TokenPayload, Depends(get_current_user)]
