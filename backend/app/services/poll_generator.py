"""
Poll Generator — Cycles through predefined poll questions.

Instead of AI generation, uses a fixed set of 25 curated poll questions
organized by category. Rotates through them every 10 minutes,
keeping 3 active polls at a time.
"""
from __future__ import annotations

import logging
import uuid

import redis.asyncio as aioredis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.poll import Poll
from app.repositories.poll_repo import PollRepository

logger = logging.getLogger(__name__)

# ── Fixed poll questions (25 total, across 6 categories) ────────
POLL_QUESTIONS = [
    # Category 1: Opening / Icebreaker
    {"question": "What brought you to this event today?",
     "options": ["Learning", "Networking", "Clarity", "Curiosity"]},
    {"question": "How do you currently describe your business journey?",
     "options": ["Growing", "Stable", "Exploring", "Reinventing"]},
    {"question": "What do you expect most from these 2 days?",
     "options": ["Ideas", "People", "Direction", "Motivation"]},
    {"question": "Which word describes your current business emotion?",
     "options": ["Excited", "Confused", "Hopeful", "Challenged"]},

    # Category 2: Growth Through Technology
    {"question": "Your current tech usage level?",
     "options": ["Advanced systems", "Moderate usage", "Basic tools", "Mostly manual"]},
    {"question": "Biggest tech barrier for you?",
     "options": ["Cost", "Complexity", "Time to learn", "Don't know where to start"]},
    {"question": "Do you believe technology can improve client trust?",
     "options": ["Strongly yes", "Maybe", "Not sure", "No"]},

    # Category 3: Growth Through Team
    {"question": "Your current team structure?",
     "options": ["Structured team", "Small team", "Solo with support", "Completely solo"]},
    {"question": "Biggest team challenge?",
     "options": ["Hiring", "Training", "Retention", "Productivity"]},
    {"question": "What matters more while hiring?",
     "options": ["Skill", "Attitude", "Culture fit", "Availability"]},
    {"question": "Do you conduct regular team review meetings?",
     "options": ["Yes", "Occasionally", "Rarely", "Never"]},

    # Category 4: Growth Through Networking
    {"question": "How often do you intentionally network?",
     "options": ["Weekly", "Monthly", "Occasionally", "Rarely"]},
    {"question": "Your networking style?",
     "options": ["Natural connector", "Selective", "Passive", "Avoid networking"]},
    {"question": "Biggest networking fear?",
     "options": ["Initiating conversation", "Following up", "Positioning", "Time"]},
    {"question": "Networking success for you means?",
     "options": ["Referrals", "Partnerships", "Learning", "Visibility"]},

    # Category 5: Growth Through Communication
    {"question": "Confidence while explaining your value proposition?",
     "options": ["Very confident", "Confident", "Improving", "Struggling"]},
    {"question": "Which communication format do you use most?",
     "options": ["Face-to-face", "WhatsApp", "Calls", "Presentations"]},
    {"question": "Biggest communication gap?",
     "options": ["Clarity", "Confidence", "Structure", "Listening"]},
    {"question": "Do clients fully understand what you do?",
     "options": ["Yes", "Mostly", "Sometimes", "Rarely"]},

    # Category 6: Reflection / Closing
    {"question": "Did this event challenge your thinking?",
     "options": ["Strongly yes", "Yes", "Slightly", "No"]},
    {"question": "Are you leaving with clarity or questions?",
     "options": ["Clarity", "Questions", "Both", "Processing"]},
    {"question": "Will you take action within 7 days?",
     "options": ["Definitely", "Likely", "Maybe", "Not sure"]},
    {"question": "Should Raj Darbar happen again?",
     "options": ["Absolutely", "Yes", "Maybe", "No"]},
]


async def create_ai_poll(
    session: AsyncSession,
    redis: aioredis.Redis,
    event_id: uuid.UUID,
    event_context: str,
) -> bool:
    """
    Create the next poll from the fixed question list.
    Cycles through questions, skipping any that have already been asked.
    Deactivates oldest active poll when there are 3+ active.
    """
    repo = PollRepository(session)

    # Get existing questions to know which have been asked
    stmt = select(Poll.question).where(Poll.event_id == event_id)
    result = await session.execute(stmt)
    existing_questions = {row[0] for row in result.all()}

    # Find the next unasked question
    poll_data = None
    for q in POLL_QUESTIONS:
        if q["question"] not in existing_questions:
            poll_data = q
            break

    if not poll_data:
        # All questions asked — cycle back: reset index by picking the first one
        # that doesn't have an *active* poll
        active_stmt = select(Poll.question).where(
            Poll.event_id == event_id, Poll.is_active == True
        )
        active_result = await session.execute(active_stmt)
        active_questions = {row[0] for row in active_result.all()}

        for q in POLL_QUESTIONS:
            if q["question"] not in active_questions:
                poll_data = q
                break

    if not poll_data:
        logger.info("All poll questions are currently active, nothing to add")
        return False

    # Deactivate the oldest active poll if we already have 3+ active
    active_stmt = (
        select(Poll)
        .where(Poll.event_id == event_id, Poll.is_active == True)
        .order_by(Poll.created_at.asc())
    )
    result = await session.execute(active_stmt)
    active_polls = result.scalars().all()

    if len(active_polls) >= 3:
        oldest = active_polls[0]
        oldest.is_active = False
        logger.info(f"Deactivated old poll: {oldest.question[:50]}")

    # Create the new poll in DB
    new_poll = await repo.create_with_options(
        event_id=event_id,
        question=poll_data["question"],
        option_texts=poll_data["options"][:4],
    )
    await session.commit()

    # Publish event so all connected clients refresh
    await redis.publish(
        f"poll_updates:{event_id}",
        f"new_poll:{new_poll.id}",
    )

    logger.info(f"Created fixed poll: {poll_data['question']}")
    return True
