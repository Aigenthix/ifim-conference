# Event Platform Backend

A production-grade, horizontally-scalable event platform backend built with FastAPI, PostgreSQL, Redis, WebSockets, Celery, and a modular RAG pipeline.

**Designed for 3–5 lakh concurrent users per event.**

---

## Architecture

```
Client ──► Load Balancer ──► FastAPI (N instances, stateless)
                                  │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
                 Redis         PostgreSQL     Celery Workers
              (cache, pubsub,  (source of     (certificates,
               vote counters,   truth)         analytics)
               sessions)          │
                                  ├── pgvector (RAG embeddings)
                                  │
                               Object Storage (S3)
```

## Quick Start

```bash
# 1. Copy environment config
cp .env.example .env

# 2. Start all services
docker compose up -d

# 3. Run database migrations
alembic upgrade head

# 4. Start the API server (development)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 5. Start Celery worker (separate terminal)
celery -A app.workers.celery_app worker --loglevel=info

# 6. Start Celery beat (separate terminal)
celery -A app.workers.celery_app beat --loglevel=info
```

## API Docs

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## Project Structure

```
backend/
├── alembic/              # Database migrations
├── app/
│   ├── api/v1/           # Route controllers (auth, events, polls, etc.)
│   ├── core/             # Config, security, logging, exceptions
│   ├── db/               # Engine, session factory, base model
│   ├── models/           # SQLAlchemy ORM models (10 tables)
│   ├── schemas/          # Pydantic request/response schemas
│   ├── repositories/     # Data access layer (async CRUD)
│   ├── services/         # Business logic layer
│   ├── websocket/        # WebSocket manager + Redis Pub/Sub
│   ├── workers/          # Celery background tasks
│   ├── ai/               # RAG pipeline (embeddings, vector store, LLM)
│   └── main.py           # App factory + lifespan
├── docker-compose.yml    # Full stack: API, PG, Redis, Celery
├── Dockerfile
├── requirements.txt
└── .env.example
```

## Key Design Decisions

| Concern                      | Solution                                                |
| ---------------------------- | ------------------------------------------------------- |
| **5L concurrent votes**      | Redis `HINCRBY` atomic counters, never hit DB per vote  |
| **Cross-instance WebSocket** | Redis Pub/Sub fan-out to all API instances              |
| **Stateless API**            | JWT tokens, Redis sessions, no server-side state        |
| **Certificate gen**          | Async Celery worker, S3 upload, email notification      |
| **RAG chatbot**              | pgvector embeddings, cosine similarity, swappable LLM   |
| **Photo gallery**            | Pre-signed S3 URLs, CDN-ready, no proxy through backend |
| **Vote persistence**         | Periodic Redis → PostgreSQL flush (every 5s)            |
| **Lobby caching**            | Redis cache with 5-min TTL                              |

## API Endpoints

| Method | Path                                 | Auth  | Description                |
| ------ | ------------------------------------ | ----- | -------------------------- |
| POST   | `/api/v1/auth/register`              | —     | QR-scan registration + JWT |
| GET    | `/api/v1/events/{slug}/lobby`        | JWT   | Event lobby data           |
| GET    | `/api/v1/polls/{poll_id}`            | JWT   | Poll with live counts      |
| POST   | `/api/v1/polls/{poll_id}/vote`       | JWT   | Cast vote (Redis atomic)   |
| WS     | `/ws/polls/{event_id}`               | JWT   | Live poll updates          |
| POST   | `/api/v1/feedback`                   | JWT   | Submit feedback → cert     |
| GET    | `/api/v1/certificates/me`            | JWT   | Certificate download       |
| GET    | `/api/v1/gallery/{event_id}`         | JWT   | Photos (signed URLs)       |
| POST   | `/api/v1/chatbot/query`              | JWT   | RAG query                  |
| GET    | `/api/v1/admin/dashboard/{event_id}` | Admin | Analytics dashboard        |

## Production Deployment

```bash
# Run with multiple workers
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --loop uvloop

# Scale Celery workers
celery -A app.workers.celery_app worker --concurrency=8 -Q certificates,analytics
```

## Database Migrations

```bash
# Generate migration after model changes
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```
