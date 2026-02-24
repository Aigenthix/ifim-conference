"""Event model."""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Event(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "events"

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    qr_code_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    # Event metadata (JSON-friendly columns for lobby data)
    speakers_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    team_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    overview_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    registrations = relationship("Registration", back_populates="event", lazy="noload")
    polls = relationship("Poll", back_populates="event", lazy="noload")
    feedback_entries = relationship("Feedback", back_populates="event", lazy="noload")
    sessions = relationship("Session", back_populates="event", lazy="noload")
    alerts = relationship("Alert", back_populates="event", lazy="noload")

    __table_args__ = (
        Index("ix_events_slug", "slug", unique=True),
        Index("ix_events_is_active", "is_active"),
    )
