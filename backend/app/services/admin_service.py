"""Admin management service — user management, attendance, goodies, feedback."""
from __future__ import annotations

import json
import re
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.exceptions import NotFoundError, ValidationError
from app.models.feedback import Feedback
from app.models.registration import Registration
from app.models.user import User
from app.schemas.admin import (
    AddUserRequest,
    AddUserResponse,
    AttendanceResponse,
    AttendeeItem,
    FeedbackItem,
    FeedbackListResponse,
    ScanAttendanceRequest,
    ScanAttendanceResponse,
    ToggleGoodiesRequest,
    ToggleGoodiesResponse,
)


class AdminManagementService:
    """Handles admin panel management operations."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    @dataclass
    class _ParsedScanPayload:
        user_id: uuid.UUID | None = None
        event_id: uuid.UUID | None = None
        email: str | None = None
        phone: str | None = None
        name: str | None = None
        ticket_id: str | None = None

    @staticmethod
    def _normalize_phone(value: str | None) -> str:
        if not value:
            return ""
        digits = re.sub(r"\D+", "", value)
        if len(digits) > 10 and digits.startswith("91"):
            digits = digits[-10:]
        if len(digits) > 10 and digits.startswith("0"):
            digits = digits[-10:]
        return digits

    @staticmethod
    def _safe_uuid(value: str | None) -> uuid.UUID | None:
        if not value:
            return None
        try:
            return uuid.UUID(str(value).strip())
        except ValueError:
            return None

    def _parse_vcard_payload(self, raw_payload: str) -> _ParsedScanPayload:
        parsed = self._ParsedScanPayload()
        for line in raw_payload.splitlines():
            line = line.strip()
            if not line or ":" not in line:
                continue
            key, value = line.split(":", 1)
            value = value.strip()
            if not value:
                continue

            base_key = key.strip().upper().split(";", 1)[0]
            if base_key == "FN":
                parsed.name = value
            elif base_key == "EMAIL":
                parsed.email = value.lower()
            elif base_key == "TEL":
                parsed.phone = value
            elif base_key == "X-USER-ID":
                parsed.user_id = self._safe_uuid(value)
            elif base_key == "X-EVENT-ID":
                parsed.event_id = self._safe_uuid(value)

        return parsed

    def _parse_scan_payload(self, qr_payload: str) -> _ParsedScanPayload:
        raw = qr_payload.strip()
        if not raw:
            raise ValidationError("Scanned QR payload is empty")

        parsed = self._ParsedScanPayload()

        # Preferred payload: JSON object
        if raw.startswith("{") and raw.endswith("}"):
            try:
                payload = json.loads(raw)
            except json.JSONDecodeError:
                payload = None
            if isinstance(payload, dict):
                parsed.user_id = self._safe_uuid(str(payload.get("user_id", "")).strip())
                parsed.event_id = self._safe_uuid(str(payload.get("event_id", "")).strip())
                parsed.email = str(payload.get("email", "")).strip().lower() or None
                parsed.phone = str(payload.get("phone", "")).strip() or None
                parsed.name = str(payload.get("name", "")).strip() or None

        # Backward compatibility: VCard payload
        if "BEGIN:VCARD" in raw.upper():
            vcard = self._parse_vcard_payload(raw)
            parsed.user_id = parsed.user_id or vcard.user_id
            parsed.event_id = parsed.event_id or vcard.event_id
            parsed.email = parsed.email or vcard.email
            parsed.phone = parsed.phone or vcard.phone
            parsed.name = parsed.name or vcard.name

        # Ticket QR: plain-text "Key: Value" lines from bulk email system
        if not parsed.user_id and not parsed.email and not parsed.phone:
            for line in raw.splitlines():
                line = line.strip()
                if not line or ":" not in line:
                    continue
                key, value = line.split(":", 1)
                key = key.strip().lower()
                value = value.strip()
                if not value:
                    continue
                if key == "email":
                    parsed.email = value.lower()
                elif key in ("mobile", "phone", "tel"):
                    if value.upper() != "N/A":
                        parsed.phone = value
                elif key == "name":
                    parsed.name = value
                elif key in ("ticketid", "ticket_id"):
                    parsed.ticket_id = value

        if not parsed.user_id and not parsed.email and not parsed.phone:
            raise ValidationError(
                "Could not identify attendee from QR. Use QR generated from attendee badge."
            )

        return parsed

    @staticmethod
    def _to_attendee_item(registration: Registration) -> AttendeeItem:
        user = registration.user
        return AttendeeItem(
            user_id=user.id,
            name=user.name,
            email=user.email,
            phone=user.phone,
            company=getattr(user, "company", None),
            food_preference=getattr(user, "food_preference", None),
            tshirt_size=getattr(user, "tshirt_size", None),
            growth_focus=getattr(user, "growth_focus", None),
            goodies_given=getattr(registration, "goodies_given", False),
            registered_at=registration.created_at.isoformat() if registration.created_at else "",
        )

    async def _find_registration_by_user_id(
        self,
        event_id: uuid.UUID,
        user_id: uuid.UUID,
    ) -> Registration | None:
        stmt = (
            select(Registration)
            .options(joinedload(Registration.user))
            .where(
                Registration.event_id == event_id,
                Registration.user_id == user_id,
            )
            .limit(1)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def _find_registration_by_email(
        self,
        event_id: uuid.UUID,
        email: str,
    ) -> Registration | None:
        normalized_email = email.strip().lower()
        if not normalized_email:
            return None
        stmt = (
            select(Registration)
            .join(User, User.id == Registration.user_id)
            .options(joinedload(Registration.user))
            .where(
                Registration.event_id == event_id,
                User.email == normalized_email,
            )
            .limit(1)
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def _find_registration_by_phone(
        self,
        event_id: uuid.UUID,
        phone: str,
    ) -> Registration | None:
        raw_phone = phone.strip()
        normalized_phone = self._normalize_phone(raw_phone)
        if not raw_phone and not normalized_phone:
            return None

        where_clauses = [User.phone == raw_phone] if raw_phone else []
        if normalized_phone:
            where_clauses.append(User.phone.like(f"%{normalized_phone}"))
        if not where_clauses:
            return None

        stmt = (
            select(Registration)
            .join(User, User.id == Registration.user_id)
            .options(joinedload(Registration.user))
            .where(
                Registration.event_id == event_id,
                or_(*where_clauses),
            )
        )
        result = await self._session.execute(stmt)
        candidates = result.scalars().unique().all()

        if not normalized_phone:
            return candidates[0] if candidates else None

        for reg in candidates:
            if reg.user and self._normalize_phone(reg.user.phone) == normalized_phone:
                return reg
        return None

    async def add_user(self, event_id: uuid.UUID, payload: AddUserRequest) -> AddUserResponse:
        """Add a new user and register them for the event."""
        # Check if user already exists by email
        stmt = select(User).where(User.email == payload.email.lower())
        result = await self._session.execute(stmt)
        user = result.scalar_one_or_none()

        if not user:
            user = User(
                name=payload.name,
                email=payload.email.lower(),
                phone=payload.phone,
                company=payload.company,
                food_preference=payload.food_preference,
                tshirt_size=payload.tshirt_size,
                growth_focus=payload.growth_focus,
            )
            self._session.add(user)
            await self._session.flush()

        # Check if registration exists
        reg_stmt = select(Registration).where(
            Registration.user_id == user.id,
            Registration.event_id == event_id,
        )
        reg_result = await self._session.execute(reg_stmt)
        existing_reg = reg_result.scalar_one_or_none()

        if not existing_reg:
            reg = Registration(user_id=user.id, event_id=event_id)
            self._session.add(reg)

        await self._session.commit()
        return AddUserResponse(user_id=user.id, message="User added successfully")

    async def get_attendance(self, event_id: uuid.UUID) -> AttendanceResponse:
        """Get all registered users for the event with their details."""
        stmt = (
            select(Registration)
            .options(joinedload(Registration.user))
            .where(Registration.event_id == event_id)
            .order_by(Registration.created_at.desc())
        )
        result = await self._session.execute(stmt)
        registrations = result.scalars().unique().all()

        attendees = []
        for reg in registrations:
            user = reg.user
            attendees.append(AttendeeItem(
                user_id=user.id,
                name=user.name,
                email=user.email,
                phone=user.phone,
                company=getattr(user, "company", None),
                food_preference=getattr(user, "food_preference", None),
                tshirt_size=getattr(user, "tshirt_size", None),
                growth_focus=getattr(user, "growth_focus", None),
                goodies_given=getattr(reg, "goodies_given", False),
                registered_at=reg.created_at.isoformat() if reg.created_at else "",
            ))

        return AttendanceResponse(total=len(attendees), attendees=attendees)

    async def toggle_goodies(
        self, event_id: uuid.UUID, payload: ToggleGoodiesRequest
    ) -> ToggleGoodiesResponse:
        """Toggle goodies_given for a registration."""
        stmt = select(Registration).where(
            Registration.user_id == payload.user_id,
            Registration.event_id == event_id,
        )
        result = await self._session.execute(stmt)
        reg = result.scalar_one_or_none()

        if reg:
            reg.goodies_given = payload.goodies_given
            await self._session.commit()
            return ToggleGoodiesResponse(success=True, goodies_given=payload.goodies_given)
        return ToggleGoodiesResponse(success=False, goodies_given=False)

    async def get_feedback(self, event_id: uuid.UUID) -> FeedbackListResponse:
        """Get all feedback entries with user details."""
        stmt = (
            select(Feedback)
            .options(joinedload(Feedback.user))
            .where(Feedback.event_id == event_id)
            .order_by(Feedback.created_at.desc())
        )
        result = await self._session.execute(stmt)
        entries = result.scalars().unique().all()

        total = len(entries)
        avg_rating = sum(e.rating for e in entries) / total if total > 0 else 0.0

        items = []
        for entry in entries:
            items.append(FeedbackItem(
                user_name=entry.user.name if entry.user else "Unknown",
                user_email=entry.user.email if entry.user else "",
                rating=entry.rating,
                comments=entry.comments,
                submitted_at=entry.created_at.isoformat() if entry.created_at else "",
            ))

        return FeedbackListResponse(total=total, average_rating=round(avg_rating, 1), feedback=items)

    async def scan_attendance_from_qr(
        self,
        event_id: uuid.UUID,
        payload: ScanAttendanceRequest,
    ) -> ScanAttendanceResponse:
        parsed = self._parse_scan_payload(payload.qr_payload)
        if parsed.event_id and parsed.event_id != event_id:
            raise ValidationError("Scanned QR belongs to a different event")

        target: Registration | None = None

        if parsed.user_id:
            target = await self._find_registration_by_user_id(event_id, parsed.user_id)

        if not target and parsed.email:
            target = await self._find_registration_by_email(event_id, parsed.email)

        if not target and parsed.phone:
            target = await self._find_registration_by_phone(event_id, parsed.phone)

        if not target:
            raise NotFoundError("Attendee not found for this event")

        if not target.goodies_given:
            target.goodies_given = True
            await self._session.commit()
            await self._session.refresh(target)
            message = f"Attendance marked and goodies issued for {target.user.name}."
        else:
            message = f"{target.user.name} is already marked with goodies issued."

        # Also mark the ticket as scanned if a ticket_id was in the QR
        if parsed.ticket_id:
            try:
                from app.models.ticket import Ticket
                from sqlalchemy import select as sa_select

                result = await self._session.execute(
                    sa_select(Ticket).where(Ticket.ticket_id == parsed.ticket_id)
                )
                ticket = result.scalar_one_or_none()
                if ticket and not ticket.scanned:
                    ticket.scanned = True
                    ticket.scanned_at = datetime.now(timezone.utc)
                    await self._session.commit()
            except Exception:
                pass  # Don't fail attendance for ticket marking issues

        attendee = self._to_attendee_item(target)
        return ScanAttendanceResponse(
            success=True,
            message=message,
            attendee=attendee,
            goodies_given=attendee.goodies_given,
        )

    # ── Food Attendance ────────────────────────────────────

    MEAL_SLOTS = ["dinner1", "breakfast", "tea1", "tea2", "lunch", "tea3", "dinner2", "tea4"]
    SLOT_LABELS = {
        "dinner1": "Dinner 1",
        "breakfast": "Breakfast",
        "tea1": "Tea/Coffee 1",
        "tea2": "Tea/Coffee 2",
        "lunch": "Lunch",
        "tea3": "Tea/Coffee 3",
        "dinner2": "Dinner 2",
        "tea4": "Tea/Coffee 4",
    }

    def _food_item(self, user, fa) -> "FoodAttendanceItem":
        from app.schemas.admin import FoodAttendanceItem
        slots = {s: getattr(fa, s, False) if fa else False for s in self.MEAL_SLOTS}
        total = sum(1 for v in slots.values() if v)
        return FoodAttendanceItem(
            user_id=user.id,
            name=user.name,
            email=user.email,
            phone=user.phone,
            company=getattr(user, "company", None),
            food_preference=getattr(user, "food_preference", None),
            growth_focus=getattr(user, "growth_focus", None),
            total_meals=total,
            **slots,
        )

    async def get_food_attendance(self, event_id: uuid.UUID):
        from app.schemas.admin import FoodAttendanceResponse
        from app.models.food_attendance import FoodAttendance

        # Get all registrations for this event
        stmt = (
            select(Registration)
            .options(joinedload(Registration.user))
            .where(Registration.event_id == event_id)
            .order_by(Registration.created_at)
        )
        result = await self._session.execute(stmt)
        registrations = result.scalars().unique().all()

        # Get all food attendance records
        fa_stmt = select(FoodAttendance).where(FoodAttendance.event_id == event_id)
        fa_result = await self._session.execute(fa_stmt)
        fa_map = {fa.user_id: fa for fa in fa_result.scalars().all()}

        items = []
        total_meals = 0
        for reg in registrations:
            user = reg.user
            if not user:
                continue
            fa = fa_map.get(user.id)
            item = self._food_item(user, fa)
            total_meals += item.total_meals
            items.append(item)

        return FoodAttendanceResponse(
            total=len(items),
            total_meals_served=total_meals,
            attendees=items,
        )

    async def scan_food_qr(self, event_id: uuid.UUID, payload):
        from app.schemas.admin import FoodScanResponse
        from app.models.food_attendance import FoodAttendance

        parsed = self._parse_scan_payload(payload.qr_payload)

        # Find registration using same pattern as attendance scan
        target: Registration | None = None

        if parsed.user_id:
            target = await self._find_registration_by_user_id(event_id, parsed.user_id)
        if not target and parsed.email:
            target = await self._find_registration_by_email(event_id, parsed.email)
        if not target and parsed.phone:
            target = await self._find_registration_by_phone(event_id, parsed.phone)

        if not target:
            raise ValueError("No matching registration found for this QR code")

        user = target.user

        # Get or create food attendance record
        fa_stmt = select(FoodAttendance).where(
            FoodAttendance.user_id == user.id,
            FoodAttendance.event_id == event_id,
        )
        fa_result = await self._session.execute(fa_stmt)
        fa = fa_result.scalar_one_or_none()

        if not fa:
            fa = FoodAttendance(user_id=user.id, event_id=event_id)
            self._session.add(fa)
            await self._session.flush()

        # If admin specified a slot, use it; otherwise auto-detect next empty
        target_slot = getattr(payload, "slot", None)
        slot_filled = None

        if target_slot and target_slot in self.MEAL_SLOTS:
            if getattr(fa, target_slot):
                item = self._food_item(user, fa)
                return FoodScanResponse(
                    success=False,
                    message=f"{self.SLOT_LABELS[target_slot]} already marked for {user.name}",
                    attendee=item,
                    slot_filled="none",
                )
            setattr(fa, target_slot, True)
            slot_filled = target_slot
        else:
            for slot in self.MEAL_SLOTS:
                if not getattr(fa, slot):
                    setattr(fa, slot, True)
                    slot_filled = slot
                    break

        if not slot_filled:
            item = self._food_item(user, fa)
            return FoodScanResponse(
                success=False,
                message=f"All 8 meal slots already used for {user.name}",
                attendee=item,
                slot_filled="none",
            )

        await self._session.commit()

        # Mark ticket scanned if applicable
        if parsed.ticket_id:
            try:
                from app.models.ticket import Ticket
                from sqlalchemy import select as sa_select
                result = await self._session.execute(
                    sa_select(Ticket).where(Ticket.ticket_id == parsed.ticket_id)
                )
                ticket = result.scalar_one_or_none()
                if ticket and not ticket.scanned:
                    ticket.scanned = True
                    ticket.scanned_at = datetime.now(timezone.utc)
                    await self._session.commit()
            except Exception:
                pass

        item = self._food_item(user, fa)
        return FoodScanResponse(
            success=True,
            message=f"{self.SLOT_LABELS[slot_filled]} marked for {user.name}",
            attendee=item,
            slot_filled=slot_filled,
        )

    async def toggle_food_slot(self, event_id: uuid.UUID, payload):
        from app.models.food_attendance import FoodAttendance

        # Get or create food attendance record
        fa_stmt = select(FoodAttendance).where(
            FoodAttendance.user_id == payload.user_id,
            FoodAttendance.event_id == event_id,
        )
        fa_result = await self._session.execute(fa_stmt)
        fa = fa_result.scalar_one_or_none()

        if not fa:
            fa = FoodAttendance(user_id=payload.user_id, event_id=event_id)
            self._session.add(fa)
            await self._session.flush()

        setattr(fa, payload.slot, payload.value)
        await self._session.commit()

        # Return updated item
        user_stmt = select(User).where(User.id == payload.user_id)
        user_result = await self._session.execute(user_stmt)
        user = user_result.scalar_one()

        item = self._food_item(user, fa)
        return {"success": True, "attendee": item}

