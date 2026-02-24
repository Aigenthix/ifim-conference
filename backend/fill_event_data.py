import asyncio
import json
import uuid
from app.db.session import get_session_factory
from app.models.event import Event
from app.models.poll import Poll, PollOption
from sqlalchemy import select

async def fill_data():
    session_factory = get_session_factory()
    try:
        async with session_factory() as db:
            result = await db.execute(select(Event).filter(Event.slug == 'event'))
            event = result.scalars().first()
            if not event:
                print("Event not found!")
                return
            
            event.description = "Welcome to Raj Darbar 2026! Join us for an exclusive gathering of industry leaders, innovators, and visionaries discussing the future of technology and society."
            
            # Frontend expects: { venue?, dress_code?, schedule?: [{time, title, day}] }
            event.overview_json = json.dumps({
                "venue": "Grand Taj Convention Center, New Delhi",
                "dress_code": "Business Formal",
                "schedule": [
                    {"time": "09:00 AM", "title": "Registration & Breakfast Networking", "day": "Day 1 — Feb 27"},
                    {"time": "10:00 AM", "title": "Inaugural Keynote: The Future of AI in India", "day": "Day 1 — Feb 27"},
                    {"time": "11:30 AM", "title": "Panel: Scaling Startups in Emerging Markets", "day": "Day 1 — Feb 27"},
                    {"time": "01:00 PM", "title": "Networking Lunch & Exhibition", "day": "Day 1 — Feb 27"},
                    {"time": "02:30 PM", "title": "Workshop: Building with Generative AI", "day": "Day 1 — Feb 27"},
                    {"time": "04:00 PM", "title": "Fireside Chat: Leadership in the Digital Age", "day": "Day 1 — Feb 27"},
                    {"time": "05:30 PM", "title": "Day 1 Wrap-up & Evening Reception", "day": "Day 1 — Feb 27"},
                    {"time": "09:30 AM", "title": "Morning Yoga & Wellness Session", "day": "Day 2 — Feb 28"},
                    {"time": "10:30 AM", "title": "Keynote: Cloud Infrastructure at Scale", "day": "Day 2 — Feb 28"},
                    {"time": "12:00 PM", "title": "Panel: Women in Technology", "day": "Day 2 — Feb 28"},
                    {"time": "01:30 PM", "title": "Lunch Break", "day": "Day 2 — Feb 28"},
                    {"time": "03:00 PM", "title": "Hackathon Results & Demo Day", "day": "Day 2 — Feb 28"},
                    {"time": "04:30 PM", "title": "Closing Ceremony & Certificate Distribution", "day": "Day 2 — Feb 28"},
                ]
            })
            
            # Frontend expects: [{name, title?, bio?}]
            event.speakers_json = json.dumps([
                {
                    "name": "Dr. Sarah Chen",
                    "title": "Chief AI Scientist, TechVision Core",
                    "bio": "Leading researcher in generative AI and responsible computing with 15+ years of experience."
                },
                {
                    "name": "Michael Roberts",
                    "title": "VP of Engineering, Global Systems Inc",
                    "bio": "Expert in scaling distributed systems and cloud infrastructure for Fortune 500 companies."
                },
                {
                    "name": "Ananya Desai",
                    "title": "Founder & CEO, Innovate India Labs",
                    "bio": "Pioneer in adopting emerging technologies for emerging markets across South Asia."
                },
                {
                    "name": "Rajesh Krishnamurthy",
                    "title": "CTO, Digital India Foundation",
                    "bio": "Architect of India's largest digital governance platforms serving 500M+ citizens."
                },
                {
                    "name": "Priya Mehta",
                    "title": "Head of Product, CloudScale AI",
                    "bio": "Building next-generation AI products that democratize access to machine learning."
                }
            ])
            
            # Frontend expects: [{name, role?}]
            event.team_json = json.dumps([
                {"name": "Priya Sharma", "role": "Event Director"},
                {"name": "James Wilson", "role": "Technical Coordinator"},
                {"name": "Rahul Kapoor", "role": "Logistics Manager"},
                {"name": "Sneha Nair", "role": "Marketing Lead"},
                {"name": "Arjun Reddy", "role": "Sponsorship Head"},
                {"name": "Meera Joshi", "role": "Volunteer Coordinator"}
            ])
            
            await db.commit()
            print("Successfully updated event overview, speakers, and team!")

            # ── Create 3 Active Polls ───────────────────────────────
            polls_data = [
                {
                    "question": "Which technology will have the biggest impact on India's economy by 2030?",
                    "options": ["Artificial Intelligence", "Blockchain & Web3", "Quantum Computing", "Green Energy Tech"]
                },
                {
                    "question": "What is the biggest challenge facing tech startups in India today?",
                    "options": ["Talent Acquisition", "Funding & Investment", "Regulatory Compliance", "Market Competition"]
                },
                {
                    "question": "Which programming language will dominate enterprise development in the next 5 years?",
                    "options": ["Python", "Rust", "TypeScript", "Go"]
                }
            ]

            for pd in polls_data:
                poll = Poll(
                    id=uuid.uuid4(),
                    event_id=event.id,
                    question=pd["question"],
                    is_active=True
                )
                db.add(poll)
                await db.flush()

                for idx, opt_text in enumerate(pd["options"]):
                    option = PollOption(
                        id=uuid.uuid4(),
                        poll_id=poll.id,
                        option_text=opt_text,
                        display_order=idx
                    )
                    db.add(option)

            await db.commit()
            print("Successfully created 3 active polls with options!")

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(fill_data())
