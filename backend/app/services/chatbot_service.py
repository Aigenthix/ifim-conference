"""
Chatbot service — Gemini-powered event FAQ assistant.

Uses event context (overview, speakers, schedule) directly
instead of full RAG pipeline for simplicity.
"""
from __future__ import annotations

import json
import uuid

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.chat_repo import ChatLogRepository
from app.repositories.event_repo import EventRepository
from app.schemas.chat import ChatQueryRequest, ChatQueryResponse


class ChatbotService:
    """
    Event FAQ assistant using Gemini directly.
    Builds context from event data (speakers, schedule, team, description)
    and answers questions using Gemini 2.5 Flash.
    """

    def __init__(
        self,
        session: AsyncSession,
        redis: aioredis.Redis,
    ) -> None:
        self._chat_repo = ChatLogRepository(session)
        self._event_repo = EventRepository(session)
        self._redis = redis

    async def ask(
        self,
        user_id: uuid.UUID,
        payload: ChatQueryRequest,
    ) -> ChatQueryResponse:
        """Process a user query using Gemini with event context."""
        from app.ai.llm_client import generate_response

        # Build context from event data
        context = await self._build_event_context(payload.event_id)

        # Generate LLM response
        response_text = await generate_response(
            query=payload.query,
            context=context,
        )

        # Store chat log
        await self._chat_repo.create(
            event_id=payload.event_id,
            user_id=user_id,
            query=payload.query,
            response=response_text,
        )

        return ChatQueryResponse(
            query=payload.query,
            response=response_text,
            sources=["event_data"],
        )

    async def _build_event_context(self, event_id: uuid.UUID) -> str:
        """Build comprehensive context string from event data."""
        # Try cache first
        cache_key = f"chatbot:context:{event_id}"
        cached = await self._redis.get(cache_key)
        if cached:
            return cached.decode() if isinstance(cached, bytes) else cached

        # Fetch event from DB
        event = await self._event_repo.get_by_id(event_id)
        if not event:
            return "No event information available."

        parts = []
        parts.append(f"Event: {event.title}")
        if event.description:
            parts.append(f"Description: {event.description}")

        if event.overview_json:
            overview = json.loads(event.overview_json)
            if overview.get("venue"):
                parts.append(f"Venue: {overview['venue']}")
            if overview.get("dress_code"):
                parts.append(f"Dress Code: {overview['dress_code']}")
            if overview.get("schedule"):
                parts.append("Schedule:")
                for item in overview["schedule"]:
                    parts.append(f"  - {item.get('day', '')}: {item.get('time', '')} — {item.get('title', '')}")

        if event.speakers_json:
            speakers = json.loads(event.speakers_json)
            parts.append("Speakers:")
            for s in speakers:
                line = f"  - {s.get('name', '')}"
                if s.get("title"):
                    line += f" ({s['title']})"
                if s.get("bio"):
                    line += f" — {s['bio']}"
                parts.append(line)

        if event.team_json:
            team = json.loads(event.team_json)
            parts.append("Team:")
            for t in team:
                line = f"  - {t.get('name', '')}"
                if t.get("role"):
                    line += f" ({t['role']})"
                parts.append(line)

        context = "\n".join(parts)

        # Cache for 10 minutes
        await self._redis.setex(cache_key, 600, context)

        return context
