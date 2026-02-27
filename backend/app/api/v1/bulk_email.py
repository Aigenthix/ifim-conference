"""Bulk Email routes — CSV/XLSX upload, ticket listing, QR scan."""
from __future__ import annotations

import csv
import io
import json
import random
import string
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, File, Form, UploadFile
from pydantic import BaseModel
from sqlalchemy import select, func

from app.api.deps import CurrentUser, DBSession
from app.core.exceptions import NotFoundError, ValidationError
from app.models.ticket import Ticket

router = APIRouter(prefix="/bulk-email", tags=["bulk-email"])

ADMIN_EVENT_ID = uuid.UUID("00000000-0000-0000-0000-000000000000")


def _generate_ticket_id() -> str:
    """Generate a unique ticket ID like RD26-A1B2C3."""
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=6))
    return f"RD26-{suffix}"


def _parse_csv(raw: bytes) -> list[dict]:
    """Parse CSV bytes into list of dicts."""
    text = raw.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    rows = []
    for row in reader:
        # Normalize keys to lowercase stripped
        clean = {k.strip().lower().replace(" ", "_"): v.strip() for k, v in row.items() if k}
        rows.append(clean)
    return rows


def _parse_xlsx(raw: bytes) -> list[dict]:
    """Parse XLSX bytes into list of dicts."""
    import openpyxl

    wb = openpyxl.load_workbook(io.BytesIO(raw), read_only=True, data_only=True)
    ws = wb.active
    if ws is None:
        return []

    rows_iter = ws.iter_rows(values_only=True)
    try:
        header_raw = next(rows_iter)
    except StopIteration:
        return []

    headers = [str(h).strip().lower().replace(" ", "_") if h else f"col_{i}" for i, h in enumerate(header_raw)]
    rows = []
    for row in rows_iter:
        clean = {}
        for i, val in enumerate(row):
            if i < len(headers):
                clean[headers[i]] = str(val).strip() if val is not None else ""
        if any(clean.values()):
            rows.append(clean)
    return rows


class TicketOut(BaseModel):
    id: str
    ticket_id: str
    name: str
    email: str
    phone: str
    company: str | None = None
    designation: str | None = None
    growth_focus: str | None = None
    email_status: str
    scanned: bool
    scanned_at: str | None = None
    created_at: str


class UploadResponse(BaseModel):
    total: int
    created: int
    skipped: int
    message: str


class ScanRequest(BaseModel):
    ticket_id: str


class ScanResponse(BaseModel):
    status: str  # "success" | "already_used" | "invalid"
    name: str | None = None
    ticket_id: str | None = None
    scanned_at: str | None = None


@router.post(
    "/upload",
    response_model=UploadResponse,
    summary="Upload CSV/XLSX and create tickets + send emails",
)
async def upload_tickets(
    user: CurrentUser,
    session: DBSession,
    file: UploadFile = File(...),
    event_id: str = Form(...),
    smtp_host: str = Form("smtp.gmail.com"),
    smtp_port: int = Form(587),
    sender_email: str = Form(...),
    sender_password: str = Form(...),
    provider: str = Form("smtp"),  # "smtp" or "sendgrid"
) -> UploadResponse:
    # Strip spaces from app passwords (Google shows them with spaces)
    sender_password = sender_password.replace(" ", "")
    # Admin-only check
    if user.event_id != ADMIN_EVENT_ID:
        raise ValidationError("Only admins can upload bulk emails")

    parsed_event_id = uuid.UUID(event_id)

    # Read file
    raw = await file.read()
    filename = (file.filename or "").lower()

    if filename.endswith(".xlsx") or filename.endswith(".xls"):
        rows = _parse_xlsx(raw)
    elif filename.endswith(".csv"):
        rows = _parse_csv(raw)
    else:
        raise ValidationError("Only .csv and .xlsx files are supported")

    if not rows:
        raise ValidationError("File is empty or could not be parsed")

    # Validate and create tickets
    created = 0
    skipped = 0
    ticket_ids_for_email: list[str] = []

    for row in rows:
        name = row.get("name", "").strip()
        email = row.get("email", "") or row.get("email_id", "") or row.get("emailid", "")
        email = email.strip()
        phone = row.get("phone", "") or row.get("phone_number", "") or row.get("mobile", "") or row.get("mobile_number", "")
        phone = phone.strip()
        company = row.get("company", "").strip() or None
        designation = row.get("designation", "").strip() or None

        # Flexible growth_focus column matching
        growth_focus = None
        for key in row:
            if "growth" in key.lower():
                growth_focus = row[key].strip() or None
                break
        if not growth_focus:
            growth_focus = row.get("growth_focus", "").strip() or None

        if not name or not email:
            skipped += 1
            continue

        # Delete any existing ticket for this email + event (overwrite)
        existing = await session.execute(
            select(Ticket).where(
                Ticket.event_id == parsed_event_id,
                Ticket.email == email,
            )
        )
        for old_ticket in existing.scalars().all():
            await session.delete(old_ticket)

        # Generate unique ticket ID
        ticket_id = _generate_ticket_id()
        # Ensure uniqueness
        for _ in range(10):
            check = await session.execute(
                select(func.count()).where(Ticket.ticket_id == ticket_id)
            )
            if check.scalar_one() == 0:
                break
            ticket_id = _generate_ticket_id()

        ticket = Ticket(
            event_id=parsed_event_id,
            ticket_id=ticket_id,
            name=name,
            email=email,
            phone=phone or "N/A",
            company=company,
            designation=designation,
            growth_focus=growth_focus,
            email_status="pending",
        )
        session.add(ticket)
        ticket_ids_for_email.append(ticket_id)
        created += 1

    if created > 0:
        await session.commit()

    # Dispatch Celery task for email sending
    if ticket_ids_for_email:
        from app.workers.email_tasks import send_bulk_emails

        send_bulk_emails.delay(
            ticket_ids=ticket_ids_for_email,
            smtp_host=smtp_host,
            smtp_port=smtp_port,
            sender_email=sender_email,
            sender_password=sender_password,
            provider=provider,
        )

    return UploadResponse(
        total=len(rows),
        created=created,
        skipped=skipped,
        message=f"Created {created} tickets. {skipped} skipped (duplicate or invalid). Emails queued.",
    )


@router.get(
    "/{event_id}/tickets",
    response_model=list[TicketOut],
    summary="List all tickets for an event",
)
async def list_tickets(
    event_id: uuid.UUID,
    user: CurrentUser,
    session: DBSession,
) -> list[TicketOut]:
    if user.event_id != ADMIN_EVENT_ID:
        raise ValidationError("Only admins can view tickets")

    result = await session.execute(
        select(Ticket)
        .where(Ticket.event_id == event_id)
        .order_by(Ticket.created_at.desc())
    )
    tickets = result.scalars().all()

    return [
        TicketOut(
            id=str(t.id),
            ticket_id=t.ticket_id,
            name=t.name,
            email=t.email,
            phone=t.phone,
            company=t.company,
            designation=t.designation,
            growth_focus=t.growth_focus,
            email_status=t.email_status,
            scanned=t.scanned,
            scanned_at=t.scanned_at.isoformat() if t.scanned_at else None,
            created_at=t.created_at.isoformat() if t.created_at else "",
        )
        for t in tickets
    ]


@router.post(
    "/scan",
    response_model=ScanResponse,
    summary="Scan a QR ticket",
)
async def scan_ticket(
    payload: ScanRequest,
    session: DBSession,
) -> ScanResponse:
    result = await session.execute(
        select(Ticket).where(Ticket.ticket_id == payload.ticket_id.strip())
    )
    ticket = result.scalar_one_or_none()

    if not ticket:
        return ScanResponse(status="invalid")

    if ticket.scanned:
        return ScanResponse(
            status="already_used",
            name=ticket.name,
            ticket_id=ticket.ticket_id,
            scanned_at=ticket.scanned_at.isoformat() if ticket.scanned_at else None,
        )

    ticket.scanned = True
    ticket.scanned_at = datetime.now(timezone.utc)
    await session.commit()

    return ScanResponse(
        status="success",
        name=ticket.name,
        ticket_id=ticket.ticket_id,
    )


class RetryRequest(BaseModel):
    event_id: str
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    sender_email: str
    sender_password: str
    provider: str = "smtp"


class RetryResponse(BaseModel):
    pending_count: int
    message: str


@router.post(
    "/retry",
    response_model=RetryResponse,
    summary="Retry sending emails for all pending tickets",
)
async def retry_pending(
    payload: RetryRequest,
    user: CurrentUser,
    session: DBSession,
) -> RetryResponse:
    if user.event_id != ADMIN_EVENT_ID:
        raise ValidationError("Only admins can retry emails")

    # Strip spaces from app passwords
    payload.sender_password = payload.sender_password.replace(" ", "")

    parsed_event_id = uuid.UUID(payload.event_id)

    result = await session.execute(
        select(Ticket).where(
            Ticket.event_id == parsed_event_id,
            Ticket.email_status.in_(["pending", "failed"]),
        )
    )
    tickets = result.scalars().all()
    # Reset status to pending before re-queuing
    for t in tickets:
        t.email_status = "pending"
    await session.commit()
    pending_ids = [t.ticket_id for t in tickets]

    if not pending_ids:
        return RetryResponse(pending_count=0, message="No pending or failed tickets to retry.")

    from app.workers.email_tasks import send_bulk_emails

    send_bulk_emails.delay(
        ticket_ids=pending_ids,
        smtp_host=payload.smtp_host,
        smtp_port=payload.smtp_port,
        sender_email=payload.sender_email,
        sender_password=payload.sender_password,
        provider=payload.provider,
    )

    return RetryResponse(
        pending_count=len(pending_ids),
        message=f"Re-queued {len(pending_ids)} pending emails.",
    )
