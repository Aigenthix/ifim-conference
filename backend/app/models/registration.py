"""Registration model — links a user to an event."""
from __future__ import annotations

import uuid

from sqlalchemy import Boolean, ForeignKey, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Registration(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "registrations"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    goodies_given: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, server_default="false")

    # Relationships
    user = relationship("User", back_populates="registrations", lazy="joined")
    event = relationship("Event", back_populates="registrations", lazy="joined")

    __table_args__ = (
        UniqueConstraint("user_id", "event_id", name="uq_registration_user_event"),
        Index("ix_registrations_event_id", "event_id"),
    )
