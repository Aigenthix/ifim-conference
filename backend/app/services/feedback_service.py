"""
Feedback service — submission + inline certificate generation.
"""
from __future__ import annotations

import io
import logging
import uuid
from pathlib import Path

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import ConflictError
from app.models.user import User
from app.models.event import Event
from app.repositories.certificate_repo import CertificateRepository
from app.repositories.feedback_repo import FeedbackRepository
from app.schemas.feedback import FeedbackRequest, FeedbackResponse

logger = logging.getLogger(__name__)


class FeedbackService:
    """Handles feedback submission and generates certificate inline."""

    def __init__(
        self,
        session: AsyncSession,
        redis: aioredis.Redis,
    ) -> None:
        self._feedback_repo = FeedbackRepository(session)
        self._cert_repo = CertificateRepository(session)
        self._redis = redis
        self._session = session

    async def submit_feedback(
        self,
        user_id: uuid.UUID,
        payload: FeedbackRequest,
    ) -> FeedbackResponse:
        """
        Submit feedback → generate certificate inline.
        """
        # Check for duplicate feedback
        existing = await self._feedback_repo.get_by_user_and_event(
            user_id, payload.event_id
        )
        if existing:
            raise ConflictError("Feedback already submitted for this event")

        # Create feedback
        feedback = await self._feedback_repo.create(
            user_id=user_id,
            event_id=payload.event_id,
            rating=payload.rating,
            comments=payload.comments,
        )

        # Create or get certificate record
        cert = await self._cert_repo.get_by_user_and_event(
            user_id, payload.event_id
        )
        if not cert:
            cert = await self._cert_repo.create(
                user_id=user_id,
                event_id=payload.event_id,
                status="generating",
            )
        else:
            cert.status = "generating"
            await self._session.commit()

        # Generate certificate inline
        try:
            download_url = await self._generate_certificate(
                user_id=user_id,
                event_id=payload.event_id,
            )
            cert.pdf_url = download_url
            cert.status = "ready"
            await self._session.commit()
        except Exception as exc:
            logger.error(f"Certificate generation failed: {exc}", exc_info=True)
            cert.status = "pending"
            await self._session.commit()

        return FeedbackResponse(
            id=feedback.id,
            event_id=feedback.event_id,
            user_id=feedback.user_id,
            rating=feedback.rating,
            comments=feedback.comments,
            certificate_status=cert.status,
        )

    async def _generate_certificate(
        self,
        user_id: uuid.UUID,
        event_id: uuid.UUID,
    ) -> str:
        """Generate certificate PDF and return download URL."""
        settings = get_settings()

        # Fetch user and event
        user = await self._session.get(User, user_id)
        event = await self._session.get(Event, event_id)

        if not user or not event:
            raise ValueError("User or event not found")

        # Render PDF
        pdf_buffer = self._render_certificate_pdf(
            name=user.name,
            event_title=event.title,
            event_date=event.starts_at.strftime("%B %d, %Y"),
        )

        # Save to local disk
        cert_dir = Path(settings.CERTIFICATES_DIR) / str(event_id)
        cert_dir.mkdir(parents=True, exist_ok=True)

        filename = f"{user_id}.pdf"
        file_path = cert_dir / filename
        file_path.write_bytes(pdf_buffer.getvalue())

        download_url = f"/api/v1/certificates/download/{event_id}/{user_id}.pdf"
        logger.info(f"Certificate generated: {file_path}")

        return download_url

    @staticmethod
    def _render_certificate_pdf(
        name: str,
        event_title: str,
        event_date: str,
    ) -> io.BytesIO:
        """Render professional certificate PDF using ReportLab."""
        from reportlab.lib.pagesizes import landscape, A4
        from reportlab.pdfgen import canvas

        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=landscape(A4))
        width, height = landscape(A4)

        # Background — cream
        c.setFillColorRGB(0.98, 0.96, 0.93)
        c.rect(0, 0, width, height, fill=1, stroke=0)

        # Red Borders
        c.setStrokeColorRGB(0.55, 0, 0)
        c.setLineWidth(3)
        c.rect(30, 30, width - 60, height - 60, fill=0, stroke=1)
        c.setStrokeColorRGB(0.86, 0.08, 0.24)
        c.setLineWidth(1.5)
        c.rect(40, 40, width - 80, height - 80, fill=0, stroke=1)

        # Title
        c.setFillColorRGB(0.55, 0, 0)
        c.setFont("Helvetica-Bold", 36)
        c.drawCentredString(width / 2, height - 120, "Certificate of Participation")

        # Divider
        c.setStrokeColorRGB(0.86, 0.08, 0.24)
        c.setLineWidth(1)
        c.line(150, height - 140, width - 150, height - 140)

        # Body
        c.setFont("Helvetica", 18)
        c.setFillColorRGB(0.2, 0.2, 0.2)
        c.drawCentredString(width / 2, height - 200, "This is to certify that")

        # Name
        c.setFont("Helvetica-Bold", 28)
        c.setFillColorRGB(0.55, 0, 0)
        c.drawCentredString(width / 2, height - 250, name)

        # Event
        c.setFont("Helvetica", 18)
        c.setFillColorRGB(0.2, 0.2, 0.2)
        c.drawCentredString(width / 2, height - 300, "has successfully participated in")

        c.setFont("Helvetica-Bold", 22)
        c.setFillColorRGB(0.86, 0.08, 0.24)
        c.drawCentredString(width / 2, height - 340, event_title)

        # Date
        c.setFont("Helvetica", 16)
        c.setFillColorRGB(0.3, 0.3, 0.3)
        c.drawCentredString(width / 2, height - 390, f"Date: {event_date}")

        # Footer — use current event title instead of stale hardcoded text
        c.setFont("Helvetica-Oblique", 12)
        c.setFillColorRGB(0.5, 0.5, 0.5)
        c.drawCentredString(width / 2, 70, event_title)

        c.save()
        buffer.seek(0)
        return buffer
