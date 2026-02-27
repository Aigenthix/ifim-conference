"""
Auto-notification scheduler — fires alerts 15 minutes before each event session.

Uses Redis for:
  - Toggle state: "auto_alerts:{event_id}:enabled" = "1" or "0"
  - Sent tracking: "auto_alerts:{event_id}:sent:{schedule_key}" = "1"

Runs as an asyncio background task started on app startup.
"""
from __future__ import annotations

import asyncio
import json
import logging
import uuid
from datetime import datetime, timedelta, timezone

import redis.asyncio as aioredis

from app.db.session import get_engine, get_session_factory
from app.models.alert import Alert

logger = logging.getLogger(__name__)

IST = timezone(timedelta(hours=5, minutes=30))

# ── Hardcoded Event Schedule ─────────────────────────────────
# Format: (date_str, time_str, title)
# time_str is the start time of the session
EVENT_SCHEDULE = [
    # Day 1 — 27 Feb 2026 (Courtyard Marriott Vadodara)
    ("2026-02-27", "19:00", "Next Big Thing 2030 By Hitesh Mali"),
    ("2026-02-27", "20:00", "Networking and Dinner"),

    # Day 2 — 28 Feb 2026 (Grand Mercure The Surya Palace)
    ("2026-02-28", "07:30", "Morning Breakfast Tea and Coffee"),
    ("2026-02-28", "09:30", "Welcome Address By Priyanka Patil"),
    ("2026-02-28", "09:45", "Setting the Stage By Hitesh Mali"),
    ("2026-02-28", "10:00", "Progress Through Process By Nikhil Naik"),
    ("2026-02-28", "10:45", "Audience Q&A"),
    ("2026-02-28", "11:00", "Future In Focus By Siddharth Karnawat"),
    ("2026-02-28", "11:45", "Audience Q&A"),
    ("2026-02-28", "12:00", "Setting the Stage By Hitesh Mali"),
    ("2026-02-28", "12:15", "Book Journey The Ideal Entrepreneur By Rahul Agrawal"),
    ("2026-02-28", "13:00", "Audience Q&A"),
    ("2026-02-28", "13:15", "Lunch Break"),
    ("2026-02-28", "14:15", "The Powerful Comeback By Hitesh Mali"),
    ("2026-02-28", "14:30", "Succession Plan For Financial Distributors By Jatin Popat"),
    ("2026-02-28", "15:15", "Audience Q&A"),
    ("2026-02-28", "15:30", "Tea / Coffee Break"),
    ("2026-02-28", "15:45", "From Insight to Action By Hitesh Mali"),
    ("2026-02-28", "16:45", "Vote of Thanks By Bhargavi Patnaik"),
    ("2026-02-28", "19:00", "Networking and Gala Dinner"),
    ("2026-02-28", "00:00", "Tea / Coffee"),
]


def _schedule_key(date_str: str, time_str: str) -> str:
    return f"{date_str}_{time_str}"


async def _check_and_fire_alerts(
    redis: aioredis.Redis,
    event_id: str,
) -> None:
    """Check current time and fire alerts for sessions starting in ~15 minutes."""
    # Check if auto-notifications are enabled
    enabled = await redis.get(f"auto_alerts:{event_id}:enabled")
    if enabled != "1":
        return

    now = datetime.now(IST)

    for date_str, time_str, title in EVENT_SCHEDULE:
        session_dt = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
        session_dt = session_dt.replace(tzinfo=IST)

        alert_time = session_dt - timedelta(minutes=15)
        diff_seconds = (now - alert_time).total_seconds()

        # Fire if we're within 0-60 seconds of the alert time (1-minute window)
        if 0 <= diff_seconds < 60:
            skey = _schedule_key(date_str, time_str)
            sent_key = f"auto_alerts:{event_id}:sent:{skey}"

            # Check if already sent
            already_sent = await redis.get(sent_key)
            if already_sent:
                continue

            # Create the alert in the database
            try:
                factory = get_session_factory()
                async with factory() as session:
                    new_alert = Alert(
                        id=uuid.uuid4(),
                        event_id=uuid.UUID(event_id),
                        title=f"⏰ Coming Up: {title}",
                        message=f"{title} starts at {time_str}. Get ready!",
                        is_pinned=False,
                    )
                    session.add(new_alert)
                    await session.commit()
                    await session.refresh(new_alert)

                    # Publish via Redis for live notification
                    alert_data = json.dumps({
                        "type": "new_alert",
                        "alert": {
                            "id": str(new_alert.id),
                            "title": new_alert.title,
                            "message": new_alert.message,
                            "is_pinned": False,
                            "created_at": str(new_alert.created_at),
                        },
                    })
                    await redis.publish(f"alerts:{event_id}", alert_data)

                # Mark as sent (expire after 48 hours)
                await redis.set(sent_key, "1", ex=172800)
                logger.info(f"Auto-alert fired for: {title} at {time_str}")
            except Exception as e:
                logger.error(f"Failed to fire auto-alert for {title}: {e}")


async def auto_alert_loop(event_id: str) -> None:
    """Background loop that checks every 30 seconds for upcoming sessions."""
    from app.db.session import get_redis

    redis = get_redis()
    logger.info(f"Auto-alert scheduler started for event {event_id}")

    while True:
        try:
            await _check_and_fire_alerts(redis, event_id)
        except Exception as e:
            logger.error(f"Auto-alert scheduler error: {e}")
        await asyncio.sleep(30)


# ── Admin API helpers ────────────────────────────────────────

async def get_auto_alert_status(redis: aioredis.Redis, event_id: str) -> bool:
    enabled = await redis.get(f"auto_alerts:{event_id}:enabled")
    return enabled == "1"


async def set_auto_alert_status(redis: aioredis.Redis, event_id: str, enabled: bool) -> None:
    await redis.set(f"auto_alerts:{event_id}:enabled", "1" if enabled else "0")
