"""
WebSocket connection manager with Redis Pub/Sub fan-out.

Enables real-time updates across multiple API server instances.
Each instance subscribes to Redis Pub/Sub channels and broadcasts
to its locally connected WebSocket clients.
"""
from __future__ import annotations

import asyncio
import json
import uuid
from collections import defaultdict
from typing import Any

import redis.asyncio as aioredis
from fastapi import WebSocket

from app.core.logging import get_logger

logger = get_logger(__name__)


class ConnectionManager:
    """
    Manages WebSocket connections per event.

    Architecture:
        Client <-> FastAPI WebSocket <-> ConnectionManager <-> Redis Pub/Sub
                                                             <-> Other API instances

    This allows horizontal scaling — all instances receive
    pub/sub messages and fan-out to their local clients.
    """

    def __init__(self) -> None:
        # event_id -> set of WebSocket connections
        self._connections: dict[str, set[WebSocket]] = defaultdict(set)
        self._pubsub_task: asyncio.Task | None = None
        self._redis: aioredis.Redis | None = None

    async def start(self, redis: aioredis.Redis) -> None:
        """Start the Redis Pub/Sub listener."""
        self._redis = redis
        self._pubsub_task = asyncio.create_task(self._listen_pubsub())
        logger.info("WebSocket manager started with Redis Pub/Sub")

    async def stop(self) -> None:
        """Gracefully stop the Pub/Sub listener."""
        if self._pubsub_task:
            self._pubsub_task.cancel()
            try:
                await self._pubsub_task
            except asyncio.CancelledError:
                pass
        logger.info("WebSocket manager stopped")

    async def connect(self, websocket: WebSocket, event_id: str) -> None:
        """Accept a WebSocket connection and register it for an event."""
        await websocket.accept()
        self._connections[event_id].add(websocket)
        logger.info("ws_connected", event_id=event_id, total=len(self._connections[event_id]))

    async def disconnect(self, websocket: WebSocket, event_id: str) -> None:
        """Remove a WebSocket connection."""
        self._connections[event_id].discard(websocket)
        if not self._connections[event_id]:
            del self._connections[event_id]
        logger.info("ws_disconnected", event_id=event_id)

    async def broadcast_to_event(self, event_id: str, data: dict[str, Any]) -> None:
        """Send a message to all clients connected to an event."""
        dead_connections: list[WebSocket] = []

        for ws in self._connections.get(event_id, set()):
            try:
                await ws.send_json(data)
            except Exception:
                dead_connections.append(ws)

        # Clean up dead connections
        for ws in dead_connections:
            self._connections[event_id].discard(ws)

    async def _listen_pubsub(self) -> None:
        """
        Subscribe to all poll_updates:* channels and relay
        messages to locally connected WebSocket clients.
        """
        if not self._redis:
            return

        pubsub = self._redis.pubsub()
        await pubsub.psubscribe("poll_updates:*")

        try:
            async for message in pubsub.listen():
                if message["type"] == "pmessage":
                    # Channel format: poll_updates:{event_id}
                    channel = message["channel"]
                    if isinstance(channel, bytes):
                        channel = channel.decode()

                    event_id = channel.split(":", 1)[1]
                    poll_id = message["data"]
                    if isinstance(poll_id, bytes):
                        poll_id = poll_id.decode()

                    # Fetch latest counts from Redis
                    votes_key = f"poll:{poll_id}:votes"
                    counts = await self._redis.hgetall(votes_key)

                    await self.broadcast_to_event(event_id, {
                        "type": "poll_update",
                        "poll_id": poll_id,
                        "votes": {k: int(v) for k, v in counts.items()},
                    })
        except asyncio.CancelledError:
            await pubsub.punsubscribe("poll_updates:*")
            await pubsub.aclose()
            raise


# Singleton — shared across the app
ws_manager = ConnectionManager()
