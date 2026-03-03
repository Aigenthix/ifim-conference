-- ============================================================
-- Bharat Synapse@2047 — Reset all participant data
-- Run INSIDE the postgres container:
--   docker exec -i <postgres_container> psql -U postgres -d eventplatform < reset_data.sql
-- ============================================================

-- Disable FK checks temporarily
SET session_replication_role = 'replica';

-- Clear all participant-related data
TRUNCATE TABLE poll_votes CASCADE;
TRUNCATE TABLE poll_options CASCADE;
TRUNCATE TABLE polls CASCADE;
TRUNCATE TABLE qa_questions CASCADE;
TRUNCATE TABLE community_messages CASCADE;
TRUNCATE TABLE chat_logs CASCADE;
TRUNCATE TABLE feedback CASCADE;
TRUNCATE TABLE certificates CASCADE;
TRUNCATE TABLE food_attendance CASCADE;
TRUNCATE TABLE alerts CASCADE;
TRUNCATE TABLE sessions CASCADE;
TRUNCATE TABLE registrations CASCADE;
TRUNCATE TABLE tickets CASCADE;
TRUNCATE TABLE users CASCADE;

-- Re-enable FK checks
SET session_replication_role = 'origin';

-- Update the event record with Bharat Synapse@2047 data
UPDATE events SET
  title = 'Bharat Synapse@2047',
  slug = 'event',
  description = 'Bharat Synapse@2047: Contours of a Future-ready Bharat. A national interdisciplinary conference exploring the role of AI in achieving Viksit Bharat 2047 goals. Organized by IFIM School of Technology, IFIM College, Bengaluru.',
  overview_json = '{"venue": "Auditorium, IFIM College, Bengaluru", "dress_code": "Smart Casual / Formal", "schedule": [{"time": "02:30 - 02:40 PM", "title": "Inauguration & Welcome Address", "day": "Day 1 — 5th March (Offline)"}, {"time": "02:40 - 03:00 PM", "title": "Panel: Role of AI in Achieving Viksit Bharat 2047 Goals — Mr. Pranav Padode", "day": "Day 1 — 5th March (Offline)"}, {"time": "03:00 - 03:20 PM", "title": "AI & Governance — Dr. Nilima Panchal", "day": "Day 1 — 5th March (Offline)"}, {"time": "03:20 - 03:40 PM", "title": "AI in Education — Dr. A V Arun Kumar", "day": "Day 1 — 5th March (Offline)"}, {"time": "03:40 - 03:55 PM", "title": "AI & Academic Research — Dr. Sridevi Varanasi", "day": "Day 1 — 5th March (Offline)"}, {"time": "03:55 - 04:00 PM", "title": "Vote of Thanks — Prof. Nikil Gupta", "day": "Day 1 — 5th March (Offline)"}, {"time": "10:00 - 10:15 AM", "title": "Paper: Real-Time Fake News Detection Using Graph Neural Networks — Yashwanth C", "day": "Day 2 — 6th March (Online, Track 1)"}, {"time": "10:15 - 10:30 AM", "title": "Paper: Comparative Study of Mangamid and XAR: AI in Animation — Divya T L", "day": "Day 2 — 6th March (Online, Track 1)"}, {"time": "10:30 - 10:45 AM", "title": "Paper: Predicting Collateral Damage in Machine Unlearning — Saisab Sadhu", "day": "Day 2 — 6th March (Online, Track 1)"}, {"time": "10:45 - 11:00 AM", "title": "Paper: Agentic AI: Reactive Models to Autonomous Decision-Making — Dr. Gunjan Bhatia", "day": "Day 2 — 6th March (Online, Track 1)"}, {"time": "11:00 - 11:15 AM", "title": "Paper: Federated Learning-Based Intrusion Detection for IoT — Dr. Neera", "day": "Day 2 — 6th March (Online, Track 1)"}, {"time": "11:15 - 11:30 AM", "title": "Paper: Autonomous Mobile Robots in Defence — Parth Bhirwandekar", "day": "Day 2 — 6th March (Online, Track 1)"}, {"time": "11:30 - 11:45 AM", "title": "Paper: Atmospheric Visibility Prediction & Forecasting — Shreya P Negur", "day": "Day 2 — 6th March (Online, Track 1)"}, {"time": "11:45 AM - 01:15 PM", "title": "Panel: AI Enabled Workforce — Challenges and Opportunities", "day": "Day 2 — 6th March (Offline)"}, {"time": "11:45 - 12:00 PM", "title": "Industry Keynote — Dr. Sakkthivel A M (Principal, IFIM College)", "day": "Day 2 — 6th March (Offline)"}, {"time": "12:00 - 12:20 PM", "title": "AI in Enterprise — Dr. Tapan Nayak (Director, ISBR)", "day": "Day 2 — 6th March (Offline)"}, {"time": "12:20 - 12:40 PM", "title": "AI & Marketing Strategy — Nitish Mathur (CEO, 3Cans)", "day": "Day 2 — 6th March (Offline)"}, {"time": "12:40 - 01:00 PM", "title": "Finance & AI — Srinivas K (HP)", "day": "Day 2 — 6th March (Offline)"}, {"time": "01:00 - 01:15 PM", "title": "Panel Discussion & Closing — Dr Arpit Deepak Yadav", "day": "Day 2 — 6th March (Offline)"}]}',
  speakers_json = '[{"name": "Mr. Pranav Padode", "title": "Board Member, CDE", "bio": "Board member at the Centre for Digital Entrepreneurship, bringing policy and governance expertise to the intersection of AI and national development."}, {"name": "Dr. A V Arun Kumar", "title": "Director, IFIM College", "bio": "Director of IFIM College with extensive experience in academic leadership, technology education, and institutional development."}, {"name": "Dr. Sridevi Varanasi", "title": "Academic Dean, JagSoM", "bio": "Academic Dean at Jagdish Sheth School of Management (JagSoM), specializing in academic research and management education."}, {"name": "Dr. Nilima Panchal", "title": "Prof & Head, Dept. of Public Policy & Governance, Gujarat University", "bio": "Professor and Head of the Department of Public Policy and Governance at Gujarat University, with research focus on AI-driven governance frameworks."}, {"name": "Prof. Nikil Gupta", "title": "Professor of Practice, IFIM College", "bio": "Professor of Practice at IFIM College bringing industry experience to academic research and technology education."}, {"name": "Dr. Sakkthivel A M", "title": "Principal, IFIM College", "bio": "Principal of IFIM College, leading institutional growth in technology and management education."}, {"name": "Dr. Tapan Nayak", "title": "Director, ISBR", "bio": "Director at ISBR Business School, specializing in AI applications in enterprise management and organizational transformation."}, {"name": "Dr Arpit Deepak Yadav", "title": "Asst Prof in IT and Analytics, IFIM College", "bio": "Assistant Professor specializing in Information Technology and Analytics at IFIM College, contributing to AI research and curriculum development."}, {"name": "Srinivas K", "title": "Finance Planning & Analysis Manager, Hewlett-Packard (HP)", "bio": "Finance Planning and Analysis Manager at HP, bringing corporate perspectives on AI integration in financial planning and enterprise operations."}, {"name": "Nitish Mathur", "title": "CEO, 3Cans | AI, XR & Marketing Strategist", "bio": "CEO of 3Cans and an AI, XR, and Marketing Strategist driving innovation at the intersection of emerging technologies and business strategy."}]',
  team_json = '[{"name": "Dr. Vishal C", "role": "Conference Chair"}, {"name": "Dr. Sunetra Chatterjee", "role": "Conference Chair"}, {"name": "Dr. Salur Srikant Patnaik", "role": "Dean, School of Technology"}, {"name": "Dr. A V Arun Kumar", "role": "Director, IFIM College"}, {"name": "Dr. Sakkthivel", "role": "Dean of Management"}, {"name": "Dr. N. Ramu", "role": "Registrar"}, {"name": "Dr. S. ChandraSekhar Subramanyam", "role": "Sr. Professor"}, {"name": "Dr. Vidhya Pillai", "role": "Asst. Dean, MBA"}, {"name": "Prof. Swarnika Dixit", "role": "Asst. Dean, BBA-B.COM"}, {"name": "Dr. H.S. Gitanjali", "role": "Program Head, B.COM"}, {"name": "Dr. Sathya Thangavel", "role": "HOD, Language Dept"}, {"name": "Dr. Nataraja N S", "role": "Area Chair, Analytics"}, {"name": "Prof. Nikil Gupta", "role": "Professor of Practice"}, {"name": "Prof. Pooja Ogale", "role": "Asst. Professor, Law College"}]'
WHERE slug = 'event';

SELECT 'Data reset and event updated for Bharat Synapse@2047!' AS status;
