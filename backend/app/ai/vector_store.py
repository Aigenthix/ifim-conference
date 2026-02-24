"""
Vector store interface using pgvector.

Stores document embeddings in PostgreSQL with the pgvector extension,
enabling fast cosine similarity search.
"""
from __future__ import annotations

import uuid
from typing import List

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session_factory


async def store_document_embedding(
    event_id: uuid.UUID,
    content: str,
    source: str,
    embedding: List[float],
) -> None:
    """
    Store a document chunk with its embedding.

    Requires the pgvector extension and a document_embeddings table:

    CREATE TABLE document_embeddings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID NOT NULL REFERENCES events(id),
        content TEXT NOT NULL,
        source VARCHAR(500),
        embedding vector(1536),
        created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX ON document_embeddings
        USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
    """
    factory = get_session_factory()
    async with factory() as session:
        await session.execute(
            text("""
                INSERT INTO document_embeddings (event_id, content, source, embedding)
                VALUES (:event_id, :content, :source, :embedding)
            """),
            {
                "event_id": event_id,
                "content": content,
                "source": source,
                "embedding": str(embedding),
            },
        )
        await session.commit()


async def search_similar(
    event_id: uuid.UUID,
    query_embedding: List[float],
    top_k: int = 5,
) -> List[dict]:
    """
    Find the top-K most similar documents for an event
    using cosine distance with pgvector.
    """
    factory = get_session_factory()
    async with factory() as session:
        result = await session.execute(
            text("""
                SELECT content, source,
                       1 - (embedding <=> :query_embedding::vector) AS similarity
                FROM document_embeddings
                WHERE event_id = :event_id
                ORDER BY embedding <=> :query_embedding::vector
                LIMIT :top_k
            """),
            {
                "event_id": event_id,
                "query_embedding": str(query_embedding),
                "top_k": top_k,
            },
        )
        rows = result.fetchall()
        return [
            {
                "content": row[0],
                "source": row[1],
                "similarity": float(row[2]),
            }
            for row in rows
        ]
