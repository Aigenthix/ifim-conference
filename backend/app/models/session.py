"""Session model — event sessions with audio/video links."""
from __future__ import annotations

import uuid

from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Session(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "sessions"

    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    speaker_name: Mapped[str | None] = mapped_column(String(300), nullable=True)
    speaker_title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    day: Mapped[int] = mapped_column(Integer, default=1, nullable=False)  # 1 or 2
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    audio_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    video_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    qa_protected: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)

    # Relationships
    event = relationship("Event", back_populates="sessions", lazy="joined")

    __table_args__ = (
        Index("ix_sessions_event_day", "event_id", "day"),
    )
