"""
Async database session factory.

Provides the async engine, session maker, and a Redis connection pool.
All I/O is non-blocking.
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import get_settings

_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None
_redis_pool: aioredis.Redis | None = None


# ── Engine / Session ─────────────────────────────────────────

def get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        settings = get_settings()
        _engine = create_async_engine(
            settings.DATABASE_URL,
            pool_size=settings.DB_POOL_SIZE,
            max_overflow=settings.DB_MAX_OVERFLOW,
            pool_pre_ping=True,
            pool_recycle=1800,      # Recycle connections every 30 min
            pool_timeout=30,        # Wait max 30s for a free connection
            echo=False,             # Never log SQL in production
        )
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            bind=get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _session_factory


@asynccontextmanager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async session and guarantee cleanup."""
    factory = get_session_factory()
    session = factory()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency — yields an AsyncSession."""
    async with get_db_session() as session:
        yield session


# ── Redis ─────────────────────────────────────────────────────

def get_redis() -> aioredis.Redis:
    global _redis_pool
    if _redis_pool is None:
        settings = get_settings()
        _redis_pool = aioredis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            max_connections=200,      # Higher for 200K users
            socket_connect_timeout=5,
            retry_on_timeout=True,
        )
    return _redis_pool


# ── Lifecycle ─────────────────────────────────────────────────

async def init_db() -> None:
    """Call on app startup — validates connectivity."""
    engine = get_engine()
    async with engine.begin() as conn:
        # Quick connectivity check
        await conn.execute(
            __import__("sqlalchemy").text("SELECT 1")
        )


async def close_db() -> None:
    """Call on app shutdown — disposes the engine and Redis pool."""
    global _engine, _session_factory, _redis_pool

    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _session_factory = None

    if _redis_pool is not None:
        await _redis_pool.aclose()
        _redis_pool = None
