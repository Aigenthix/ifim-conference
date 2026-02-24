import asyncio
import sys

# Because we are inside the docker container
# we can just import from app
from app.db.session import get_session_factory
from app.models.event import Event
from app.models.user import User
from app.models.registration import Registration
import uuid
import random

def generate_random_phone():
    return "+1" + "".join([str(random.randint(0, 9)) for _ in range(10)])

NAMES = [
    "Aarav Patel", "Vivaan Sharma", "Aditya Singh", "Vihaan Gupta", "Arjun Reddy",
    "Sai Kumar", "Ayaan Khan", "Krishna Rao", "Ishaan Verma", "Shaurya Das",
    "Aanya Joshi", "Diya Mishra", "Navya Iyer", "Kavya Menon", "Aadhya Nair",
    "Ananya Bose", "Saanvi Desai", "Myra Kapoor", "Riya Malhotra", "Tara Chopra"
]

async def seed():
    session_factory = get_session_factory()
    try:
        async with session_factory() as db:
            from sqlalchemy import select
            
            # Get latest active event or "event"
            event_query = await db.execute(select(Event).filter(Event.is_active == True))
            event = event_query.scalars().first()
            
            if not event:
                from datetime import datetime, timedelta, timezone
                print("No active event found! Creating 'raj-darbar' event...")
                event = Event(
                    id=uuid.uuid4(),
                    title="Raj Darbar 2026",
                    slug="event", # Common slug based on Next.js setup
                    starts_at=datetime.now(timezone.utc),
                    ends_at=datetime.now(timezone.utc) + timedelta(days=2),
                    is_active=True
                )
                db.add(event)
                await db.commit()
                await db.refresh(event)

            print(f"Target Event: {event.title} (Slug: {event.slug})")
            print("--- Generated 20 Users ---")
            
            for index, name in enumerate(NAMES):
                first_name = name.split()[0].lower()
                email = f"{first_name}{index}@example.com"
                phone = generate_random_phone()
                
                # Create user
                user = User(
                    id=uuid.uuid4(),
                    name=name,
                    email=email,
                    phone=phone
                )
                db.add(user)
                await db.flush() # flush to get id
                
                # Create registration
                reg = Registration(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    event_id=event.id
                )
                db.add(reg)
                await db.commit()
                print(f"Name: {name.ljust(20)} | Email: {email.ljust(25)} | Phone: {phone}")

            print("\nSuccessfully added 20 dummy users!")
    except Exception as e:
        print(f"Error during seeding: {e}")

if __name__ == "__main__":
    asyncio.run(seed())
