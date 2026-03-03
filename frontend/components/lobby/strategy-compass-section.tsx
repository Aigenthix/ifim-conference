"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { eventsApi, type StrategyCompassTopic } from "@/lib/api";

type BfsiTopic = {
  title: string;
  explanation: string;
  how_it_works: string;
  business_impact: string;
  implementation_steps: string[];
  kpis: string[];
};

const FALLBACK_TOPIC_POOL: StrategyCompassTopic[] = [
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
  "#000000",
  "#FE9727",
  "#FE9727",
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

function normalizeTextList(
  input: string[] | undefined,
  fallback: string[],
): string[] {
  if (!Array.isArray(input)) {
    return fallback;
  }

  const cleaned = input
    .map((value) => String(value).trim())
    .filter((value, index, arr) => value.length > 0 && arr.indexOf(value) === index);

  return cleaned.length >= 3 ? cleaned.slice(0, 5) : fallback;
}

function buildDefaultHowItWorks(title: string, explanation: string): string {
  return `${explanation} The workflow combines historical data, real-time signals, and policy rules to guide teams with human approvals for high-risk cases.`;
}

function buildDefaultBusinessImpact(title: string): string {
  return `${title} reduces manual effort, improves decision consistency, and accelerates response times across BFSI operations. It typically increases conversion, recovery, or fraud-control performance with clearer risk visibility.`;
}

function buildDefaultImplementationSteps(title: string): string[] {
  const lowered = title.toLowerCase();
  return [
    `Define the ${lowered} use case, owners, and baseline metrics.`,
    "Consolidate clean historical data and validate model quality with domain experts.",
    "Pilot in one business unit with human-in-the-loop review before full rollout.",
  ];
}

function buildDefaultKpis(): string[] {
  return [
    "Turnaround time reduction (%)",
    "Accuracy or error-rate improvement (%)",
    "Cost-to-serve per case",
  ];
}

function toDetailedTopic(topic: StrategyCompassTopic): BfsiTopic | null {
  const title = topic.title?.trim();
  const explanation = topic.explanation?.trim();
  if (!title || !explanation) {
    return null;
  }

  const implementationStepsFallback = buildDefaultImplementationSteps(title);
  return {
    title,
    explanation,
    how_it_works: topic.how_it_works?.trim() || buildDefaultHowItWorks(title, explanation),
    business_impact: topic.business_impact?.trim() || buildDefaultBusinessImpact(title),
    implementation_steps: normalizeTextList(
      topic.implementation_steps,
      implementationStepsFallback,
    ),
    kpis: normalizeTextList(topic.kpis, buildDefaultKpis()),
  };
}

function normalizeTopics(topics: StrategyCompassTopic[]): BfsiTopic[] {
  const unique: BfsiTopic[] = [];
  const seen = new Set<string>();
  for (const topic of topics) {
    const detailed = toDetailedTopic(topic);
    if (!detailed) {
      continue;
    }
    const key = detailed.title.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(detailed);
  }
  return unique;
}

const DETAILED_FALLBACK_TOPICS = normalizeTopics(FALLBACK_TOPIC_POOL);

function buildWheelTopics(
  sourceTopics: BfsiTopic[],
  previous: BfsiTopic[] = [],
): BfsiTopic[] {
  const targetCount = Math.min(SEGMENT_COUNT, DETAILED_FALLBACK_TOPICS.length);
  const normalizedSource = sourceTopics.slice(0, targetCount);
  const seen = new Set(normalizedSource.map((topic) => topic.title.toLowerCase()));
  const candidate = [...normalizedSource];

  for (const fallback of shuffle(DETAILED_FALLBACK_TOPICS)) {
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
      const reshuffled = buildWheelTopics(shuffle(DETAILED_FALLBACK_TOPICS), []);
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
    buildWheelTopics(DETAILED_FALLBACK_TOPICS)
  );
  const [rotation, setRotation] = useState(0);
  const [spinsUsed, setSpinsUsed] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<BfsiTopic | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
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
    const media = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobileView(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  const wheelSize = isMobileView ? "min(92vw, 360px)" : "min(78vw, 400px)";
  const centerInset = isMobileView ? "37%" : "34%";
  const pointerTop = isMobileView ? "4px" : "2px";
  const labelLeft = isMobileView ? "31%" : "34%";
  const labelTop = isMobileView ? "-16px" : "-18px";
  const labelWidth = isMobileView ? "64%" : "58%";
  const labelMaxWidth = isMobileView ? "112px" : "124px";
  const labelFont = isMobileView
    ? "clamp(8.6px, 2.15vw, 10px)"
    : "clamp(8.6px, 1.1vw, 11px)";

  const formatWheelLabel = useCallback(
    (title: string): string => {
      const normalized = title.replace(/\s+/g, " ").trim();
      const words = normalized.split(" ");
      const maxCharsPerLine = isMobileView ? 13 : 15;
      const maxLines = 2;
      const lines: string[] = [];
      let current = "";

      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (candidate.length <= maxCharsPerLine || !current) {
          current = candidate;
          continue;
        }
        lines.push(current);
        current = word;
        if (lines.length === maxLines - 1) {
          break;
        }
      }

      if (current && lines.length < maxLines) {
        lines.push(current);
      }

      if (lines.length === 0) {
        return normalized;
      }

      if (lines.length < maxLines) {
        return lines.join("\n");
      }

      const usedWords = lines.join(" ").split(" ").length;
      if (usedWords < words.length) {
        const truncated = lines[maxLines - 1];
        lines[maxLines - 1] =
          truncated.length >= maxCharsPerLine
            ? `${truncated.slice(0, maxCharsPerLine - 1)}…`
            : `${truncated}…`;
      }
      return lines.join("\n");
    },
    [isMobileView]
  );

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
      const fallbackTopics = buildWheelTopics(DETAILED_FALLBACK_TOPICS, previousTopics);
      if (mountedRef.current) {
        setWheelTopics(fallbackTopics);
        setIsLoadingTopics(false);
      }
      return;
    }

    try {
      const response = await eventsApi.getStrategyCompassTopics(eventSlug, token, SEGMENT_COUNT);
      const nextTopics = buildWheelTopics(normalizeTopics(response.topics), previousTopics);

      if (!mountedRef.current || fetchRequestIdRef.current !== requestId) {
        return;
      }

      setWheelTopics(nextTopics);
    } catch {
      if (!mountedRef.current || fetchRequestIdRef.current !== requestId) {
        return;
      }
      const fallbackTopics = buildWheelTopics(DETAILED_FALLBACK_TOPICS, previousTopics);
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
            color: "#000000",
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
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: isMobileView ? "30px" : "26px",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: pointerTop,
              left: "50%",
              transform: "translateX(-50%)",
              width: "30px",
              height: "22px",
              background: "#111",
              clipPath: "polygon(50% 100%, 0 0, 100% 0)",
              zIndex: 8,
              filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))",
            }}
          />

          <div
            style={{
              width: wheelSize,
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              border: "8px solid #f8f8f8",
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
            {/* Segment labels inside wheel */}
            {wheelTopics.map((topic, index) => {
              const midAngle = index * segmentAngle + segmentAngle / 2;
              return (
                <div
                  key={`${topic.title}-${index}`}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "50%",
                    height: "0",
                    transformOrigin: "0 0",
                    transform: `rotate(${midAngle - 90}deg)`,
                    pointerEvents: "none",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "30%",
                      top: "0px",
                      width: "60%",
                      maxWidth: labelMaxWidth,
                      transform: "translateY(-50%)",
                      color: "rgba(255,255,255,0.98)",
                      fontSize: labelFont,
                      fontWeight: 700,
                      lineHeight: 1.1,
                      textAlign: "center",
                      whiteSpace: "pre-line",
                      letterSpacing: "0.01em",
                      textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                      wordBreak: "break-word",
                    }}
                  >
                    {formatWheelLabel(topic.title)}
                  </span>
                </div>
              );
            })}

            <div
              style={{
                position: "absolute",
                inset: centerInset,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.92)",
                border: "2px solid rgba(139,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                color: "#000000",
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
              background: canSpin ? "#FE9727" : "#bfbfbf",
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
              width: "min(760px, 100%)",
              maxHeight: "84vh",
              overflowY: "auto",
              borderRadius: "14px",
              background: "#fff",
              padding: "20px",
              boxShadow: "0 14px 32px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <p style={{ fontSize: "12px", color: "#000000", fontWeight: 700, letterSpacing: "0.06em" }}>
              SELECTED TOPIC
            </p>
            <h3 style={{ fontSize: "24px", color: "#111", lineHeight: 1.25 }}>{selectedTopic.title}</h3>
            <p style={{ color: "#4a4a4a", fontSize: "15px", lineHeight: 1.7 }}>{selectedTopic.explanation}</p>

            <div style={{ borderTop: "1px solid #eee", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <p style={{ fontSize: "12px", color: "#000000", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "4px" }}>
                  HOW IT WORKS
                </p>
                <p style={{ color: "#333", fontSize: "14px", lineHeight: 1.65 }}>
                  {selectedTopic.how_it_works}
                </p>
              </div>

              <div>
                <p style={{ fontSize: "12px", color: "#000000", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "4px" }}>
                  BUSINESS IMPACT
                </p>
                <p style={{ color: "#333", fontSize: "14px", lineHeight: 1.65 }}>
                  {selectedTopic.business_impact}
                </p>
              </div>

              <div>
                <p style={{ fontSize: "12px", color: "#000000", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "4px" }}>
                  IMPLEMENTATION PLAYBOOK
                </p>
                <ol style={{ margin: 0, paddingLeft: "18px", color: "#333", fontSize: "14px", lineHeight: 1.65 }}>
                  {selectedTopic.implementation_steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <p style={{ fontSize: "12px", color: "#000000", fontWeight: 700, letterSpacing: "0.05em", marginBottom: "6px" }}>
                  KPIS TO TRACK
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {selectedTopic.kpis.map((kpi) => (
                    <span
                      key={kpi}
                      style={{
                        border: "1px solid #efc7c7",
                        borderRadius: "999px",
                        background: "#fff5f5",
                        color: "#7f1d1d",
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "6px 10px",
                      }}
                    >
                      {kpi}
                    </span>
                  ))}
                </div>
              </div>
            </div>

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
                  background: "#000000",
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
