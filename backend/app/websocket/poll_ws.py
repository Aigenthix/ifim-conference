"""
WebSocket endpoint for live poll updates.
"""
from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from jose import JWTError

from app.core.security import TokenPayload, decode_access_token
from app.websocket.manager import ws_manager

router = APIRouter()


@router.websocket("/ws/polls/{event_id}")
async def poll_websocket(
    websocket: WebSocket,
    event_id: str,
    token: str = Query(...),
) -> None:
    """
    WebSocket endpoint for live poll updates.

    Authentication via ?token=<JWT> query parameter.
    Client receives JSON messages:
        {"type": "poll_update", "poll_id": "...", "votes": {"option_id": count}}
    """
    # Authenticate
    try:
        payload = decode_access_token(token)
        user = TokenPayload(payload)
    except (JWTError, KeyError):
        await websocket.close(code=4001, reason="Invalid token")
        return

    # Verify event scope
    if str(user.event_id) != event_id:
        await websocket.close(code=4003, reason="Event mismatch")
        return

    await ws_manager.connect(websocket, event_id)

    try:
        # Keep connection alive — client can send pings
        while True:
            data = await websocket.receive_text()
            # Client can send "ping" for keepalive
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        await ws_manager.disconnect(websocket, event_id)
