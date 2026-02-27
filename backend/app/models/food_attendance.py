"""Food attendance model — tracks 8 meal slots per user-event."""
from __future__ import annotations

import uuid

from sqlalchemy import Boolean, ForeignKey, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class FoodAttendance(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "food_attendance"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )

    # 8 meal slots (in scan order)
    dinner1: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    breakfast: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    tea1: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    tea2: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    lunch: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    tea3: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    dinner2: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")
    tea4: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")

    __table_args__ = (
        UniqueConstraint("user_id", "event_id", name="uq_food_attendance_user_event"),
        Index("ix_food_attendance_event_id", "event_id"),
    )
