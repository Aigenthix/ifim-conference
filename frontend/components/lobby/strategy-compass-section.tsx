"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { eventsApi, type StrategyCompassTopic } from "@/lib/api";

type BfsiTopic = StrategyCompassTopic;

const FALLBACK_TOPIC_POOL: BfsiTopic[] = [
  {
    title: "Algorithmic Trading Co-Pilots",
    explanation: "AI detects micro-patterns in market data and supports disciplined, faster execution decisions for trading teams.",
  },
  {
    title: "KYC Automation",
    explanation: "AI extracts and verifies identity details from documents to accelerate onboarding and reduce manual review time.",
  },
  {
    title: "Debt Collection AI",
    explanation: "AI prioritizes accounts and recommends personalized outreach strategies that improve recovery rates while reducing operational overhead.",
  },
  {
    title: "Synthetic Data for Privacy",
    explanation: "AI creates privacy-safe synthetic datasets so teams can train models without exposing sensitive customer records.",
  },
  {
    title: "ESG Scoring Intelligence",
    explanation: "AI combines disclosures and market signals to produce more consistent ESG risk assessments for portfolio and lending decisions.",
  },
  {
    title: "Claims Processing Automation",
    explanation: "AI triages claims and flags anomalies quickly, helping insurers reduce fraud leakage and settle valid claims faster.",
  },
  {
    title: "AML Alert Prioritization",
    explanation: "AI ranks suspicious activity alerts by probable risk so investigators focus on the highest-impact cases first.",
  },
  {
    title: "Fraud Ring Detection",
    explanation: "AI graph models uncover hidden links across entities and transactions to identify coordinated fraud networks early.",
  },
  {
    title: "Credit Underwriting Intelligence",
    explanation: "AI blends traditional and alternative data to improve underwriting speed, consistency, and default risk prediction.",
  },
  {
    title: "SME Cashflow Lending Models",
    explanation: "AI evaluates invoice and transaction behavior to improve lending decisions for small and medium businesses.",
  },
  {
    title: "Real-Time Payment Risk",
    explanation: "AI monitors live payment streams and blocks suspicious transactions before funds are settled or withdrawn.",
  },
  {
    title: "Customer Churn Prediction",
    explanation: "AI identifies early churn signals and triggers retention actions for valuable BFSI customers before they leave.",
  },
  {
    title: "Dynamic Insurance Pricing",
    explanation: "AI updates risk estimates continuously to support more accurate, personalized insurance premium pricing.",
  },
  {
    title: "Portfolio Rebalancing Signals",
    explanation: "AI recommends allocation changes using risk, goals, and volatility signals to keep portfolios on strategy.",
  },
  {
    title: "Regulatory Reporting Assistant",
    explanation: "AI maps source data into compliance templates and catches inconsistencies prior to regulatory submissions.",
  },
  {
    title: "Treasury Liquidity Forecasting",
    explanation: "AI improves liquidity and cashflow forecasts, enabling better short-term funding and investment planning.",
  },
  {
    title: "Cross-Sell Recommendation Engines",
    explanation: "AI predicts relevant financial products for each customer to increase conversion and lifetime value.",
  },
  {
    title: "Collections Voice Agents",
    explanation: "AI voice bots handle routine follow-ups and escalate complex repayment cases to human specialists.",
  },
  {
    title: "Contract Intelligence for Loans",
    explanation: "AI extracts covenants and obligations from lending contracts so teams can monitor risk triggers proactively.",
  },
  {
    title: "Claims Document Intelligence",
    explanation: "AI reads unstructured claim evidence and summarizes key facts for faster and more accurate assessor decisions.",
  },
];

const SEGMENT_COUNT = 8;
const MAX_SPINS = 3;
const SPIN_DURATION_MS = 4600;
const SEGMENT_COLORS = [
  "#8B0000",
  "#B22222",
  "#DC143C",
  "#C0392B",
  "#E67E22",
  "#A93226",
  "#CB4335",
  "#7B241C",
];

type StrategyCompassSectionProps = {
  eventSlug: string;
  token: string;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function topicsFingerprint(topics: BfsiTopic[]): string {
  return topics.map((topic) => topic.title.toLowerCase()).sort().join("|");
}

function normalizeTopics(topics: BfsiTopic[]): BfsiTopic[] {
  const unique: BfsiTopic[] = [];
  const seen = new Set<string>();
  for (const topic of topics) {
    const title = topic.title?.trim();
    const explanation = topic.explanation?.trim();
    if (!title || !explanation) {
      continue;
    }
    const key = title.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push({ title, explanation });
  }
  return unique;
}

function buildWheelTopics(
  sourceTopics: BfsiTopic[],
  previous: BfsiTopic[] = [],
): BfsiTopic[] {
  const targetCount = Math.min(SEGMENT_COUNT, FALLBACK_TOPIC_POOL.length);
  const normalizedSource = normalizeTopics(sourceTopics).slice(0, targetCount);
  const seen = new Set(normalizedSource.map((topic) => topic.title.toLowerCase()));
  const candidate = [...normalizedSource];

  for (const fallback of shuffle(FALLBACK_TOPIC_POOL)) {
    if (candidate.length >= targetCount) {
      break;
    }
    const key = fallback.title.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    candidate.push(fallback);
  }

  if (
    previous.length > 0 &&
    topicsFingerprint(candidate) === topicsFingerprint(previous)
  ) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const reshuffled = buildWheelTopics(shuffle(FALLBACK_TOPIC_POOL), []);
      if (topicsFingerprint(reshuffled) !== topicsFingerprint(previous)) {
        return reshuffled;
      }
    }
  }

  return candidate;
}

export default function StrategyCompassSection({
  eventSlug,
  token,
}: StrategyCompassSectionProps) {
  const [wheelTopics, setWheelTopics] = useState<BfsiTopic[]>(() =>
    buildWheelTopics(FALLBACK_TOPIC_POOL)
  );
  const [rotation, setRotation] = useState(0);
  const [spinsUsed, setSpinsUsed] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<BfsiTopic | null>(null);
  const spinTimeoutRef = useRef<number | null>(null);
  const wheelTopicsRef = useRef<BfsiTopic[]>(wheelTopics);
  const mountedRef = useRef(true);
  const fetchRequestIdRef = useRef(0);

  const spinsRemaining = Math.max(MAX_SPINS - spinsUsed, 0);
  const canSpin = !isSpinning && !isLoadingTopics && spinsRemaining > 0 && wheelTopics.length > 0;
  const segmentAngle = wheelTopics.length > 0 ? 360 / wheelTopics.length : 360;

  const wheelGradient = useMemo(() => {
    return `conic-gradient(${wheelTopics
      .map((_, index) => {
        const start = index * segmentAngle;
        const end = (index + 1) * segmentAngle;
        return `${SEGMENT_COLORS[index % SEGMENT_COLORS.length]} ${start}deg ${end}deg`;
      })
      .join(", ")})`;
  }, [wheelTopics, segmentAngle]);

  useEffect(() => {
    wheelTopicsRef.current = wheelTopics;
  }, [wheelTopics]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (spinTimeoutRef.current) {
        window.clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  const refreshWheelTopics = useCallback(async () => {
    const previousTopics = wheelTopicsRef.current;
    const requestId = fetchRequestIdRef.current + 1;
    fetchRequestIdRef.current = requestId;

    setIsLoadingTopics(true);

    if (!eventSlug || !token) {
      const fallbackTopics = buildWheelTopics(FALLBACK_TOPIC_POOL, previousTopics);
      if (mountedRef.current) {
        setWheelTopics(fallbackTopics);
        setIsLoadingTopics(false);
      }
      return;
    }

    try {
      const response = await eventsApi.getStrategyCompassTopics(eventSlug, token, SEGMENT_COUNT);
      const nextTopics = buildWheelTopics(response.topics, previousTopics);

      if (!mountedRef.current || fetchRequestIdRef.current !== requestId) {
        return;
      }

      setWheelTopics(nextTopics);
    } catch {
      if (!mountedRef.current || fetchRequestIdRef.current !== requestId) {
        return;
      }
      const fallbackTopics = buildWheelTopics(FALLBACK_TOPIC_POOL, previousTopics);
      setWheelTopics(fallbackTopics);
    } finally {
      if (mountedRef.current && fetchRequestIdRef.current === requestId) {
        setIsLoadingTopics(false);
      }
    }
  }, [eventSlug, token]);

  useEffect(() => {
    void refreshWheelTopics();
  }, [refreshWheelTopics]);

  const handleSpin = () => {
    if (!canSpin || wheelTopics.length === 0) {
      return;
    }

    const winnerIndex = Math.floor(Math.random() * wheelTopics.length);
    const winner = wheelTopics[winnerIndex];
    const turns = 5 + Math.floor(Math.random() * 2);
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const winningCenterAngle = winnerIndex * segmentAngle + segmentAngle / 2;
    const desiredNormalized = (360 - winningCenterAngle) % 360;
    const offset = (desiredNormalized - normalizedRotation + 360) % 360;
    const nextRotation = rotation + turns * 360 + offset;

    setIsSpinning(true);
    setRotation(nextRotation);

    if (spinTimeoutRef.current) {
      window.clearTimeout(spinTimeoutRef.current);
    }

    spinTimeoutRef.current = window.setTimeout(() => {
      setIsSpinning(false);
      setSpinsUsed((current) => current + 1);
      setSelectedTopic(winner);
      void refreshWheelTopics();
    }, SPIN_DURATION_MS + 140);
  };

  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          marginBottom: "18px",
        }}
      >
        <h2
          style={{
            color: "#8B0000",
            fontSize: "24px",
            fontWeight: 800,
            letterSpacing: "-0.3px",
          }}
        >
          Strategy Compass
        </h2>
        <p style={{ color: "#666", fontSize: "14px", lineHeight: 1.5 }}>
          Spin to explore AI use cases across BFSI.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            paddingTop: "14px",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "14px solid transparent",
              borderRight: "14px solid transparent",
              borderTop: "24px solid #111",
              zIndex: 5,
              filter: "drop-shadow(0 3px 2px rgba(0,0,0,0.25))",
            }}
          />

          <div
            style={{
              width: "min(78vw, 390px)",
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              border: "8px solid #fff",
              background: wheelGradient,
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning
                ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.16, 0.97, 0.3, 1)`
                : "none",
              boxShadow: "0 8px 26px rgba(0,0,0,0.22)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "33%",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.92)",
                border: "2px solid rgba(139,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                color: "#8B0000",
                textAlign: "center",
                padding: "10px",
                lineHeight: 1.3,
              }}
            >
              AI in BFSI
              <br />
              Spin Wheel
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ fontSize: "14px", color: "#444", fontWeight: 600 }}>
            Spins Remaining: {spinsRemaining}
          </p>

          <button
            type="button"
            onClick={handleSpin}
            disabled={!canSpin}
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "11px 16px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#fff",
              background: canSpin ? "linear-gradient(135deg, #8B0000, #DC143C)" : "#bfbfbf",
              cursor: canSpin ? "pointer" : "not-allowed",
              boxShadow: canSpin ? "0 8px 14px rgba(139,0,0,0.2)" : "none",
              transition: "all 0.2s ease",
            }}
          >
            {isSpinning
              ? "Spinning..."
              : isLoadingTopics
                ? "Loading Topics..."
                : spinsRemaining > 0
                  ? "Spin"
                  : "Spin Limit Reached"}
          </button>

          <div
            style={{
              border: "1px solid #eee",
              borderRadius: "12px",
              padding: "10px",
              background: "#fafafa",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <p style={{ fontSize: "12px", color: "#777", fontWeight: 600 }}>
              Current Wheel Topics
            </p>
            {wheelTopics.map((topic, index) => (
              <div
                key={topic.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#303030",
                }}
              >
                <span
                  style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
                    flexShrink: 0,
                  }}
                />
                <span>{topic.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTopic && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "min(500px, 100%)",
              borderRadius: "14px",
              background: "#fff",
              padding: "20px",
              boxShadow: "0 14px 32px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <p style={{ fontSize: "12px", color: "#8B0000", fontWeight: 700, letterSpacing: "0.06em" }}>
              SELECTED TOPIC
            </p>
            <h3 style={{ fontSize: "21px", color: "#111", lineHeight: 1.25 }}>{selectedTopic.title}</h3>
            <p style={{ color: "#4a4a4a", fontSize: "14px", lineHeight: 1.6 }}>{selectedTopic.explanation}</p>
            <div style={{ marginTop: "4px" }}>
              <button
                type="button"
                onClick={() => setSelectedTopic(null)}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#fff",
                  background: "#8B0000",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
