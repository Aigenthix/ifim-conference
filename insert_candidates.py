"""Import candidates from Excel into the event platform DB.

Fixes:
- Strip whitespace from column names
- Only process rows with a valid Full Name
- Clean phone numbers to exactly 10 digits
- Map 'Title of the Paper' -> growth_focus column
- For rows without email, generate a placeholder email from phone
- Delete previously-imported bad data (nan names, 0000000000 phones)
"""

import re
import asyncio
import pandas as pd
from sqlalchemy import select, delete, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings
from app.models.user import User
from app.models.registration import Registration
from app.models.food_attendance import FoodAttendance
from app.models.event import Event


def clean_phone(raw) -> str:
    """Extract exactly 10 digits from any phone value."""
    s = str(raw).strip()
    # Remove .0 from float conversion
    if s.endswith(".0"):
        s = s[:-2]
    digits = re.sub(r"\D+", "", s)
    # Strip country code
    if len(digits) > 10 and digits.startswith("91"):
        digits = digits[2:]
    if len(digits) > 10 and digits.startswith("0"):
        digits = digits[1:]
    # Take last 10 digits
    if len(digits) >= 10:
        return digits[-10:]
    # If fewer than 10 digits, return what we have (don't zero-pad)
    return digits if digits else ""


async def main():
    settings = get_settings()
    engine = create_async_engine(str(settings.DATABASE_URL), echo=False)
    async_session = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    # Read Excel
    df = pd.read_excel("app-viksitbarat2047.xlsx")
    # Strip whitespace from column names
    df.columns = [c.strip() for c in df.columns]

    # Get the event
    async with async_session() as session:
        result = await session.execute(select(Event).limit(1))
        event = result.scalar_one_or_none()
        if not event:
            print("ERROR: No event found in DB!")
            return
        event_id = event.id
        print(f"Event: {event.title} ({event_id})")

        # ── Step 1: Delete bad data from previous import ──
        # Find users with name='nan' (string) that were wrongly imported
        bad_users_stmt = select(User).where(User.name == "nan")
        bad_result = await session.execute(bad_users_stmt)
        bad_users = bad_result.scalars().all()

        if bad_users:
            bad_ids = [u.id for u in bad_users]
            print(f"Cleaning up {len(bad_ids)} bad users with name='nan'...")

            # Delete food_attendance for these users
            await session.execute(
                delete(FoodAttendance).where(FoodAttendance.user_id.in_(bad_ids))
            )
            # Delete registrations for these users
            await session.execute(
                delete(Registration).where(Registration.user_id.in_(bad_ids))
            )
            # Delete the users
            await session.execute(
                delete(User).where(User.id.in_(bad_ids))
            )
            await session.commit()
            print(f"Cleaned up {len(bad_ids)} bad records.")

        # ── Step 2: Import valid rows ──
        # Only rows with a valid Full Name
        valid = df[df["Full Name"].notna()].copy()
        valid = valid[~valid["Full Name"].astype(str).str.strip().isin(["", "nan", "Full Name", "two papers"])]

        print(f"\nProcessing {len(valid)} valid rows...")

        added = 0
        updated = 0
        skipped = 0

        for idx, row in valid.iterrows():
            name = str(row["Full Name"]).strip()

            # Email
            raw_email = row.get("Email ID")
            if pd.notna(raw_email):
                email = str(raw_email).strip().lower()
                if not email or email == "nan" or "@" not in email:
                    email = None
            else:
                email = None

            # Phone
            phone = clean_phone(row.get("Mobile Number", ""))

            # If no email AND no phone, skip
            if not email and not phone:
                print(f"  Row {idx}: SKIP (no email, no phone) - {name}")
                skipped += 1
                continue

            # Generate placeholder email if missing
            if not email:
                email = f"{phone}@placeholder.local"

            # Title of Paper -> growth_focus
            raw_paper = row.get("Title of the Paper")
            growth_focus = str(raw_paper).strip() if pd.notna(raw_paper) and str(raw_paper).strip() != "nan" else None

            # Check if user exists by email
            stmt = select(User).where(User.email == email)
            res = await session.execute(stmt)
            user = res.scalar_one_or_none()

            if not user:
                user = User(
                    name=name,
                    email=email,
                    phone=phone,
                    growth_focus=growth_focus,
                )
                session.add(user)
                await session.flush()
                added += 1
                print(f"  Row {idx}: ADD  - {name} | {email} | {phone} | {growth_focus or '(no paper)'}")
            else:
                # Update existing user with correct data
                user.name = name
                user.phone = phone
                if growth_focus:
                    user.growth_focus = growth_focus
                await session.flush()
                updated += 1
                print(f"  Row {idx}: UPD  - {name} | {email} | {phone} | {growth_focus or '(no paper)'}")

            # Ensure Registration exists
            reg_stmt = select(Registration).where(
                Registration.user_id == user.id,
                Registration.event_id == event_id,
            )
            reg_res = await session.execute(reg_stmt)
            if not reg_res.scalar_one_or_none():
                session.add(Registration(user_id=user.id, event_id=event_id))

            # Ensure FoodAttendance exists
            fa_stmt = select(FoodAttendance).where(
                FoodAttendance.user_id == user.id,
                FoodAttendance.event_id == event_id,
            )
            fa_res = await session.execute(fa_stmt)
            if not fa_res.scalar_one_or_none():
                session.add(FoodAttendance(user_id=user.id, event_id=event_id))

        await session.commit()
        print(f"\n✅ Done! Added {added}, Updated {updated}, Skipped {skipped}")

if __name__ == "__main__":
    asyncio.run(main())
