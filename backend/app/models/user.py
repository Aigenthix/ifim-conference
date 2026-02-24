"""User model."""
from __future__ import annotations

from sqlalchemy import Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)

    # Relationships
    registrations = relationship("Registration", back_populates="user", lazy="selectin")
    poll_votes = relationship("PollVote", back_populates="user", lazy="noload")
    feedback_entries = relationship("Feedback", back_populates="user", lazy="noload")
    certificates = relationship("Certificate", back_populates="user", lazy="noload")
    chat_logs = relationship("ChatLog", back_populates="user", lazy="noload")

    __table_args__ = (
        Index("ix_users_email", "email"),
        Index("ix_users_phone", "phone"),
    )
