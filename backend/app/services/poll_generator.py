"""
AI Poll Generator — Uses Gemini to create dynamic poll questions.

Generates event-relevant poll questions every 10 minutes,
deactivates old polls, and creates new ones visible to all users.
"""
from __future__ import annotations

import json
import logging
import uuid

import httpx
import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.repositories.poll_repo import PollRepository

logger = logging.getLogger(__name__)


async def generate_poll_question(event_context: str, existing_questions: list[str]) -> dict | None:
    """Use Gemini to generate a single poll question with 4 options."""
    settings = get_settings()

    existing_str = "\n".join(f"- {q}" for q in existing_questions[-10:]) if existing_questions else "None yet"

    prompt = f"""You are generating a live poll question for an event.

Event context:
{event_context}

Previously asked questions (DO NOT repeat these):
{existing_str}

Generate ONE new, engaging poll question relevant to this event's theme. 
The question should be:
- Fun and engaging for event attendees
- Related to business, technology, leadership, or the event theme
- Different from all previously asked questions

Respond ONLY with valid JSON in this exact format:
{{"question": "Your question here?", "options": ["Option A", "Option B", "Option C", "Option D"]}}
"""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent",
                params={"key": settings.GEMINI_API_KEY},
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.9,
                        "maxOutputTokens": 300,
                    },
                },
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()

            candidates = data.get("candidates", [])
            if not candidates:
                return None

            text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")

            # Extract JSON from response (handle markdown code blocks)
            text = text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1] if "\n" in text else text[3:]
                text = text.rsplit("```", 1)[0]
            text = text.strip()

            parsed = json.loads(text)

            if "question" in parsed and "options" in parsed and len(parsed["options"]) >= 2:
                return parsed
            return None

    except Exception as exc:
        logger.error(f"AI poll generation failed: {exc}", exc_info=True)
        return None


async def create_ai_poll(
    session: AsyncSession,
    redis: aioredis.Redis,
    event_id: uuid.UUID,
    event_context: str,
) -> bool:
    """
    Generate and create a new AI poll for the event.
    Deactivates old polls and creates a fresh one.
    """
    repo = PollRepository(session)

    # Get existing questions to avoid repeats
    from sqlalchemy import select
    from app.models.poll import Poll
    stmt = select(Poll.question).where(Poll.event_id == event_id)
    result = await session.execute(stmt)
    existing_questions = [row[0] for row in result.all()]

    # Generate new question via AI
    poll_data = await generate_poll_question(event_context, existing_questions)
    if not poll_data:
        logger.warning("AI failed to generate a poll question, skipping cycle")
        return False

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

    logger.info(f"AI generated new poll: {poll_data['question']}")
    return True
