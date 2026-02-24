"""Fix admin password hash - run inside the API container."""
import asyncio
import bcrypt
from sqlalchemy import text
from app.db.session import get_session_factory, init_db


async def fix_admin():
    await init_db()
    factory = get_session_factory()

    password = b"RajDarbar2026!"
    new_hash = bcrypt.hashpw(password, bcrypt.gensalt()).decode("utf-8")

    # Verify the hash works
    assert bcrypt.checkpw(password, new_hash.encode("utf-8")), "Hash verification failed!"
    print(f"New hash: {new_hash}")
    print(f"Self-verify: OK")

    async with factory() as session:
        await session.execute(
            text("UPDATE admin_users SET hashed_password = :h WHERE email = :e"),
            {"h": new_hash, "e": "admin@rajdarbar.com"},
        )
        await session.commit()
        print("✅ Admin password hash updated successfully")


if __name__ == "__main__":
    asyncio.run(fix_admin())
