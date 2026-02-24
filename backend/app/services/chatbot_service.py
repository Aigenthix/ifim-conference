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


# ── Comprehensive FAQ Data ──────────────────────────────────────
EVENT_FAQ = """
## Frequently Asked Questions

### Event Details
- Event: Raj Darbar 2026 — Time to Rule Your Segment
- Dates: 27–28 February 2026
- Day 1 Venue: Courtyard Marriott, Vadodara (27th Feb, 7:00 PM onwards)
- Day 2 Venue: Grand Mercure: The Surya Palace, Vadodara (28th Feb, 7:30 AM – 12:00 AM)
- Dress Code: Business Formal
- Entry: By Invitation Only
- Contact: 9321064995
- Website: www.equitywala.com
- Organized by: The Next Big Thing | Equitywala.com

### Growth Through Technology FAQs
- How can technology practically improve my daily business operations?
- Which 2–3 tools should I start with if I am new to tech adoption?
- How can I use technology to enhance client engagement, not just reporting?
- What mistakes do professionals commonly make while adopting digital tools?
- How can automation help me save time and scale my practice?
- How do I balance personal connect vs digital systems?
- Will there be tool demonstrations or only discussion? — There will be discussions with practical examples.
- Can we ask specific platform-related queries? — Yes, during Q&A sessions.
- Will resources or tool lists be shared after session? — Yes, post-event resources will be shared.

### Growth Through Team FAQs
- When is the right time to hire my first team member?
- How do I define roles when my business is still small?
- How can I build ownership mindset instead of dependency?
- What are simple ways to track team productivity?
- How do I handle team attrition or low motivation?
- Should I hire for skill or attitude first?
- Can we discuss our specific team challenges openly? — Yes, discussions are confidential within the group.
- Will there be templates for role clarity or review systems? — Yes, templates will be shared.

### Growth Through Networking FAQs
- How do I build meaningful professional relationships beyond events?
- What should be my networking strategy — quantity or quality?
- How do I follow up without sounding transactional?
- How can I convert networking into collaboration opportunities?
- What platforms or forums are best for networking in our profession?
- How do I position myself while networking?
- Will there be interaction activities within group? — Yes, structured networking activities are planned.
- Can we exchange contacts during the session? — Absolutely, networking is encouraged.

### Growth Through Communication FAQs
- How do I communicate my value proposition clearly to prospects?
- What are common communication mistakes professionals make?
- How can storytelling improve client conversations?
- How do I handle difficult client conversations?
- What is the difference between information sharing and communication?
- How can I build confidence while speaking in groups or meetings?
- Will there be role plays or only discussion? — Both, with practical exercises.
- Will feedback be given during exercises? — Yes, constructive feedback will be provided.

### General Event FAQs
- What is the objective of the group discussions? — To share experiences, learn from peers, and develop actionable strategies.
- What outcome should we expect by end of session? — Clear action items, new connections, and fresh perspectives.
- How interactive is this session? — Highly interactive with Q&A, group activities, and networking.
- Are we expected to take notes or share reflections? — Note-taking is encouraged, reflections will be collected.
- Will there be summary or takeaway capture? — Yes, key takeaways will be shared post-event.
"""

SPEAKER_BIOS = """
### Speaker Detailed Bios

**Jatin Popat** — Founder & CEO, WillJini | Lawyer and Company Secretary
Mr. Jatin Popat is a qualified Lawyer & Company Secretary with 30+ years of experience in Legal matters in India. He is the founder of WillJini, India's first and most Trusted Succession services company. Before founding WillJini, Mr. Jatin headed Legal & Compliances in Gulf Oil, a listed Hinduja Group company. He has conducted 1,000+ awareness sessions across India with a vision of "Harr Gharr ek Will" to make wealth transfer a simple process. Today, WillJini is India's No. 1 company in Succession Matters and has helped more than 20,000 families with Wills and Inheritance across 480 cities and 32 countries. His session topic: "Succession Plan for Financial Distributors".

**Siddharth Karnawat** — Co-Founder, Blue Sky Fintech
Mr. Siddharth Karnawat is a seasoned financial professional and entrepreneur with over 15 years of experience in financial services. He holds a B.Com from H.R. College of Commerce & Economics, Mumbai. As Co-Founder of Blue Sky Fintech, he provides transparent, independent, and goal-based wealth management solutions. He brings deep expertise in wealth management, investment strategy, and family office governance. His client-centric philosophy emphasizes disciplined capital allocation, prudent risk management, and sustainable wealth creation. He is a Fellow Chartered Member (FCP) of JITO, an active member of the Mumbai Cricket Association Club, BKC Mumbai, and a Donor Member of RVG Hostel, Mumbai. He hosts "Blue Sky Talks," a thought-leadership podcast featuring prominent personalities from finance, business, and sports, including Mr. Anil Singhvi (Zee Business) and Deepak Chahar (India - Mumbai Indians). His session topic: "Future In Focus".

**Hitesh Mali** — Founder, Equitywala.com
Hitesh Mali is the founder of Equitywala.com and the organizer of Raj Darbar 2026. He leads sessions on "Next Big Thing 2030", "Setting the Stage", "The Powerful Comeback", and "From Insight to Action" across both days.

**Nikhil Naik** — Founder, AD Naik Wealth
Nikhil Naik is the founder of AD Naik Wealth. His session topic is "Progress Through Process" where he discusses systematic approaches to business growth.

**Rahul Agarwal** — Founder, Ideal Insurance Brokers
Rahul Agarwal is the founder of Ideal Insurance Brokers. He presents "Book Journey: The Ideal Entrepreneur" where he shares insights from his entrepreneurial experience.
"""


class ChatbotService:
    """
    Event FAQ assistant using Gemini directly.
    Builds context from event data (speakers, schedule, team, description)
    plus comprehensive FAQ data and answers questions using Gemini 2.5 Flash.
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

        # Add comprehensive speaker bios
        parts.append("")
        parts.append(SPEAKER_BIOS)

        # Add FAQ data for comprehensive knowledge
        parts.append("")
        parts.append(EVENT_FAQ)

        context = "\n".join(parts)

        # Cache for 10 minutes
        await self._redis.setex(cache_key, 600, context)

        return context
