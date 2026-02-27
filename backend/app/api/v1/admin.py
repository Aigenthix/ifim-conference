"""Admin routes — dashboard analytics + management."""
from __future__ import annotations

import uuid

from fastapi import APIRouter

from app.api.deps import CurrentUser, DBSession, Redis
from app.schemas.admin import (
    AddUserRequest,
    AddUserResponse,
    AttendanceResponse,
    DashboardResponse,
    FeedbackListResponse,
    ScanAttendanceRequest,
    ScanAttendanceResponse,
    ToggleGoodiesRequest,
    ToggleGoodiesResponse,
    FoodAttendanceResponse,
    FoodScanResponse,
    FoodScanRequest,
    ToggleFoodSlotRequest,
)
from app.services.admin_service import AdminManagementService
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


@router.post(
    "/users/{event_id}",
    response_model=AddUserResponse,
    status_code=201,
    summary="Add a new user to the event",
)
async def add_user(
    event_id: uuid.UUID,
    payload: AddUserRequest,
    user: CurrentUser,
    session: DBSession,
) -> AddUserResponse:
    service = AdminManagementService(session=session)
    return await service.add_user(event_id, payload)


@router.get(
    "/attendance/{event_id}",
    response_model=AttendanceResponse,
    summary="Get attendance / registered users list",
)
async def get_attendance(
    event_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
) -> AttendanceResponse:
    service = AdminManagementService(session=session)
    return await service.get_attendance(event_id)


@router.post(
    "/attendance/{event_id}/scan",
    response_model=ScanAttendanceResponse,
    summary="Scan attendee QR and mark attendance with goodies",
)
async def scan_attendance_qr(
    event_id: uuid.UUID,
    payload: ScanAttendanceRequest,
    user: CurrentUser,
    session: DBSession,
) -> ScanAttendanceResponse:
    service = AdminManagementService(session=session)
    return await service.scan_attendance_from_qr(event_id, payload)


@router.post(
    "/goodies/{event_id}",
    response_model=ToggleGoodiesResponse,
    summary="Toggle goodies given status",
)
async def toggle_goodies(
    event_id: uuid.UUID,
    payload: ToggleGoodiesRequest,
    user: CurrentUser,
    session: DBSession,
) -> ToggleGoodiesResponse:
    service = AdminManagementService(session=session)
    return await service.toggle_goodies(event_id, payload)


@router.get(
    "/feedback/{event_id}",
    response_model=FeedbackListResponse,
    summary="Get all feedback with user details",
)
async def get_feedback(
    event_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
) -> FeedbackListResponse:
    service = AdminManagementService(session=session)
    return await service.get_feedback(event_id)


@router.get(
    "/food-attendance/{event_id}",
    response_model=FoodAttendanceResponse,
    summary="Get food attendance / meal tracking for all users",
)
async def get_food_attendance(
    event_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
) -> FoodAttendanceResponse:
    service = AdminManagementService(session=session)
    return await service.get_food_attendance(event_id)


@router.post(
    "/food-attendance/{event_id}/scan",
    response_model=FoodScanResponse,
    summary="Scan QR code to mark next meal slot",
)
async def scan_food_qr(
    event_id: uuid.UUID,
    payload: FoodScanRequest,
    user: CurrentUser,
    session: DBSession,
) -> FoodScanResponse:
    service = AdminManagementService(session=session)
    return await service.scan_food_qr(event_id, payload)


@router.post(
    "/food-attendance/{event_id}/toggle",
    summary="Toggle a specific food slot for a user",
)
async def toggle_food_slot(
    event_id: uuid.UUID,
    payload: ToggleFoodSlotRequest,
    user: CurrentUser,
    session: DBSession,
):
    service = AdminManagementService(session=session)
    return await service.toggle_food_slot(event_id, payload)
