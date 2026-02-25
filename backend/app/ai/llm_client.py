"""
LLM client — generates responses using Gemini 2.5 Flash.

Designed as a thin wrapper so the LLM provider can be swapped
without touching any business logic.
"""
from __future__ import annotations

import json
import logging
import time

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


async def generate_response(query: str, context: str) -> str:
    """
    Generate an LLM response given a user query and retrieved context.

    Uses Google Gemini API. Swap this function body
    to use any other LLM provider.
    """
    settings = get_settings()

    system_prompt = (
        "You are a helpful event assistant. Answer the user's question "
        "based ONLY on the provided context. If the context doesn't contain "
        "the answer, say so politely. Be concise and helpful.\n"
        "IMPORTANT: Respond in plain text ONLY. Do NOT use any markdown formatting, "
        "asterisks (*), bullet points, headers (#), or special characters. "
        "Use simple sentences and line breaks for structure.\n\n"
        f"Context:\n{context}"
    )

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent",
            params={"key": settings.GEMINI_API_KEY},
            headers={"Content-Type": "application/json"},
            json={
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": f"{system_prompt}\n\nUser question: {query}"}],
                    }
                ],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 500,
                },
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()

        # Extract text from Gemini response
        candidates = data.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts:
                return parts[0].get("text", "I couldn't generate a response.")

        return "I couldn't generate a response. Please try again."


def _extract_json_object(raw_text: str) -> dict | None:
    """
    Gemini can occasionally wrap JSON in prose; this extracts
    the first JSON object-like block safely.
    """
    if not raw_text:
        return None

    candidate = raw_text.strip()
    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        pass

    start = candidate.find("{")
    end = candidate.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None

    snippet = candidate[start : end + 1]
    try:
        return json.loads(snippet)
    except json.JSONDecodeError:
        return None


async def generate_strategy_compass_topics(count: int = 8) -> list[dict[str, object]]:
    """
    Generate random AI-in-BFSI strategy topics for the spin wheel.

    Returns an empty list if generation fails, so callers can
    gracefully fall back to static topics.
    """
    settings = get_settings()
    if not settings.GEMINI_API_KEY:
        return []

    prompt = (
        "You are creating content for an interactive spin wheel.\n"
        f"Generate exactly {count} unique AI in BFSI topics.\n"
        "Mandatory coverage: Algorithmic Trading, KYC Automation, Debt Collection AI, "
        "Synthetic Data for Privacy, ESG Scoring, and Claims Processing.\n"
        "Output STRICT JSON only with this shape:\n"
        '{ "topics": [ { '
        '"title": "string", '
        '"explanation": "one sentence", '
        '"how_it_works": "2 concise sentences", '
        '"business_impact": "2 concise sentences", '
        '"implementation_steps": ["step 1", "step 2", "step 3"], '
        '"kpis": ["kpi 1", "kpi 2", "kpi 3"]'
        " } ] }\n"
        "Rules:\n"
        "- title: concise, 3-8 words\n"
        "- explanation: exactly one sentence, 14-28 words, practical business impact\n"
        "- how_it_works: exactly 2 sentences, practical, no jargon overload\n"
        "- business_impact: exactly 2 sentences, include measurable outcomes\n"
        "- implementation_steps: exactly 3 short imperative steps\n"
        "- kpis: exactly 3 concise KPI names\n"
        "- no markdown, no numbering, no extra keys\n"
        f"- randomization seed: {time.time_ns()}"
    )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL}:generateContent",
                params={"key": settings.GEMINI_API_KEY},
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [
                        {
                            "role": "user",
                            "parts": [{"text": prompt}],
                        }
                    ],
                    "generationConfig": {
                        "temperature": 1.0,
                        "maxOutputTokens": 900,
                        "responseMimeType": "application/json",
                    },
                },
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()
    except Exception:
        logger.exception("Gemini generation failed for strategy compass topics")
        return []

    candidates = data.get("candidates", [])
    if not candidates:
        return []

    raw_text = ""
    parts = candidates[0].get("content", {}).get("parts", [])
    if parts:
        raw_text = parts[0].get("text", "")

    parsed = _extract_json_object(raw_text)
    if not parsed:
        return []

    topics = parsed.get("topics")
    if not isinstance(topics, list):
        return []

    cleaned: list[dict[str, object]] = []
    seen_titles: set[str] = set()
    for item in topics:
        if not isinstance(item, dict):
            continue
        title = str(item.get("title", "")).strip()
        explanation = str(item.get("explanation", "")).strip()
        how_it_works = str(item.get("how_it_works", "")).strip()
        business_impact = str(item.get("business_impact", "")).strip()
        implementation_steps = [
            str(step).strip()
            for step in item.get("implementation_steps", [])
            if str(step).strip()
        ]
        kpis = [
            str(kpi).strip()
            for kpi in item.get("kpis", [])
            if str(kpi).strip()
        ]
        normalized = title.casefold()
        if (
            not title
            or not explanation
            or not how_it_works
            or not business_impact
            or len(implementation_steps) < 3
            or len(kpis) < 3
            or normalized in seen_titles
        ):
            continue
        seen_titles.add(normalized)
        cleaned.append(
            {
                "title": title,
                "explanation": explanation,
                "how_it_works": how_it_works,
                "business_impact": business_impact,
                "implementation_steps": implementation_steps[:5],
                "kpis": kpis[:5],
            }
        )

    return cleaned
