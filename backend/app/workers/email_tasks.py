"""Celery task — send bulk emails with QR code attachments."""
from __future__ import annotations

import io
import json
import logging
import smtplib
import ssl
import time
from email.message import EmailMessage

import qrcode
from sqlalchemy import select
from sqlalchemy.orm import Session as SyncSession

from app.workers.celery_app import celery_app
from app.core.config import get_settings

logger = logging.getLogger(__name__)


def _generate_qr_png(data: str) -> bytes:
    """Generate a QR code PNG image in memory."""
    qr = qrcode.QRCode(box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _build_email_body(name: str) -> str:
    return f"""\
Dear {name},

Thank you for registering for Raj Darbar 2026. We are delighted to have you join us for this special event.

Please keep your QR code ready, as it will be required for entry at the venue.

Your Entry QR Code is attached to this email.

Event Details:
Event: Raj Darbar 2026
Date: 27th & 28th February 2026

Kindly present the above QR code at the registration desk for a smooth check-in process.

We look forward to welcoming you.
"""


@celery_app.task(name="send_bulk_emails", bind=True, max_retries=0)
def send_bulk_emails(
    self,
    ticket_ids: list[str],
    smtp_host: str,
    smtp_port: int,
    sender_email: str,
    sender_password: str,
    provider: str = "smtp",
) -> dict:
    """Process bulk email sending for the given ticket IDs."""
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.models.ticket import Ticket

    settings = get_settings()
    # Use sync engine for Celery
    sync_url = str(settings.DATABASE_URL).replace("+asyncpg", "")
    engine = create_engine(sync_url)
    SessionLocal = sessionmaker(bind=engine)

    # Debug logging
    logger.info(f"SMTP config: host={smtp_host}, port={smtp_port}, sender={sender_email}")
    logger.info(f"Password length: {len(sender_password)}, first 4 chars: {sender_password[:4]}...")

    sent = 0
    failed = 0

    # Connect to SMTP once, reuse for all emails (matching working script pattern)
    context = ssl.create_default_context()
    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls(context=context)
        server.login(sender_email, sender_password)
        logger.info("SMTP login successful!")
    except Exception as exc:
        logger.error(f"SMTP login failed: {exc}")
        # Mark all as failed
        with SessionLocal() as db:
            for tid in ticket_ids:
                ticket = db.execute(
                    select(Ticket).where(Ticket.ticket_id == tid)
                ).scalar_one_or_none()
                if ticket:
                    ticket.email_status = "failed"
            db.commit()
        return {"sent": 0, "failed": len(ticket_ids), "total": len(ticket_ids), "error": str(exc)}

    with SessionLocal() as db:
        for tid in ticket_ids:
            ticket = db.execute(
                select(Ticket).where(Ticket.ticket_id == tid)
            ).scalar_one_or_none()

            if not ticket:
                logger.warning(f"Ticket {tid} not found, skipping")
                failed += 1
                continue

            try:
                # Generate QR code data with all badge fields
                qr_data = f"""
Event: Raj Darbar 2026
Name: {ticket.name}
Mobile: {ticket.phone}
Email: {ticket.email}
Company: {ticket.company or 'N/A'}
TicketID: {ticket.ticket_id}
Growth Focus: {ticket.growth_focus or 'N/A'}
"""
                qr_png = _generate_qr_png(qr_data)

                # Build email using EmailMessage (matching working script)
                msg = EmailMessage()
                msg["From"] = sender_email
                msg["To"] = ticket.email
                msg["Subject"] = "Registration Confirmation \u2013 Raj Darbar 2026"
                msg.set_content(_build_email_body(ticket.name))

                # Attach QR code
                msg.add_attachment(
                    qr_png,
                    maintype="image",
                    subtype="png",
                    filename=f"QR_{ticket.ticket_id}.png",
                )

                server.send_message(msg)

                ticket.email_status = "sent"
                sent += 1
                logger.info(f"Email sent to {ticket.email} for ticket {tid}")

                # Small delay between emails to avoid rate limiting
                time.sleep(2)

            except Exception as exc:
                ticket.email_status = "failed"
                failed += 1
                logger.error(f"Failed to send email for ticket {tid}: {exc}")

            db.commit()

    try:
        server.quit()
    except Exception:
        pass

    logger.info(f"Bulk email complete: {sent} sent, {failed} failed out of {len(ticket_ids)}")
    return {"sent": sent, "failed": failed, "total": len(ticket_ids)}

