"""Chat log model for RAG conversations."""
from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ChatLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "chat_logs"

    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    query: Mapped[str] = mapped_column(Text, nullable=False)
    response: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    user = relationship("User", back_populates="chat_logs")

    __table_args__ = (
        Index("ix_chat_logs_event_id", "event_id"),
        Index("ix_chat_logs_user_id", "user_id"),
    )
