"""Create sessions and alerts tables in the database."""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import text
from app.db.session import get_session_factory, init_db


async def create_tables():
    await init_db()
    factory = get_session_factory()

    async with factory() as session:
        # Create sessions table
        await session.execute(text("""
            CREATE TABLE IF NOT EXISTS sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
                title VARCHAR(500) NOT NULL,
                speaker_name VARCHAR(300),
                speaker_title VARCHAR(500),
                day INTEGER NOT NULL DEFAULT 1,
                display_order INTEGER NOT NULL DEFAULT 0,
                audio_url TEXT,
                video_url TEXT,
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
            CREATE INDEX IF NOT EXISTS ix_sessions_event_day ON sessions(event_id, day);
        """))

        # Create alerts table
        await session.execute(text("""
            CREATE TABLE IF NOT EXISTS alerts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
                title VARCHAR(500) NOT NULL,
                message TEXT NOT NULL,
                is_pinned BOOLEAN NOT NULL DEFAULT false,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            );
            CREATE INDEX IF NOT EXISTS ix_alerts_event_id ON alerts(event_id);
        """))

        await session.commit()
        print("✅ Sessions and Alerts tables created")


if __name__ == "__main__":
    asyncio.run(create_tables())
