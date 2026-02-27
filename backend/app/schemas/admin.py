"""Admin dashboard schemas."""
from __future__ import annotations

import uuid
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class DashboardResponse(BaseModel):
    total_registrations: int
    live_concurrent_users: int
    total_polls: int
    total_votes: int
    total_feedback: int
    average_rating: float
    total_queries: int
    top_queries: list[str] = []


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Add User ───────────────────────────────────────────────
class AddUserRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=20)
    company: Optional[str] = None
    food_preference: Optional[str] = None
    tshirt_size: Optional[str] = None
    growth_focus: Optional[str] = None


class AddUserResponse(BaseModel):
    user_id: uuid.UUID
    message: str = "User added successfully"


# ── Attendance ─────────────────────────────────────────────
class AttendeeItem(BaseModel):
    user_id: uuid.UUID
    name: str
    email: str
    phone: str
    company: Optional[str] = None
    food_preference: Optional[str] = None
    tshirt_size: Optional[str] = None
    growth_focus: Optional[str] = None
    goodies_given: bool = False
    registered_at: str  # ISO timestamp


class AttendanceResponse(BaseModel):
    total: int
    attendees: list[AttendeeItem] = []


# ── Goodies ────────────────────────────────────────────────
class ToggleGoodiesRequest(BaseModel):
    user_id: uuid.UUID
    goodies_given: bool


class ToggleGoodiesResponse(BaseModel):
    success: bool = True
    goodies_given: bool


# ── QR Scan Attendance ─────────────────────────────────────
class ScanAttendanceRequest(BaseModel):
    qr_payload: str = Field(..., min_length=1, max_length=6000)


class ScanAttendanceResponse(BaseModel):
    success: bool = True
    message: str
    attendee: AttendeeItem
    goodies_given: bool


# ── Feedback ───────────────────────────────────────────────
class FeedbackItem(BaseModel):
    user_name: str
    user_email: str
    rating: int
    comments: Optional[str] = None
    submitted_at: str  # ISO timestamp


class FeedbackListResponse(BaseModel):
    total: int
    average_rating: float
    feedback: list[FeedbackItem] = []


# ── Food Attendance ────────────────────────────────────────
class FoodAttendanceItem(BaseModel):
    user_id: uuid.UUID
    name: str
    email: str
    phone: str
    company: Optional[str] = None
    food_preference: Optional[str] = None
    growth_focus: Optional[str] = None
    dinner1: bool = False
    breakfast: bool = False
    tea1: bool = False
    tea2: bool = False
    lunch: bool = False
    tea3: bool = False
    dinner2: bool = False
    tea4: bool = False
    total_meals: int = 0


class FoodAttendanceResponse(BaseModel):
    total: int
    total_meals_served: int = 0
    attendees: list[FoodAttendanceItem] = []


class FoodScanResponse(BaseModel):
    success: bool = True
    message: str
    attendee: FoodAttendanceItem
    slot_filled: str  # which slot was just filled


class ToggleFoodSlotRequest(BaseModel):
    user_id: uuid.UUID
    slot: str = Field(..., pattern=r"^(dinner1|breakfast|tea1|tea2|lunch|tea3|dinner2|tea4)$")
    value: bool


class FoodScanRequest(BaseModel):
    qr_payload: str
    slot: Optional[str] = Field(None, pattern=r"^(dinner1|breakfast|tea1|tea2|lunch|tea3|dinner2|tea4)$")
