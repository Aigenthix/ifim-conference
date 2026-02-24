"""Poll, PollOption, and PollVote models."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Poll(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "polls"

    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    event = relationship("Event", back_populates="polls", lazy="joined")
    options = relationship("PollOption", back_populates="poll", lazy="selectin", order_by="PollOption.display_order")

    __table_args__ = (
        Index("ix_polls_event_active", "event_id", "is_active"),
    )


class PollOption(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "poll_options"

    poll_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("polls.id", ondelete="CASCADE"), nullable=False
    )
    option_text: Mapped[str] = mapped_column(String(500), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    poll = relationship("Poll", back_populates="options")

    __table_args__ = (
        Index("ix_poll_options_poll_id", "poll_id"),
    )


class PollVote(Base, UUIDPrimaryKeyMixin):
    """
    Persistent vote record — batch-flushed from Redis.
    Real-time counts live in Redis; this is the source-of-truth archive.
    """
    __tablename__ = "poll_votes"

    poll_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("polls.id", ondelete="CASCADE"), nullable=False
    )
    option_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("poll_options.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    voted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="poll_votes")

    __table_args__ = (
        UniqueConstraint("poll_id", "user_id", name="uq_poll_vote_user"),
        Index("ix_poll_votes_poll_id", "poll_id"),
    )
