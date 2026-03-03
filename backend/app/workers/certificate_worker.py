"""
Certificate generation worker.

Flow:
  1. Receive (user_id, event_id) from Celery queue
  2. Fetch user + event details
  3. Generate PDF certificate via ReportLab
  4. Save PDF to local disk (uploads/certificates/)
  5. Update certificate record with local file path (served by API)
"""
from __future__ import annotations

import io
import logging
import uuid
from pathlib import Path

from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas
from sqlalchemy import select

from app.core.config import get_settings
from app.db.session import get_session_factory
from app.models.certificate import Certificate
from app.models.event import Event
from app.models.user import User
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)
CERTIFICATE_FOOTER_TEXT = "Bharat Synapse@2047"


@celery_app.task(
    bind=True,
    name="app.workers.certificate_worker.generate_certificate",
    max_retries=3,
    default_retry_delay=30,
    queue="certificates",
)
def generate_certificate(self, user_id: str, event_id: str) -> dict:
    """
    Synchronous Celery task (runs in worker process).

    We use asyncio.run() because Celery workers run in a
    separate process from the async FastAPI app.
    """
    import asyncio

    try:
        result = asyncio.run(_generate_certificate_async(user_id, event_id))
        return result
    except Exception as exc:
        logger.error(f"Certificate generation failed: {exc}", exc_info=True)
        self.retry(exc=exc)


async def _generate_certificate_async(user_id: str, event_id: str) -> dict:
    """Async implementation for the certificate pipeline."""
    settings = get_settings()
    factory = get_session_factory()

    async with factory() as session:
        # Fetch user
        user = await session.get(User, uuid.UUID(user_id))
        if not user:
            raise ValueError(f"User {user_id} not found")

        # Fetch event
        event = await session.get(Event, uuid.UUID(event_id))
        if not event:
            raise ValueError(f"Event {event_id} not found")

        # Update status to generating
        stmt = select(Certificate).where(
            Certificate.user_id == uuid.UUID(user_id),
            Certificate.event_id == uuid.UUID(event_id),
        )
        result = await session.execute(stmt)
        cert = result.scalar_one_or_none()
        if cert:
            cert.status = "generating"
            await session.commit()

        # Generate PDF
        pdf_buffer = _render_certificate_pdf(
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

        # Build download URL (served by the API)
        download_url = f"/api/v1/certificates/download/{event_id}/{user_id}.pdf"

        # Update certificate record
        if cert:
            cert.pdf_url = download_url
            cert.status = "ready"
            await session.commit()

        logger.info(f"Certificate generated for user={user_id} event={event_id} → {file_path}")

        return {
            "user_id": user_id,
            "event_id": event_id,
            "pdf_url": download_url,
            "status": "ready",
        }


def _render_certificate_pdf(
    name: str,
    event_title: str,
    event_date: str,
) -> io.BytesIO:
    """Render a professional certificate PDF using ReportLab."""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)

    # Background
    c.setFillColorRGB(0.95, 0.95, 1.0)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # Border
    c.setStrokeColorRGB(0.2, 0.3, 0.7)
    c.setLineWidth(3)
    c.rect(30, 30, width - 60, height - 60, fill=0, stroke=1)
    c.rect(40, 40, width - 80, height - 80, fill=0, stroke=1)

    # Title
    c.setFillColorRGB(0.1, 0.1, 0.4)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width / 2, height - 120, "Certificate of Participation")

    # Horizontal line
    c.setStrokeColorRGB(0.6, 0.6, 0.8)
    c.setLineWidth(1)
    c.line(150, height - 140, width - 150, height - 140)

    # Body text
    c.setFont("Helvetica", 18)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    c.drawCentredString(width / 2, height - 200, "This is to certify that")

    # Name
    c.setFont("Helvetica-Bold", 28)
    c.setFillColorRGB(0.1, 0.2, 0.6)
    c.drawCentredString(width / 2, height - 250, name)

    # Event
    c.setFont("Helvetica", 18)
    c.setFillColorRGB(0.2, 0.2, 0.2)
    c.drawCentredString(width / 2, height - 300, "has successfully participated in")

    c.setFont("Helvetica-Bold", 22)
    c.setFillColorRGB(0.1, 0.3, 0.5)
    c.drawCentredString(width / 2, height - 340, event_title)

    # Date
    c.setFont("Helvetica", 16)
    c.setFillColorRGB(0.3, 0.3, 0.3)
    c.drawCentredString(width / 2, height - 390, f"Date: {event_date}")

    # Footer text is fixed per product requirement.
    c.setFont("Helvetica-Oblique", 12)
    c.setFillColorRGB(0.5, 0.5, 0.5)
    c.drawCentredString(width / 2, 70, CERTIFICATE_FOOTER_TEXT)

    c.save()
    buffer.seek(0)
    return buffer
