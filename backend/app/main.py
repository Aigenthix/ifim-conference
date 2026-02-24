"""
FastAPI application factory.

Creates a fully configured FastAPI app with:
  - Lifespan context manager (DB + Redis + WS init/cleanup)
  - All API v1 routers
  - WebSocket routes
  - CORS middleware
  - Global exception handlers
  - Structured logging
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import setup_logging
from app.db.session import close_db, get_redis, init_db
from app.websocket.manager import ws_manager
import redis.asyncio as aioredis


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan — startup and shutdown hooks."""
    import asyncio
    settings = get_settings()

    # ── Startup ────────────────────────────────────────────
    setup_logging()

    # Create local upload directories
    for dir_path in (settings.UPLOAD_DIR, settings.CERTIFICATES_DIR, settings.GALLERY_DIR):
        Path(dir_path).mkdir(parents=True, exist_ok=True)

    await init_db()
    redis = get_redis()
    await ws_manager.start(redis)

    # Start background poll generator
    poll_task = asyncio.create_task(_poll_generation_loop(redis))

    yield

    # ── Shutdown ───────────────────────────────────────────
    poll_task.cancel()
    await ws_manager.stop()
    await close_db()


async def _poll_generation_loop(redis: aioredis.Redis) -> None:
    """Background loop: generate a new AI poll every 10 minutes."""
    import asyncio
    import logging
    from app.db.session import get_session_factory
    from app.services.poll_generator import create_ai_poll
    from app.services.chatbot_service import ChatbotService
    from app.repositories.event_repo import EventRepository

    logger = logging.getLogger(__name__)
    INTERVAL = 10 * 60  # 10 minutes

    # Wait 30 seconds before first generation to let app fully start
    await asyncio.sleep(30)

    while True:
        try:
            session_factory = get_session_factory()
            async with session_factory() as session:
                # Find all active events
                repo = EventRepository(session)
                events = await repo.get_active_events()

                for event in events:
                    try:
                        # Build context from event data
                        chatbot = ChatbotService(session=session, redis=redis)
                        context = await chatbot._build_event_context(event.id)

                        await create_ai_poll(
                            session=session,
                            redis=redis,
                            event_id=event.id,
                            event_context=context,
                        )
                        logger.info(f"Generated new AI poll for event: {event.title}")
                    except Exception as exc:
                        logger.error(f"Poll generation failed for {event.id}: {exc}")

        except asyncio.CancelledError:
            break
        except Exception as exc:
            logger.error(f"Poll generation loop error: {exc}", exc_info=True)

        await asyncio.sleep(INTERVAL)


def create_app() -> FastAPI:
    """Build and return the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Scalable event platform backend — QR registration, live polls, RAG chatbot, certificates",
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        default_response_class=JSONResponse,
        lifespan=lifespan,
    )

    # ── CORS ───────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Exception handlers ─────────────────────────────────
    register_exception_handlers(app)

    # ── API v1 routers ─────────────────────────────────────
    from app.api.v1.auth import router as auth_router
    from app.api.v1.events import router as events_router
    from app.api.v1.polls import router as polls_router
    from app.api.v1.feedback import router as feedback_router
    from app.api.v1.certificates import router as certs_router
    from app.api.v1.gallery import router as gallery_router
    from app.api.v1.chatbot import router as chatbot_router
    from app.api.v1.admin import router as admin_router
    from app.api.v1.admin_auth import router as admin_auth_router
    from app.api.v1.sessions import router as sessions_router
    from app.api.v1.alerts import router as alerts_router

    api_prefix = "/api/v1"
    app.include_router(auth_router, prefix=api_prefix)
    app.include_router(events_router, prefix=api_prefix)
    app.include_router(polls_router, prefix=api_prefix)
    app.include_router(feedback_router, prefix=api_prefix)
    app.include_router(certs_router, prefix=api_prefix)
    app.include_router(gallery_router, prefix=api_prefix)
    app.include_router(chatbot_router, prefix=api_prefix)
    app.include_router(admin_router, prefix=api_prefix)
    app.include_router(admin_auth_router, prefix=api_prefix)
    app.include_router(sessions_router, prefix=api_prefix)
    app.include_router(alerts_router, prefix=api_prefix)

    # ── WebSocket routes ───────────────────────────────────
    from app.websocket.poll_ws import router as poll_ws_router

    app.include_router(poll_ws_router)

    # ── Health check ───────────────────────────────────────
    @app.get("/health", tags=["health"])
    async def health_check() -> dict:
        return {"status": "healthy", "version": settings.APP_VERSION}

    return app


# Module-level app instance for uvicorn
app = create_app()
