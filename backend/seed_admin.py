"""Seed the admin user from environment variables."""
import asyncio
import os
import sys
import uuid

sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import select
from app.db.session import get_session_factory, init_db
from app.models.admin import AdminUser
from app.core.security import hash_password


async def seed_admin():
    await init_db()
    factory = get_session_factory()

    email = os.getenv("ADMIN_DEFAULT_EMAIL", "admin@rajdarbar.com")
    password = os.getenv("ADMIN_DEFAULT_PASSWORD", "RajDarbar2026!")

    async with factory() as session:
        stmt = select(AdminUser).where(AdminUser.email == email)
        result = await session.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            print(f"Admin user already exists: {email}")
            return

        admin = AdminUser(
            id=uuid.uuid4(),
            email=email,
            hashed_password=hash_password(password),
            role="admin",
        )
        session.add(admin)
        await session.commit()
        print(f"✅ Admin user created: {email}")


if __name__ == "__main__":
    asyncio.run(seed_admin())
