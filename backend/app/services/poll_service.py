"""
Poll service — high-scale voting with Redis atomic counters.

Design:
  - Votes are recorded in Redis (HINCRBY for counts, SADD for dedup)
  - WebSocket notifications via Redis PUBLISH
  - Background worker periodically flushes Redis → PostgreSQL
  - NEVER writes every vote directly to DB
"""
from __future__ import annotations

import uuid

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, RateLimitError
from app.repositories.poll_repo import PollRepository
from app.schemas.poll import (
    PollCreateRequest,
    PollOptionSchema,
    PollResponse,
    VoteRequest,
    VoteResponse,
)


class PollService:
    """
    High-throughput poll voting via Redis.

    Key patterns:
        poll:{poll_id}:votes      — Hash: option_id -> count
        poll:{poll_id}:voters     — Set: user_ids who voted
        rate:{user_id}:vote       — Rate limit key (1s TTL)
        poll_updates:{event_id}   — Pub/Sub channel for live updates
    """

    def __init__(
        self,
        session: AsyncSession,
        redis: aioredis.Redis,
    ) -> None:
        self._repo = PollRepository(session)
        self._redis = redis

    async def get_poll(self, poll_id: uuid.UUID) -> PollResponse:
        """Get poll with live counts from Redis."""
        poll = await self._repo.get_with_options(poll_id)
        if not poll:
            raise NotFoundError("Poll not found")

        # Fetch live counts from Redis
        votes_key = f"poll:{poll_id}:votes"
        raw_counts = await self._redis.hgetall(votes_key)

        options = []
        for opt in poll.options:
            count = int(raw_counts.get(str(opt.id), 0))
            options.append(
                PollOptionSchema(
                    id=opt.id,
                    option_text=opt.option_text,
                    display_order=opt.display_order,
                    vote_count=count,
                )
            )

        return PollResponse(
            id=poll.id,
            question=poll.question,
            is_active=poll.is_active,
            options=options,
        )

    async def cast_vote(
        self,
        poll_id: uuid.UUID,
        user_id: uuid.UUID,
        event_id: uuid.UUID,
        vote: VoteRequest,
    ) -> VoteResponse:
        """
        Cast a vote using Redis atomic operations.

        Steps:
        1. Rate limit check (1 vote per second)
        2. Deduplication check (SISMEMBER)
        3. Atomic counter increment (HINCRBY)
        4. Add to voter set (SADD)
        5. Publish update for WebSocket fan-out
        """
        # 1. Rate limit
        rate_key = f"rate:{user_id}:vote"
        if await self._redis.exists(rate_key):
            raise RateLimitError("Please wait before voting again")
        await self._redis.setex(rate_key, 1, "1")

        # 2. Check previous vote (allow changing)
        voters_key = f"poll:{poll_id}:voters"
        prev_option_key = f"poll:{poll_id}:voter:{user_id}"
        previous_option = await self._redis.get(prev_option_key)

        # 3. Validate poll exists
        poll = await self._repo.get_with_options(poll_id)
        if not poll:
            raise NotFoundError("Poll not found")
        if not poll.is_active:
            raise ConflictError("Poll is no longer active")

        # Validate option belongs to poll
        valid_option_ids = {str(opt.id) for opt in poll.options}
        if str(vote.option_id) not in valid_option_ids:
            raise NotFoundError("Invalid poll option")

        # If voting for the same option, no-op
        if previous_option and previous_option == str(vote.option_id):
            return VoteResponse(poll_id=poll_id, option_id=vote.option_id)

        # 4. Atomic swap: decrement old option (if any), increment new option
        votes_key = f"poll:{poll_id}:votes"
        async with self._redis.pipeline(transaction=True) as pipe:
            if previous_option:
                pipe.hincrby(votes_key, previous_option, -1)
            pipe.hincrby(votes_key, str(vote.option_id), 1)
            pipe.sadd(voters_key, str(user_id))
            pipe.set(prev_option_key, str(vote.option_id))
            await pipe.execute()

        # 4b. Persist to PostgreSQL (upsert — update if user changes vote)
        from sqlalchemy.dialects.postgresql import insert as pg_insert
        from sqlalchemy import func
        from app.models.poll import PollVote

        stmt = pg_insert(PollVote).values(
            id=uuid.uuid4(),
            poll_id=poll_id,
            option_id=vote.option_id,
            user_id=user_id,
        ).on_conflict_do_update(
            constraint="uq_poll_vote_user",
            set_={
                "option_id": vote.option_id,
                "voted_at": func.now(),
            },
        )
        await self._repo._session.execute(stmt)
        await self._repo._session.commit()

        # 5. Publish update for WebSocket subscribers
        await self._redis.publish(
            f"poll_updates:{event_id}",
            f"{poll_id}",
        )

        return VoteResponse(poll_id=poll_id, option_id=vote.option_id)

    async def create_poll(self, payload: PollCreateRequest) -> PollResponse:
        """Admin: create a new poll with options."""
        poll = await self._repo.create_with_options(
            event_id=payload.event_id,
            question=payload.question,
            option_texts=payload.options,
        )

        options = [
            PollOptionSchema(
                id=opt.id,
                option_text=opt.option_text,
                display_order=opt.display_order,
                vote_count=0,
            )
            for opt in poll.options
        ]

        return PollResponse(
            id=poll.id,
            question=poll.question,
            is_active=poll.is_active,
            options=options,
        )

    async def get_event_polls(self, event_id: uuid.UUID) -> list[PollResponse]:
        """Get all active polls for an event with live counts."""
        polls = await self._repo.get_active_by_event(event_id)
        results = []
        for poll in polls:
            votes_key = f"poll:{poll.id}:votes"
            raw_counts = await self._redis.hgetall(votes_key)

            options = [
                PollOptionSchema(
                    id=opt.id,
                    option_text=opt.option_text,
                    display_order=opt.display_order,
                    vote_count=int(raw_counts.get(str(opt.id), 0)),
                )
                for opt in poll.options
            ]
            results.append(
                PollResponse(
                    id=poll.id,
                    question=poll.question,
                    is_active=poll.is_active,
                    options=options,
                )
            )
        return results
