"""Auth routes — QR-scan registration."""
from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import DBSession, Redis
from app.schemas.auth import RegisterRequest, RegisterResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=201,
    summary="QR-scan registration",
    description="Register a user for an event via QR code scan. Returns JWT for lobby access.",
)
async def register(
    payload: RegisterRequest,
    session: DBSession,
    redis: Redis,
) -> RegisterResponse:
    service = AuthService(session=session, redis=redis)
    return await service.register_user(payload)
