"""
Embedding generation module — Gemini API.

Uses Google's text-embedding-004 model via the Gemini API.
Designed to be swappable with any provider via the same interface.
"""
from __future__ import annotations

from typing import List

import httpx

from app.core.config import get_settings


async def generate_embedding(text: str) -> List[float]:
    """
    Generate a vector embedding for the given text
    using Google's Gemini embedding API.
    """
    settings = get_settings()

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{settings.EMBEDDING_MODEL}:embedContent",
            params={"key": settings.GEMINI_API_KEY},
            headers={"Content-Type": "application/json"},
            json={
                "model": f"models/{settings.EMBEDDING_MODEL}",
                "content": {
                    "parts": [{"text": text}]
                },
            },
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["embedding"]["values"]


async def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts.
    Gemini doesn't have a native batch endpoint, so we
    make concurrent requests.
    """
    import asyncio

    tasks = [generate_embedding(text) for text in texts]
    return await asyncio.gather(*tasks)
