"""
JWT authentication utilities.

Provides token creation, verification, and password hashing.
Tokens are event-scoped — each token encodes the event_id the user registered for.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Password hashing ──────────────────────────────────────────

def hash_password(plain: str) -> str:
    return _pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_ctx.verify(plain, hashed)


# ── JWT helpers ────────────────────────────────────────────────

def create_access_token(
    user_id: uuid.UUID,
    event_id: uuid.UUID,
    extra_claims: dict[str, Any] | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a short-lived, event-scoped JWT.

    Claims:
        sub  — user ID (str)
        eid  — event ID (str)
        exp  — expiry timestamp
        iat  — issued-at timestamp
        jti  — unique token ID for revocation
    """
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES))

    payload: dict[str, Any] = {
        "sub": str(user_id),
        "eid": str(event_id),
        "exp": expire,
        "iat": now,
        "jti": uuid.uuid4().hex,
    }
    if extra_claims:
        payload.update(extra_claims)

    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT. Raises JWTError on failure."""
    settings = get_settings()
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )


class TokenPayload:
    """Structured wrapper around decoded JWT claims."""

    __slots__ = ("user_id", "event_id", "jti", "exp")

    def __init__(self, raw: dict[str, Any]) -> None:
        self.user_id: uuid.UUID = uuid.UUID(raw["sub"])
        self.event_id: uuid.UUID = uuid.UUID(raw["eid"])
        self.jti: str = raw["jti"]
        self.exp: int = raw["exp"]
