"""User repository."""
from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(func.lower(User.email) == email.lower())
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_phone(self, phone: str) -> User | None:
        # Normalize phone: strip spaces, dashes, leading +91 or 0
        clean = phone.strip().replace(" ", "").replace("-", "")
        if clean.startswith("+91"):
            clean = clean[3:]
        clean = clean.lstrip("0")
        stmt = select(User).where(
            func.replace(func.replace(func.ltrim(func.replace(User.phone, " ", ""), "0"), "+91", ""), "-", "") == clean
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_or_create(
        self, *, name: str, email: str, phone: str
    ) -> tuple[User, bool]:
        """Return (user, created). If user exists by email, return it."""
        existing = await self.get_by_email(email)
        if existing:
            return existing, False
        user = await self.create(name=name, email=email, phone=phone)
        return user, True
