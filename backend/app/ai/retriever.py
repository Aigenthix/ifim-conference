"""
Retriever module — bridges embedding generation and vector search.
"""
from __future__ import annotations

import uuid
from typing import List

from app.ai.vector_store import search_similar
from app.core.config import get_settings


async def retrieve_relevant_docs(
    event_id: uuid.UUID,
    embedding: List[float],
) -> List[dict]:
    """
    Retrieve the most relevant documents for a query embedding.

    Returns list of dicts: [{"content": ..., "source": ..., "similarity": ...}]
    """
    settings = get_settings()
    return await search_similar(
        event_id=event_id,
        query_embedding=embedding,
        top_k=settings.RAG_TOP_K,
    )
