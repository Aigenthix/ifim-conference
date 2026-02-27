"""
Chatbot service — Gemini-powered event FAQ assistant.

Uses event context (overview, speakers, schedule) directly
instead of full RAG pipeline for simplicity.
"""
from __future__ import annotations

import json
import re
import uuid

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.chat_repo import ChatLogRepository
from app.repositories.event_repo import EventRepository
from app.schemas.chat import ChatQueryRequest, ChatQueryResponse


def _normalize_query(value: str) -> str:
    lowered = value.lower().replace("—", " ").replace("–", " ")
    lowered = re.sub(r"[^a-z0-9\s]", " ", lowered)
    return re.sub(r"\s+", " ", lowered).strip()


RAW_BFSI_AI_FAQ_ANSWERS: dict[str, str] = {
    "How can technology practically improve my daily business operations?": (
        "Key Points:\n"
        "- Target repetitive BFSI workflows first: onboarding, KYC checks, and follow-ups.\n"
        "- Use AI for document extraction, meeting summaries, and next-action drafts.\n"
        "- Track impact weekly: turnaround time, compliance errors, and conversion."
    ),
    "Which 2–3 tools should I start with if I am new to tech adoption?": (
        "Key Points:\n"
        "- Start with 1 CRM, 1 automation layer, and 1 AI assistant.\n"
        "- Typical stack: Zoho/Salesforce, Make/Zapier, and AI copilot for drafts.\n"
        "- Roll out one use case at a time before adding new tools."
    ),
    "How can I use technology to enhance client engagement, not just reporting?": (
        "Key Points:\n"
        "- Use AI to personalize nudges by life stage, risk profile, and portfolio behavior.\n"
        "- Automate timely follow-ups after meetings, market events, and maturity dates.\n"
        "- Keep human advisory calls for key decisions and trust-building."
    ),
    "What mistakes do professionals commonly make while adopting digital tools?": (
        "Key Points:\n"
        "- Buying too many tools before defining one clear business outcome.\n"
        "- Ignoring data quality, so AI outputs become unreliable.\n"
        "- Running automation without review checkpoints for compliance."
    ),
    "How can automation help me save time and scale my practice?": (
        "Key Points:\n"
        "- Automate intake, reminders, documentation, and internal handoffs.\n"
        "- Let AI draft routine client communication and summarize interactions.\n"
        "- Reinvest saved time in advisory, relationship calls, and high-value cases."
    ),
    "How do I balance personal connect vs digital systems?": (
        "Key Points:\n"
        "- Use digital for repeatable work; reserve human time for judgment-heavy advice.\n"
        "- Set clear touchpoints: digital updates weekly, personal reviews monthly/quarterly.\n"
        "- Measure trust signals, not just process speed."
    ),
    "Will there be tool demonstrations or only discussion?": (
        "Key Points:\n"
        "- The format is discussion-first with practical BFSI + AI examples.\n"
        "- Live scenario walkthroughs can be taken if time permits.\n"
        "- Focus stays on decision frameworks, not vendor pitches."
    ),
    "Can we ask specific platform-related queries?": (
        "Key Points:\n"
        "- Yes, platform-specific queries are encouraged.\n"
        "- Frame them as use case + constraint + expected outcome.\n"
        "- This helps get practical, implementable answers faster."
    ),
    "Will resources or tool lists be shared after session?": (
        "Key Points:\n"
        "- Yes, key frameworks and tool references can be shared post-session.\n"
        "- Prioritize tools by use case: acquisition, advisory, compliance, and operations.\n"
        "- Keep a 30-60-90 day rollout checklist."
    ),
    "How much time is available for Q&A?": (
        "Key Points:\n"
        "- Each discussion block includes focused Q&A windows.\n"
        "- Keep questions short and scenario-based for better coverage.\n"
        "- Deeper issues can be parked for follow-up notes."
    ),
    "Leader readiness tip: Be ready with 3 tools + 3 use cases + 1 caution story.": (
        "Leader Checklist:\n"
        "- 3 tools mapped to onboarding, engagement, and compliance.\n"
        "- 3 real use cases with measurable outcomes.\n"
        "- 1 caution story highlighting a failed rollout and lesson learned."
    ),
    "When is the right time to hire my first team member?": (
        "Key Points:\n"
        "- Hire when founder bandwidth is consistently blocked by repeatable tasks.\n"
        "- Start with roles tied to revenue support or compliance reliability.\n"
        "- Define outcomes before hiring, not after."
    ),
    "How do I define roles when my business is still small?": (
        "Key Points:\n"
        "- Define roles by outcome buckets: client service, operations, and compliance.\n"
        "- Use a simple RACI matrix for ownership clarity.\n"
        "- Review role scope every 30 days during early growth."
    ),
    "How can I build ownership mindset instead of dependency?": (
        "Key Points:\n"
        "- Assign outcome KPIs, not just task lists.\n"
        "- Give decision rights with guardrails and escalation rules.\n"
        "- Run weekly review rhythms with evidence-based feedback."
    ),
    "What are simple ways to track team productivity?": (
        "Key Points:\n"
        "- Track throughput, turnaround time, and quality/compliance error rates.\n"
        "- Use one dashboard for team-level visibility.\n"
        "- Review trend direction, not just absolute numbers."
    ),
    "How do I handle team attrition or low motivation?": (
        "Key Points:\n"
        "- Diagnose root cause: compensation, role mismatch, manager load, or unclear growth.\n"
        "- Add monthly career conversations and quarterly skill plans.\n"
        "- Use AI to reduce repetitive work that causes burnout."
    ),
    "Should I hire for skill or attitude first?": (
        "Key Points:\n"
        "- For early teams, hire for attitude + learning speed first.\n"
        "- Validate baseline skill with scenario tests.\n"
        "- Use clear probation outcomes and coaching checkpoints."
    ),
    "Can we discuss our specific team challenges openly?": (
        "Key Points:\n"
        "- Yes, practical team challenges are encouraged.\n"
        "- Share context without exposing sensitive client data.\n"
        "- The goal is actionable solutions, not theoretical debate."
    ),
    "Will there be templates for role clarity or review systems?": (
        "Key Points:\n"
        "- Yes, role clarity and review rhythm templates can be provided.\n"
        "- Use weekly execution review + monthly development review.\n"
        "- Keep scoring simple and behavior-linked."
    ),
    "Is this discussion confidential within the group?": (
        "Key Points:\n"
        "- Session sharing should stay professional and confidential.\n"
        "- Avoid naming clients or revealing identifiable data.\n"
        "- Discuss patterns and practices, not sensitive records."
    ),
    "Will we get examples from real practices?": (
        "Key Points:\n"
        "- Yes, examples are practice-led and implementation-oriented.\n"
        "- Cases usually cover advisory workflows, team systems, and compliance handling.\n"
        "- You can request examples relevant to your business model."
    ),
    "Leader readiness tip: Be ready with role clarity example + review rhythm + hiring philosophy.": (
        "Leader Checklist:\n"
        "- Bring one role-clarity sample with ownership and KPIs.\n"
        "- Bring a weekly and monthly review cadence.\n"
        "- Define your hiring philosophy in one sentence."
    ),
    "How do I build meaningful professional relationships beyond events?": (
        "Key Points:\n"
        "- Move from one-time contact to value-based follow-up.\n"
        "- Share useful BFSI insights, referrals, or introductions regularly.\n"
        "- Build trust through consistency, not frequency alone."
    ),
    "What should be my networking strategy — quantity or quality?": (
        "Key Points:\n"
        "- Start with quality-first clusters aligned to your niche.\n"
        "- Maintain a pipeline: core circle, growth circle, opportunity circle.\n"
        "- Track depth of interaction, not just contact count."
    ),
    "How do I follow up without sounding transactional?": (
        "Key Points:\n"
        "- Follow up with context + value, not only requests.\n"
        "- Reference the prior discussion and offer one relevant resource.\n"
        "- Use a light cadence and avoid generic broadcast messages."
    ),
    "How can I convert networking into collaboration opportunities?": (
        "Key Points:\n"
        "- Identify complementary strengths and target shared client outcomes.\n"
        "- Start with low-risk pilots like co-webinars or co-referral workflows.\n"
        "- Define responsibilities, timeline, and success criteria upfront."
    ),
    "What platforms or forums are best for networking in our profession?": (
        "Key Points:\n"
        "- Prefer niche BFSI communities, curated founder groups, and domain events.\n"
        "- Use LinkedIn strategically for thought leadership and warm outreach.\n"
        "- Prioritize platforms where your ideal collaborators are active."
    ),
    "How do I position myself while networking?": (
        "Key Points:\n"
        "- Use a clear positioning line: who you help, how, and with what outcome.\n"
        "- Share one proof point and one differentiator.\n"
        "- Keep tone consultative, not promotional."
    ),
    "Will there be interaction activities within group?": (
        "Key Points:\n"
        "- Yes, interactive activities are included to accelerate peer learning.\n"
        "- Expect short rounds, focused sharing, and practical feedback.\n"
        "- Keep examples concise for maximum participation."
    ),
    "Can we exchange contacts during the session?": (
        "Key Points:\n"
        "- Yes, contact exchange is encouraged.\n"
        "- Share context with your contact so follow-up is meaningful.\n"
        "- Capture one next step before ending the conversation."
    ),
    "Will there be structured networking or open discussion?": (
        "Key Points:\n"
        "- Both formats may be used depending on session flow.\n"
        "- Structured rounds help breadth; open discussion helps depth.\n"
        "- Use the format to create clear collaboration next steps."
    ),
    "How much time is allocated for sharing experiences?": (
        "Key Points:\n"
        "- Time is typically split across multiple participants in each block.\n"
        "- Keep your example in problem-action-result format.\n"
        "- Prioritize insights that others can apply immediately."
    ),
    "Leader readiness tip: Be ready with networking framework (Meet → Nurture → Collaborate).": (
        "Leader Checklist:\n"
        "- Meet: identify high-fit contacts with clear context.\n"
        "- Nurture: add value in 3 planned touchpoints.\n"
        "- Collaborate: propose one concrete pilot with shared outcomes."
    ),
    "How do I communicate my value proposition clearly to prospects?": (
        "Key Points:\n"
        "- Use one-line clarity: audience, problem solved, and measurable outcome.\n"
        "- Support it with one case example and one proof metric.\n"
        "- Remove jargon and focus on client impact."
    ),
    "What are common communication mistakes professionals make?": (
        "Key Points:\n"
        "- Speaking feature-first instead of outcome-first.\n"
        "- Overloading information without decision framing.\n"
        "- Not checking understanding before moving ahead."
    ),
    "How can storytelling improve client conversations?": (
        "Key Points:\n"
        "- Storytelling makes abstract financial concepts relatable.\n"
        "- Use problem -> action -> result for trust and clarity.\n"
        "- Pair each story with a practical next step."
    ),
    "How do I handle difficult client conversations?": (
        "Key Points:\n"
        "- Start with empathy, then align on facts and options.\n"
        "- Separate emotional concerns from financial decisions.\n"
        "- End with documented actions, owners, and timelines."
    ),
    "What is the difference between information sharing and communication?": (
        "Key Points:\n"
        "- Information sharing is sending data; communication is creating understanding.\n"
        "- Good communication checks clarity, intent, and decision readiness.\n"
        "- In BFSI, communication must also satisfy compliance context."
    ),
    "How can I build confidence while speaking in groups or meetings?": (
        "Key Points:\n"
        "- Prepare a repeatable structure for openings and key points.\n"
        "- Practice with small groups and record-review cycles.\n"
        "- Use evidence and examples to reduce speaking anxiety."
    ),
    "Will there be role plays or only discussion?": (
        "Key Points:\n"
        "- Both can be used: discussion for principles, role-play for execution.\n"
        "- Role plays help test objection handling and clarity under pressure.\n"
        "- Feedback will focus on practical improvement points."
    ),
    "Can we share our real communication scenarios?": (
        "Key Points:\n"
        "- Yes, real scenarios are encouraged for better outcomes.\n"
        "- Remove client-identifying information before sharing.\n"
        "- Bring one scenario with context, challenge, and desired outcome."
    ),
    "Will feedback be given during exercises?": (
        "Key Points:\n"
        "- Yes, structured and constructive feedback is expected.\n"
        "- Focus is on clarity, confidence, and conversion quality.\n"
        "- Apply feedback in the next role-play cycle immediately."
    ),
    "Will any communication templates be shared?": (
        "Key Points:\n"
        "- Yes, concise communication frameworks/templates can be shared.\n"
        "- Use templates as baseline, then personalize by client segment.\n"
        "- Keep language compliant and outcome-focused."
    ),
    "Leader readiness tip: Be ready with 2 role-play scenarios + 1 structure for conversation.": (
        "Leader Checklist:\n"
        "- Prepare 2 realistic scenarios: one objection, one high-stakes decision.\n"
        "- Use one conversation structure: context -> options -> recommendation -> next steps.\n"
        "- Define the success signal for each scenario."
    ),
    "What is the objective of this group discussion?": (
        "Key Points:\n"
        "- Convert ideas into practical BFSI execution plans.\n"
        "- Share peer-tested approaches across technology, team, networking, and communication.\n"
        "- Leave with actionable steps and ownership."
    ),
    "What outcome should we expect by end of session?": (
        "Key Points:\n"
        "- 2-3 implementable actions for your practice.\n"
        "- Clearer priorities for growth, compliance, and client experience.\n"
        "- Peer connections for accountability and collaboration."
    ),
    "How interactive is this session?": (
        "Key Points:\n"
        "- It is designed to be highly interactive and practical.\n"
        "- Expect Q&A, peer sharing, and scenario-based inputs.\n"
        "- Participation quality directly improves outcomes."
    ),
    "Are we expected to take notes or share reflections?": (
        "Key Points:\n"
        "- Yes, short notes and reflections are strongly recommended.\n"
        "- Capture problem, insight, and next action.\n"
        "- Reflection improves execution after the event."
    ),
    "Will there be summary or takeaway capture?": (
        "Key Points:\n"
        "- Yes, key takeaways can be consolidated post-session.\n"
        "- Organize by theme: tech, team, networking, communication.\n"
        "- Convert each takeaway into one measurable action."
    ),
    "How should we maintain time discipline within group?": (
        "Key Points:\n"
        "- Use fixed speaking windows and a visible timer.\n"
        "- Keep inputs in problem -> action -> result format.\n"
        "- Park deep dives and close with clear action ownership."
    ),
}

BFSI_AI_FAQ_ANSWERS = {
    _normalize_query(question): answer
    for question, answer in RAW_BFSI_AI_FAQ_ANSWERS.items()
}


def _get_curated_bfsi_ai_answer(query: str) -> str | None:
    normalized = _normalize_query(query)
    if not normalized:
        return None

    direct = BFSI_AI_FAQ_ANSWERS.get(normalized)
    if direct:
        return direct

    for key, answer in BFSI_AI_FAQ_ANSWERS.items():
        if len(key) >= 24 and (key in normalized or normalized in key):
            return answer

    return None


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

        curated = _get_curated_bfsi_ai_answer(payload.query)
        if curated:
            response_text = curated
            sources = ["curated_bfsi_ai_faq"]
        else:
            # Build context from event data
            context = await self._build_event_context(payload.event_id)

            # Generate LLM response
            response_text = await generate_response(
                query=payload.query,
                context=context,
                history=payload.history,
            )
            sources = ["event_data"]

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
            sources=sources,
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
