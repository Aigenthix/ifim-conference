"""Community message model — live chat between all event attendees."""
from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CommunityMessage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "community_messages"

    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    user_name: Mapped[str] = mapped_column(String(300), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)

    reply_to_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    reply_to_user_name: Mapped[str | None] = mapped_column(String(300), nullable=True)
    reply_to_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    event = relationship("Event", lazy="joined")
    user = relationship("User", lazy="joined")
