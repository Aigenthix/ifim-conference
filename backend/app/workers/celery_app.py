"""
Celery application configuration.

Uses Redis as both broker and result backend.
Provides task auto-discovery for worker modules.
"""
from __future__ import annotations

from celery import Celery
from celery.schedules import crontab

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "event_platform",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.email_tasks"],
)

celery_app.conf.update(
    # Serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",

    # Timezone
    timezone="UTC",
    enable_utc=True,

    # Reliability
    task_acks_late=True,
    worker_prefetch_multiplier=1,

    # Task routing
    task_routes={
        "app.workers.certificate_worker.*": {"queue": "certificates"},
        "app.workers.analytics_worker.*": {"queue": "analytics"},
    },

    # Beat schedule — periodic tasks
    beat_schedule={
        "flush-poll-votes": {
            "task": "app.workers.analytics_worker.flush_poll_votes_to_db",
            "schedule": 5.0,  # Every 5 seconds
        },
        "aggregate-analytics": {
            "task": "app.workers.analytics_worker.aggregate_event_analytics",
            "schedule": crontab(minute="*/5"),  # Every 5 minutes
        },
    },
)

# Auto-discover tasks in worker modules
celery_app.autodiscover_tasks(["app.workers"])
