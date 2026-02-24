"""Admin routes — dashboard analytics."""
from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.api.deps import CurrentUser, DBSession, Redis
from app.schemas.admin import DashboardResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get(
    "/dashboard/{event_id}",
    response_model=DashboardResponse,
    summary="Event analytics dashboard",
)
async def get_dashboard(
    event_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
    redis: Redis,
) -> DashboardResponse:
    service = AnalyticsService(session=session, redis=redis)
    return await service.get_dashboard(event_id)
