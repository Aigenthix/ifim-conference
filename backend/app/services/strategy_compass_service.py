"""
Strategy Compass service — dynamic BFSI topic generation for wheel spins.
"""
from __future__ import annotations

import random
import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.llm_client import generate_strategy_compass_topics
from app.core.exceptions import ForbiddenError, NotFoundError
from app.repositories.event_repo import EventRepository
from app.schemas.event import StrategyCompassTopic, StrategyCompassTopicsResponse

FALLBACK_TOPICS: list[dict[str, object]] = [
    {
        "title": "Algorithmic Trading Co-Pilots",
        "explanation": "AI detects micro-patterns in market data and supports disciplined, faster execution decisions for trading teams.",
    },
    {
        "title": "KYC Automation",
        "explanation": "AI extracts and verifies identity details from documents to accelerate onboarding and reduce manual review time.",
    },
    {
        "title": "Debt Collection AI",
        "explanation": "AI prioritizes accounts and recommends personalized outreach strategies that improve recovery rates while reducing operational overhead.",
    },
    {
        "title": "Synthetic Data for Privacy",
        "explanation": "AI creates privacy-safe synthetic datasets so teams can train models without exposing sensitive customer records.",
    },
    {
        "title": "ESG Scoring Intelligence",
        "explanation": "AI combines disclosures and market signals to produce more consistent ESG risk assessments for portfolio and lending decisions.",
    },
    {
        "title": "Claims Processing Automation",
        "explanation": "AI triages claims and flags anomalies quickly, helping insurers reduce fraud leakage and settle valid claims faster.",
    },
    {
        "title": "AML Alert Prioritization",
        "explanation": "AI ranks suspicious activity alerts by probable risk so investigators focus on the highest-impact cases first.",
    },
    {
        "title": "Fraud Ring Detection",
        "explanation": "AI graph models uncover hidden links across entities and transactions to identify coordinated fraud networks early.",
    },
    {
        "title": "Credit Underwriting Intelligence",
        "explanation": "AI blends traditional and alternative data to improve underwriting speed, consistency, and default risk prediction.",
    },
    {
        "title": "SME Cashflow Lending Models",
        "explanation": "AI evaluates invoice and transaction behavior to improve lending decisions for small and medium businesses.",
    },
    {
        "title": "Real-Time Payment Risk",
        "explanation": "AI monitors live payment streams and blocks suspicious transactions before funds are settled or withdrawn.",
    },
    {
        "title": "Customer Churn Prediction",
        "explanation": "AI identifies early churn signals and triggers retention actions for valuable BFSI customers before they leave.",
    },
    {
        "title": "Dynamic Insurance Pricing",
        "explanation": "AI updates risk estimates continuously to support more accurate, personalized insurance premium pricing.",
    },
    {
        "title": "Portfolio Rebalancing Signals",
        "explanation": "AI recommends allocation changes using risk, goals, and volatility signals to keep portfolios on strategy.",
    },
    {
        "title": "Regulatory Reporting Assistant",
        "explanation": "AI maps source data into compliance templates and catches inconsistencies prior to regulatory submissions.",
    },
    {
        "title": "Treasury Liquidity Forecasting",
        "explanation": "AI improves liquidity and cashflow forecasts, enabling better short-term funding and investment planning.",
    },
    {
        "title": "Cross-Sell Recommendation Engines",
        "explanation": "AI predicts relevant financial products for each customer to increase conversion and lifetime value.",
    },
    {
        "title": "Collections Voice Agents",
        "explanation": "AI voice bots handle routine follow-ups and escalate complex repayment cases to human specialists.",
    },
    {
        "title": "Contract Intelligence for Loans",
        "explanation": "AI extracts covenants and obligations from lending contracts so teams can monitor risk triggers proactively.",
    },
    {
        "title": "Claims Document Intelligence",
        "explanation": "AI reads unstructured claim evidence and summarizes key facts for faster and more accurate assessor decisions.",
    },
]


def _default_how_it_works(title: str, explanation: str) -> str:
    return (
        f"{explanation} The model combines transaction history, customer behavior, and operational signals to score risk and recommend actions "
        "with human oversight for critical decisions."
    )


def _default_business_impact(title: str) -> str:
    return (
        f"{title} typically improves cycle times and decision consistency while reducing manual effort. Teams can scale operations faster, "
        "control risk exposure better, and improve customer experience with measurable outcomes."
    )


def _default_implementation_steps(title: str) -> list[str]:
    lowered = title.lower()
    return [
        f"Define the {lowered} use case, baseline metrics, and governance owners.",
        "Prepare high-quality historical data and validate model assumptions with domain experts.",
        "Run a phased pilot with human-in-the-loop approvals before full production rollout.",
    ]


def _default_kpis() -> list[str]:
    return [
        "Turnaround time reduction (%)",
        "Accuracy or error-rate improvement (%)",
        "Cost-to-serve per case",
    ]


def _normalize_string_list(raw: Any, fallback: list[str]) -> list[str]:
    if not isinstance(raw, list):
        return fallback

    cleaned: list[str] = []
    for item in raw:
        value = str(item).strip()
        if value and value not in cleaned:
            cleaned.append(value)

    return cleaned[:5] if len(cleaned) >= 3 else fallback


def _coerce_topic(item: dict[str, object]) -> dict[str, object] | None:
    title = str(item.get("title", "")).strip()
    explanation = str(item.get("explanation", "")).strip()
    if not title or not explanation:
        return None

    how_it_works = str(item.get("how_it_works", "")).strip() or _default_how_it_works(
        title, explanation
    )
    business_impact = str(item.get("business_impact", "")).strip() or _default_business_impact(
        title
    )
    implementation_steps = _normalize_string_list(
        item.get("implementation_steps"),
        _default_implementation_steps(title),
    )
    kpis = _normalize_string_list(item.get("kpis"), _default_kpis())

    return {
        "title": title,
        "explanation": explanation,
        "how_it_works": how_it_works,
        "business_impact": business_impact,
        "implementation_steps": implementation_steps,
        "kpis": kpis,
    }


class StrategyCompassService:
    """Generates strategy compass wheel topics and enforces event scope."""

    def __init__(self, session: AsyncSession) -> None:
        self._event_repo = EventRepository(session)

    async def get_topics(
        self,
        slug: str,
        user_event_id: uuid.UUID,
        count: int = 8,
    ) -> StrategyCompassTopicsResponse:
        event = await self._event_repo.get_by_slug(slug)
        if not event:
            raise NotFoundError(f"Event '{slug}' not found")
        if event.id != user_event_id:
            raise ForbiddenError("You are not authorized to access this event")

        count = max(6, min(12, count))

        generated = await generate_strategy_compass_topics(count=count)
        normalized = self._normalize_topics(generated, count)

        return StrategyCompassTopicsResponse(
            topics=[StrategyCompassTopic(**item) for item in normalized]
        )

    def _normalize_topics(
        self,
        generated: list[dict[str, object]],
        count: int,
    ) -> list[dict[str, object]]:
        """
        Enforce uniqueness and fill short outputs with randomized fallback topics.
        """
        picked: list[dict[str, object]] = []
        seen: set[str] = set()

        for item in generated:
            topic = _coerce_topic(item)
            if not topic:
                continue
            key = str(topic["title"]).casefold()
            if key in seen:
                continue
            seen.add(key)
            picked.append(topic)
            if len(picked) >= count:
                break

        if len(picked) < count:
            fallback = FALLBACK_TOPICS.copy()
            random.shuffle(fallback)
            for item in fallback:
                topic = _coerce_topic(item)
                if not topic:
                    continue
                key = str(topic["title"]).casefold()
                if key in seen:
                    continue
                seen.add(key)
                picked.append(topic)
                if len(picked) >= count:
                    break

        return picked[:count]
