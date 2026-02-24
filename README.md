# Event Platform

A production-grade, event platform consisting of a Next.js frontend and a FastAPI backend. Designed to handle high concurrency Architecture & Tech Stack.

### Frontend

- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Styling**: Modern UI with Geist font
- **Deployment**: Ready for Vercel / Node.js environments

### Backend

- **Framework**: FastAPI (Python)
- **Concurrency**: Async operations & WebSockets
- **Background Tasks**: Celery Workers

### Database (PostgreSQL)

The application uses PostgreSQL as the primary source of truth, managed via Alembic migrations. `pgvector` is utilized for RAG embeddings.

#### Core Tables & Structure:

- **`users`**: `id` (UUID), `name`, `email`, `phone`, timestamps.
- **`events`**: `id` (UUID), `title`, `slug`, `description`, `qr_code_url`, JSON metadata (`speakers_json`, `team_json`, `overview_json`), `starts_at`, `ends_at`, `is_active`.
- **`registrations`**: `id` (UUID), `user_id` (FK), `event_id` (FK) — links users to events.
- **`polls`**: `id` (UUID), `event_id` (FK), `question`, `is_active`.
- **`poll_options`**: `id` (UUID), `poll_id` (FK), `option_text`, `display_order`.
- **`poll_votes`**: `id` (UUID), `poll_id` (FK), `option_id` (FK), `user_id` (FK) — acts as a persistent archive flushed periodically from Redis.
- **Other Tables**: `feedback`, `certificates`, `chat_logs` (for RAG), `admin_users`.

### Caching & PubSub (Redis)

Redis plays a crucial role in maintaining performance under extreme load:

- **High-Concurrency Voting**: Uses `HINCRBY` atomic counters to handle 5L concurrent votes without hitting the DB per vote. Polled data is flushed to PostgreSQL every 5s.
- **WebSockets Pub/Sub**: Fan-out live poll updates to all API instances across the horizontally scaled backend.
- **Stateless Sessions**: Lobbies and temporary state are cached with strict TTLs (e.g., 5 min for lobby data).

## Key Features

- **Real-Time Polls & Voting**: Handled entirely via Redis + WebSockets to ensure extreme scale.
- **AI RAG Chatbot**: Powered by pgvector and swappable LLMs, letting users query event schedules and info interactively.
- **Automated Certificates**: Async workers (Celery) generate and upload certificates to S3, notifying users via email.
- **Modular Frontend**: Next.js frontend configured for server-side rendering and rapid interactive capabilities.

## Getting Started

### Backend

1. `cd backend`
2. `cp .env.example .env`
3. Start Redis & PostgreSQL via `docker-compose up -d`
4. Apply migrations: `alembic upgrade head`
5. Start API: `uvicorn app.main:app --reload`
6. Start Celery workers: `celery -A app.workers.celery_app worker`

### Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Access the client app at `http://localhost:3000`

### Admin Access

By default, the database is seeded with the following admin credentials:

- **Email:** `admin@rajdarbar.com`
- **Password:** `RajDarbar2026!`

---

_Built for scale, stability, and real-time event experiences._
