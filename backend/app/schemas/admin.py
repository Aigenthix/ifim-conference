"""Admin dashboard schemas."""
from __future__ import annotations

from pydantic import BaseModel


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
