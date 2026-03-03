"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Award,
  BarChart3,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  ApiError,
  adminApi,
  eventsApi,
  pollsApi,
  qaApi,
  type Dashboard,
} from "@/lib/api";

type DashboardSectionProps = {
  eventSlug: string;
  eventId: string;
  token: string;
};

const DASHBOARD_POLL_VISIBLE_MS = 10_000;
const DASHBOARD_POLL_HIDDEN_MS = 30_000;

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function uniqueCount(values: string[]): number {
  return new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean)).size;
}

function toRgba(hex: string, alpha: number): string {
  const safeAlpha = Math.min(Math.max(alpha, 0), 1);
  const cleaned = hex.replace("#", "");
  const normalized =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : cleaned;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return `rgba(139,0,0,${safeAlpha})`;
  }

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
}

function toPercent(value: number, total: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

export default function DashboardSection({
  eventSlug,
  eventId,
  token,
}: DashboardSectionProps) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const refreshingRef = useRef(false);
  const usedDerivedFallbackRef = useRef(false);

  const buildFallbackDashboard = useCallback(async (): Promise<Dashboard> => {
    const [pollsResult, questionsResult, feedbackResult, attendanceResult] = await Promise.allSettled([
      pollsApi.getEventPolls(eventId, token),
      qaApi.getQuestions(eventId, token),
      adminApi.getFeedback(eventId, token),
      adminApi.getAttendance(eventId, token),
    ]);

    let totalPolls = 0;
    let totalVotes = 0;
    if (pollsResult.status === "fulfilled") {
      totalPolls = pollsResult.value.filter((poll) => poll.is_active).length;
      totalVotes = pollsResult.value.reduce(
        (sum, poll) => sum + poll.options.reduce((pollSum, option) => pollSum + option.vote_count, 0),
        0
      );
    }

    let totalQueries = 0;
    let topQueries: string[] = [];
    let liveUsers = 0;
    if (questionsResult.status === "fulfilled") {
      const questions = questionsResult.value.questions;
      totalQueries = questions.length;
      topQueries = questions.slice(0, 10).map((item) => item.question);
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      liveUsers = uniqueCount(
        questions
          .filter((item) => new Date(item.created_at).getTime() >= fiveMinutesAgo)
          .map((item) => item.user_name)
      );
    }

    let totalFeedback = 0;
    let averageRating = 0;
    if (feedbackResult.status === "fulfilled") {
      totalFeedback = feedbackResult.value.total;
      averageRating = feedbackResult.value.average_rating;
    }

    let totalRegistrations = 0;
    if (attendanceResult.status === "fulfilled") {
      totalRegistrations = attendanceResult.value.total;
    }

    return {
      total_registrations: totalRegistrations,
      live_concurrent_users: liveUsers,
      total_polls: totalPolls,
      total_votes: totalVotes,
      total_feedback: totalFeedback,
      average_rating: averageRating,
      total_queries: totalQueries,
      top_queries: topQueries,
    };
  }, [eventId, token]);

  const refreshDashboard = useCallback(async () => {
    if (!token || !eventId) {
      return;
    }
    if (refreshingRef.current) {
      return;
    }
    refreshingRef.current = true;

    try {
      const primaryData = eventSlug
        ? await eventsApi.getDashboard(eventSlug, token)
        : await adminApi.getDashboard(eventId, token);

      setDashboard(primaryData);
      setError(null);
      setLastUpdated(new Date());
      usedDerivedFallbackRef.current = false;
    } catch (primaryError) {
      // Backward-compatible fallback for environments missing /events/{slug}/dashboard.
      try {
        const fallbackData = await adminApi.getDashboard(eventId, token);
        setDashboard(fallbackData);
        setError(null);
        setLastUpdated(new Date());
        usedDerivedFallbackRef.current = false;
      } catch (fallbackError) {
        if (!usedDerivedFallbackRef.current) {
          try {
            const derivedData = await buildFallbackDashboard();
            setDashboard(derivedData);
            setLastUpdated(new Date());
            setError("Dashboard API unavailable. Showing live fallback metrics.");
            usedDerivedFallbackRef.current = true;
            return;
          } catch {
            // Continue to final error handling below.
          }
        }

        const message =
          fallbackError instanceof ApiError
            ? `Could not refresh live dashboard right now (${fallbackError.status}).`
            : "Could not refresh live dashboard right now.";
        setError(message);
        if (primaryError instanceof ApiError && primaryError.status === 403) {
          setError("Dashboard access denied for this event.");
        }
      }
    } finally {
      refreshingRef.current = false;
      setIsLoading(false);
    }
  }, [buildFallbackDashboard, eventId, eventSlug, token]);

  useEffect(() => {
    let timer: number | null = null;
    let active = true;

    const scheduleNext = () => {
      if (!active) return;
      const interval =
        document.visibilityState === "visible"
          ? DASHBOARD_POLL_VISIBLE_MS
          : DASHBOARD_POLL_HIDDEN_MS;
      timer = window.setTimeout(() => {
        void tick();
      }, interval);
    };

    const tick = async () => {
      if (!active) return;
      await refreshDashboard();
      scheduleNext();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshDashboard();
      }
    };

    void refreshDashboard();
    scheduleNext();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refreshDashboard]);

  const stats = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return [
      {
        label: "Registrations",
        value: formatNumber(dashboard.total_registrations),
        icon: Users,
        color: "#000000",
      },
      {
        label: "Live Users",
        value: formatNumber(dashboard.live_concurrent_users),
        icon: Activity,
        color: "#FE9727",
        badge: "Live",
      },
      {
        label: "Total Votes",
        value: formatNumber(dashboard.total_votes),
        icon: BarChart3,
        color: "#000000",
      },
      {
        label: "Avg Rating",
        value: Number.isFinite(dashboard.average_rating)
          ? dashboard.average_rating.toFixed(1)
          : "0.0",
        icon: Star,
        color: "#FE9727",
      },
      {
        label: "Feedback",
        value: formatNumber(dashboard.total_feedback),
        icon: MessageSquare,
        color: "#000000",
      },
      {
        label: "AI Queries",
        value: formatNumber(dashboard.total_queries),
        icon: TrendingUp,
        color: "#FE9727",
      },
      {
        label: "Active Polls",
        value: formatNumber(dashboard.total_polls),
        icon: Award,
        color: "#000000",
      },
    ];
  }, [dashboard]);

  const topQueries = useMemo(() => {
    if (!dashboard) return [];
    return Array.from(
      new Set(
        (dashboard.top_queries ?? [])
          .map((query) => query.trim())
          .filter(Boolean)
      )
    ).slice(0, 5);
  }, [dashboard]);

  const engagementSignals = useMemo(() => {
    if (!dashboard) return [];
    const totalRegistrations = Math.max(dashboard.total_registrations, 1);
    return [
      {
        label: "Live Presence",
        percent: toPercent(dashboard.live_concurrent_users, totalRegistrations),
        detail: `${formatNumber(dashboard.live_concurrent_users)} users currently active`,
      },
      {
        label: "Question Participation",
        percent: toPercent(dashboard.total_queries, totalRegistrations),
        detail: `${formatNumber(dashboard.total_queries)} session questions posted`,
      },
      {
        label: "Feedback Capture",
        percent: toPercent(dashboard.total_feedback, totalRegistrations),
        detail: `${formatNumber(dashboard.total_feedback)} attendees shared feedback`,
      },
      {
        label: "Voting Momentum",
        percent: toPercent(dashboard.total_votes, totalRegistrations),
        detail: `${formatNumber(dashboard.total_votes)} total votes recorded`,
      },
    ];
  }, [dashboard]);

  return (
    <section className="lobby-dashboard-shell">
      <style>{`
        .lobby-dashboard-shell {
          border-radius: 20px;
          border: 1px solid #ece3e3;
          background: #ffffff;
          box-shadow: 0 14px 34px rgba(139,0,0,0.08);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .lobby-dashboard-header {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .lobby-dashboard-title {
          font-size: 40px;
          line-height: 0.98;
          font-weight: 900;
          color: #000000;
          letter-spacing: -0.03em;
          margin: 0;
        }
        .lobby-dashboard-subtitle {
          font-size: 14px;
          color: #666;
          margin-top: 6px;
        }
        .lobby-dashboard-kicker {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid #f4d6dc;
          background: #fff4f7;
          font-size: 11px;
          font-weight: 700;
          color: #b11235;
          letter-spacing: 0.02em;
          margin-bottom: 8px;
        }
        .lobby-dashboard-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .lobby-dashboard-refresh-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          border: 1px solid #f1d1d1;
          background: #fff5f5;
          padding: 6px 10px;
          color: #000000;
          font-size: 12px;
          font-weight: 700;
        }
        .lobby-dashboard-refresh-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #16a34a;
          box-shadow: 0 0 0 4px rgba(22,163,74,0.14);
        }
        .lobby-dashboard-updated {
          font-size: 12px;
          color: #8a8a8a;
          font-weight: 500;
        }
        .lobby-dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(188px, 1fr));
          gap: 12px;
        }
        .lobby-dashboard-card {
          position: relative;
          border-radius: 16px;
          padding: 14px 14px 12px;
          border: 1px solid #eee;
          overflow: hidden;
          min-height: 132px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .lobby-dashboard-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(139,0,0,0.12);
        }
        .lobby-dashboard-card-halo {
          position: absolute;
          top: -18px;
          right: -20px;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          pointer-events: none;
        }
        .lobby-dashboard-card-badge {
          position: absolute;
          right: 12px;
          top: 12px;
          border-radius: 999px;
          background: rgba(22,163,74,0.13);
          color: #15803d;
          border: 1px solid rgba(22,163,74,0.24);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.02em;
          padding: 4px 7px;
        }
        .lobby-dashboard-card-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }
        .lobby-dashboard-card-value {
          margin: 0;
          font-size: 50px;
          line-height: 0.96;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: #000000;
        }
        .lobby-dashboard-card-label {
          margin-top: 6px;
          color: #5f5f5f;
          font-size: 14px;
          font-weight: 600;
        }
        .lobby-dashboard-lower {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .lobby-dashboard-panel {
          border-radius: 16px;
          border: 1px solid #ececec;
          background: #fff;
          padding: 14px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
        }
        .lobby-dashboard-panel-title {
          margin: 0;
          font-size: 15px;
          font-weight: 800;
          color: #191919;
        }
        .lobby-dashboard-panel-subtitle {
          margin-top: 4px;
          font-size: 12px;
          color: #7a7a7a;
        }
        .lobby-dashboard-query-list {
          margin: 12px 0 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .lobby-dashboard-query-item {
          display: grid;
          grid-template-columns: 24px 1fr;
          align-items: start;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          background: linear-gradient(135deg, #fff8f8 0%, #fff 100%);
          border: 1px solid #f4e4e4;
        }
        .lobby-dashboard-query-index {
          width: 24px;
          height: 24px;
          border-radius: 8px;
          background: "#FE9727";
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }
        .lobby-dashboard-query-text {
          font-size: 13px;
          color: #383838;
          line-height: 1.45;
          margin-top: 2px;
          word-break: break-word;
        }
        .lobby-dashboard-empty {
          margin-top: 12px;
          font-size: 13px;
          color: #8b8b8b;
          padding: 10px;
          border-radius: 10px;
          background: #fafafa;
          border: 1px dashed #ececec;
        }
        .lobby-dashboard-signal-list {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .lobby-dashboard-signal-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 6px;
        }
        .lobby-dashboard-signal-label {
          font-size: 13px;
          color: #2f2f2f;
          font-weight: 700;
        }
        .lobby-dashboard-signal-percent {
          font-size: 12px;
          font-weight: 800;
          color: #000000;
        }
        .lobby-dashboard-signal-track {
          height: 8px;
          border-radius: 999px;
          background: #f4f4f4;
          overflow: hidden;
          border: 1px solid #ededed;
        }
        .lobby-dashboard-signal-fill {
          height: 100%;
          border-radius: 999px;
          background: "#FE9727";
        }
        .lobby-dashboard-signal-detail {
          margin-top: 5px;
          font-size: 11px;
          color: #7a7a7a;
        }
        .lobby-dashboard-error {
          margin-top: 12px;
          border-radius: 10px;
          background: #fff7f7;
          border: 1px solid #ffd8d8;
          padding: 8px 10px;
          color: #9f1239;
          font-size: 12px;
          font-weight: 600;
        }
        @media (max-width: 980px) {
          .lobby-dashboard-lower {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .lobby-dashboard-shell {
            padding: 16px;
          }
          .lobby-dashboard-title {
            font-size: 32px;
          }
          .lobby-dashboard-card-value {
            font-size: 42px;
          }
        }
      `}</style>
      <div
        className="lobby-dashboard-header"
      >
        <div>
          <span className="lobby-dashboard-kicker">Live Command Center</span>
          <h2 className="lobby-dashboard-title">Dashboard</h2>
          <p className="lobby-dashboard-subtitle">
            Live engagement snapshot for this event.
          </p>
        </div>

        <div className="lobby-dashboard-header-right">
          <div className="lobby-dashboard-refresh-pill">
            <span className="lobby-dashboard-refresh-dot" />
            Auto-refresh 10s
          </div>
          {lastUpdated && (
            <span className="lobby-dashboard-updated">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {isLoading && !dashboard ? (
        <div style={{ fontSize: "14px", color: "#777" }}>Loading dashboard metrics...</div>
      ) : (
        <>
          <div className="lobby-dashboard-grid">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <article
                  key={stat.label}
                  className="lobby-dashboard-card"
                  style={{
                    borderColor: toRgba(stat.color, 0.26),
                    background: "#ffffff",
                  }}
                >
                  {stat.badge && (
                    <span className="lobby-dashboard-card-badge">
                      {stat.badge}
                    </span>
                  )}

                  <div
                    className="lobby-dashboard-card-icon"
                    style={{
                      background: toRgba(stat.color, 0.14),
                      border: `1px solid ${toRgba(stat.color, 0.24)}`,
                    }}
                  >
                    <Icon
                      style={{
                        width: "19px",
                        height: "19px",
                        color: stat.color,
                      }}
                    />
                  </div>
                  <p className="lobby-dashboard-card-value" style={{ color: "#000000" }}>{stat.value}</p>
                  <p className="lobby-dashboard-card-label">{stat.label}</p>
                </article>
              );
            })}
          </div>

          <div className="lobby-dashboard-lower">            <article className="lobby-dashboard-panel">
              <h3 className="lobby-dashboard-panel-title">Engagement Signals</h3>
              <p className="lobby-dashboard-panel-subtitle">
                Real-time participation intensity across the event.
              </p>
              <div className="lobby-dashboard-signal-list">
                {engagementSignals.map((signal) => (
                  <div key={signal.label}>
                    <div className="lobby-dashboard-signal-row">
                      <span className="lobby-dashboard-signal-label">{signal.label}</span>
                      <span className="lobby-dashboard-signal-percent">{signal.percent}%</span>
                    </div>
                    <div className="lobby-dashboard-signal-track">
                      <div
                        className="lobby-dashboard-signal-fill"
                        style={{ width: `${signal.percent}%` }}
                      />
                    </div>
                    <p className="lobby-dashboard-signal-detail">{signal.detail}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </>
      )}

      {error && (
        <div className="lobby-dashboard-error">
          {error}
        </div>
      )}
    </section>
  );
}
