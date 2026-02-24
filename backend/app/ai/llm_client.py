"""
LLM client — generates responses using Gemini 2.5 Flash.

Designed as a thin wrapper so the LLM provider can be swapped
without touching any business logic.
"""
from __future__ import annotations

import httpx

from app.core.config import get_settings


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
