"""
Auth service — QR-based registration and JWT issuance.

Handles:
  1. User lookup by email OR phone (pre-registered whitelist)
  2. Event validation
  3. Registration record
  4. JWT token with event-scoped claims
  5. Redis session tracking
"""
from __future__ import annotations

import json
import uuid

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import ConflictError, NotFoundError
from app.core.security import create_access_token
from app.repositories.event_repo import EventRepository
from app.repositories.registration_repo import RegistrationRepository
from app.repositories.user_repo import UserRepository
from app.schemas.auth import RegisterRequest, RegisterResponse


class AuthService:
    """Orchestrates the QR-scan → register → JWT flow."""

    def __init__(
        self,
        session: AsyncSession,
        redis: aioredis.Redis,
    ) -> None:
        self._user_repo = UserRepository(session)
        self._event_repo = EventRepository(session)
        self._reg_repo = RegistrationRepository(session)
        self._redis = redis

    async def register_user(self, payload: RegisterRequest) -> RegisterResponse:
        """
        Full registration flow:
        1. Validate event exists + is active
        2. Look up user by email OR phone (whichever was provided)
        3. Create registration (fail if already registered — idempotent)
        4. Track session in Redis
        5. Issue JWT
        """
        # 1. Validate event
        event = await self._event_repo.get_by_slug(payload.event_slug)
        if not event:
            raise NotFoundError(f"Event '{payload.event_slug}' not found")
        if not event.is_active:
            raise NotFoundError("Event is no longer active")

        # 2. Look up existing user — only pre-registered users can log in
        #    Try email first, then phone
        user = None
        if payload.email:
            user = await self._user_repo.get_by_email(payload.email)
        if not user and payload.phone:
            user = await self._user_repo.get_by_phone(payload.phone)

        if not user:
            raise NotFoundError(
                "You are not registered for this event. Please contact the organizer."
            )

        # 3. Register for event (idempotent)
        existing_reg = await self._reg_repo.get_by_user_and_event(
            user.id, event.id
        )
        if existing_reg:
            # Already registered — just issue a new token
            pass
        else:
            await self._reg_repo.create(user_id=user.id, event_id=event.id)

        # 4. Issue JWT
        token = create_access_token(user_id=user.id, event_id=event.id)

        # 5. Track active session in Redis
        settings = get_settings()
        session_key = f"session:{user.id}:{event.id}"
        await self._redis.setex(
            session_key,
            settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            json.dumps({"user_id": str(user.id), "event_id": str(event.id)}),
        )

        # 6. Increment live user count
        await self._redis.incr(f"analytics:{event.id}:live")

        return RegisterResponse(
            user_id=user.id,
            event_id=event.id,
            access_token=token,
            user_name=user.name,
            user_email=user.email,
            user_phone=user.phone,
            user_company=getattr(user, "company", None),
            user_food_preference=getattr(user, "food_preference", None),
            user_tshirt_size=getattr(user, "tshirt_size", None),
            user_growth_focus=getattr(user, "growth_focus", None),
        )
