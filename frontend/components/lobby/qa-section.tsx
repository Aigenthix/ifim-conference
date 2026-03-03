"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock3,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { qaApi, type QAQuestionItem, type QASessionItem } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

type DayLabel = "Day 1" | "Day 2";

const FALLBACK_QA_SESSIONS: QASessionItem[] = [
  {
    id: "fallback-day1-1",
    title: "Next Big Thing 2030",
    speaker_name: "Hitesh Mali",
    day: "Day 1",
    day_number: 1,
    time_range: "07:00 – 08:00 PM",
    display_order: 1,
  },
  {
    id: "fallback-day2-1",
    title: "Progress Through Process",
    speaker_name: "Nikhil Naik",
    day: "Day 2",
    day_number: 2,
    time_range: "10:00 – 10:45 AM",
    display_order: 1,
  },
  {
    id: "fallback-day2-2",
    title: "Future In Focus",
    speaker_name: "Siddharth Karnawat",
    day: "Day 2",
    day_number: 2,
    time_range: "11:00 – 11:45 AM",
    display_order: 2,
  },
  {
    id: "fallback-day2-3",
    title: "Book Journey - The Ideal Entrepreneur",
    speaker_name: "Rahul Agarwal",
    day: "Day 2",
    day_number: 2,
    time_range: "12:15 – 01:00 PM",
    display_order: 3,
  },
  {
    id: "fallback-day2-4",
    title: "The Powerful Comeback",
    speaker_name: "Hitesh Mali",
    day: "Day 2",
    day_number: 2,
    time_range: "02:15 – 02:30 PM",
    display_order: 4,
  },
  {
    id: "fallback-day2-5",
    title: "Succession Plan for Financial Distributors",
    speaker_name: "Jatin Popat",
    day: "Day 2",
    day_number: 2,
    time_range: "02:30 – 03:15 PM",
    display_order: 5,
  },
  {
    id: "fallback-day2-6",
    title: "From Insight to Action",
    speaker_name: "Hitesh Mali",
    day: "Day 2",
    day_number: 2,
    time_range: "03:45 – 04:45 PM",
    display_order: 6,
  },
];

const QUESTION_MIN = 1;
const QUESTION_MAX = 280;
const POLL_INTERVAL_MS = 5_000;

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatTimestamp(dateStr: string): string {
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function QASection({ eventId }: { eventId: string }) {
  const token = useAuthStore((s) => s.token) ?? "";
  const userName = useAuthStore((s) => s.userName) ?? "You";

  const [sessions, setSessions] = useState<QASessionItem[]>([]);
  const [activeDay, setActiveDay] = useState<DayLabel>("Day 1");
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [questions, setQuestions] = useState<QAQuestionItem[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const latestQuestionAtRef = useRef<string | null>(null);

  const trimmedQuestion = newQuestion.trim();

  const fetchSessions = useCallback(async () => {
    if (!token) return;
    setLoadingSessions(true);

    try {
      const data = await qaApi.getSessions(eventId, token);
      const sorted = [...data.sessions].sort((a, b) =>
        a.day_number === b.day_number
          ? a.display_order - b.display_order
          : a.day_number - b.day_number
      );

      if (sorted.length === 0) {
        setSessions(FALLBACK_QA_SESSIONS);
        setStatusMessage("Live session mapping is empty. Showing default schedule.");
      } else {
        setSessions(sorted);
      }
    } catch {
      setSessions(FALLBACK_QA_SESSIONS);
      setStatusMessage("Could not sync live sessions. Showing default schedule only.");
    } finally {
      setLoadingSessions(false);
    }
  }, [eventId, token]);

  const fetchQuestions = useCallback(async () => {
    if (!token) return;

    try {
      const data = await qaApi.getQuestions(eventId, token, {
        after: latestQuestionAtRef.current ?? undefined,
        limit: 250,
      });

      const incoming = data.questions ?? [];
      if (incoming.length > 0) {
        setQuestions((previous) => {
          const mergedMap = new Map<string, QAQuestionItem>(
            previous.map((item) => [item.id, item])
          );
          incoming.forEach((item) => {
            mergedMap.set(item.id, item);
          });
          return Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });

        latestQuestionAtRef.current = incoming.reduce((latest, item) => {
          const latestTs = new Date(latest).getTime();
          const itemTs = new Date(item.created_at).getTime();
          return Number.isFinite(itemTs) && itemTs > latestTs ? item.created_at : latest;
        }, latestQuestionAtRef.current ?? incoming[0].created_at);
      }
    } catch {
      setStatusMessage("Could not refresh Q&A right now.");
    } finally {
      setLoadingQuestions(false);
    }
  }, [eventId, token]);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    latestQuestionAtRef.current = null;
    void fetchQuestions();
    let timer: number | null = null;
    let active = true;

    const scheduleNext = () => {
      if (!active) return;
      timer = window.setTimeout(() => {
        void tick();
      }, POLL_INTERVAL_MS);
    };

    const tick = async () => {
      if (!active) return;
      if (document.visibilityState === "visible") {
        await fetchQuestions();
      }
      scheduleNext();
    };

    scheduleNext();
    return () => {
      active = false;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [fetchQuestions]);

  const dayOptions = useMemo(() => {
    const available = new Set<DayLabel>();
    sessions.forEach((session) => {
      if (session.day === "Day 1" || session.day === "Day 2") {
        available.add(session.day);
      }
    });
    if (available.size === 0) {
      return ["Day 1", "Day 2"] as DayLabel[];
    }
    return (["Day 1", "Day 2"] as DayLabel[]).filter((day) => available.has(day));
  }, [sessions]);

  useEffect(() => {
    if (!dayOptions.includes(activeDay)) {
      setActiveDay(dayOptions[0] ?? "Day 1");
    }
  }, [activeDay, dayOptions]);

  const sessionsForDay = useMemo(
    () =>
      sessions
        .filter((session) => session.day === activeDay)
        .sort((a, b) => a.display_order - b.display_order),
    [activeDay, sessions]
  );

  useEffect(() => {
    if (sessionsForDay.length === 0) {
      setActiveSessionId("");
      return;
    }
    if (!sessionsForDay.some((session) => session.id === activeSessionId)) {
      setActiveSessionId(sessionsForDay[0].id);
    }
  }, [activeSessionId, sessionsForDay]);

  const resolvedSessionId = activeSessionId || sessionsForDay[0]?.id || "";
  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === resolvedSessionId),
    [resolvedSessionId, sessions]
  );

  const threadQuestions = useMemo(() => {
    if (!resolvedSessionId) return [];
    return questions.filter((question) => question.session_id === resolvedSessionId);
  }, [resolvedSessionId, questions]);

  const questionsCountBySession = useMemo(() => {
    const map = new Map<string, number>();
    questions.forEach((question) => {
      map.set(question.session_id, (map.get(question.session_id) ?? 0) + 1);
    });
    return map;
  }, [questions]);

  const canAsk =
    !sending &&
    Boolean(resolvedSessionId) &&
    trimmedQuestion.length > 0 &&
    trimmedQuestion.length <= QUESTION_MAX;

  const handleAsk = async () => {
    if (!canAsk) {
      if (!resolvedSessionId) {
        setStatusMessage("Select a session before asking your question.");
      } else if (trimmedQuestion.length === 0) {
        setStatusMessage("Question cannot be empty.");
      } else {
        setStatusMessage(`Question must be ${QUESTION_MIN}-${QUESTION_MAX} characters.`);
      }
      return;
    }

    setSending(true);
    setStatusMessage(null);

    try {
      const question = await qaApi.ask(
        {
          event_id: eventId,
          session_id: resolvedSessionId,
          question: trimmedQuestion,
        },
        token
      );
      setQuestions((previous) => [question, ...previous]);
      if (!activeSessionId) {
        setActiveSessionId(resolvedSessionId);
      }
      latestQuestionAtRef.current = question.created_at;
      setNewQuestion("");
      setStatusMessage("Posted to live session thread.");

      window.setTimeout(() => {
        void fetchQuestions();
      }, 350);
    } catch {
      setStatusMessage("Could not submit question. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section>
      <style>{`
        .qa-day-row,
        .qa-session-row {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .qa-day-row::-webkit-scrollbar,
        .qa-session-row::-webkit-scrollbar { display: none; }
        .qa-day-pill {
          border: 1px solid #ececec;
          background: #fff;
          border-radius: 999px;
          padding: 9px 16px;
          min-width: max-content;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 13px;
          font-weight: 700;
        }
        .qa-session-pill {
          border: 1px solid #ececec;
          background: #fff;
          border-radius: 12px;
          min-width: 250px;
          padding: 10px 12px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .qa-compose-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: end;
        }
        @media (max-width: 900px) {
          .qa-session-pill {
            min-width: 230px;
          }
        }
        @media (max-width: 768px) {
          .qa-compose-grid {
            grid-template-columns: 1fr;
          }
          .qa-session-pill {
            min-width: 210px;
          }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "14px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "#FE9727",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(139,0,0,0.18)",
            }}
          >
            <MessageSquare style={{ width: "20px", height: "20px", color: "#fff" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "30px", lineHeight: 1.1, fontWeight: 800, color: "#111" }}>Q&A</h2>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "3px" }}>
              Live session-wise questions with instant visibility for everyone.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: "999px",
              padding: "6px 12px",
              background: "#fff",
              fontSize: "12px",
              color: "#444",
              fontWeight: 600,
            }}
          >
            {threadQuestions.length} Questions
          </div>
          <div
            style={{
              border: "1px solid #ececec",
              borderRadius: "999px",
              padding: "6px 12px",
              background: "#fff",
              fontSize: "12px",
              color: "#444",
              fontWeight: 600,
              maxWidth: "290px",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
            title={selectedSession ? `${selectedSession.time_range} · ${selectedSession.title}` : "Select a session"}
          >
            {selectedSession ? `${selectedSession.time_range} · ${selectedSession.title}` : "Select a session"}
          </div>
          <div
            style={{
              border: "1px solid #f1d1d1",
              borderRadius: "999px",
              padding: "6px 12px",
              background: "#fff5f5",
              fontSize: "12px",
              color: "#000000",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 0 4px rgba(34,197,94,0.15)",
              }}
            />
            Live {Math.round(POLL_INTERVAL_MS / 1000)}s
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #ececec",
          borderRadius: "14px",
          padding: "10px",
          marginBottom: "12px",
        }}
      >
        <div className="qa-day-row">
          {dayOptions.map((day) => {
            const isActive = day === activeDay;
            return (
              <button
                key={day}
                type="button"
                className="qa-day-pill"
                onClick={() => setActiveDay(day)}
                style={{
                  borderColor: isActive ? "#de3755" : "#ececec",
                  background: isActive ? "#FE9727" : "#fff",
                  color: isActive ? "#fff" : "#444",
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #ececec",
          borderRadius: "14px",
          padding: "10px",
          marginBottom: "14px",
        }}
      >
        <div className="qa-session-row">
          {sessionsForDay.map((session) => {
            const isActive = session.id === activeSessionId;
            const count = questionsCountBySession.get(session.id) ?? 0;
            return (
              <button
                key={session.id}
                type="button"
                className="qa-session-pill"
                onClick={() => {
                  setActiveSessionId(session.id);
                  setStatusMessage(null);
                }}
                style={{
                  borderColor: isActive ? "#de3755" : "#ececec",
                  background: isActive ? "#fff5f7" : "#fff",
                  boxShadow: isActive ? "0 6px 16px rgba(220,20,60,0.08)" : "none",
                }}
              >
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#9a9a9a", marginBottom: "4px" }}>
                  {session.time_range}
                </p>
                <p style={{ fontSize: "14px", lineHeight: 1.35, fontWeight: 700, color: "#1d1d1d" }}>
                  {session.title}
                </p>
                <div
                  style={{
                    marginTop: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#666", fontWeight: 500 }}>
                    {session.speaker_name}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#7a7a7a",
                      borderRadius: "999px",
                      padding: "3px 8px",
                      border: "1px solid #ececec",
                      background: "#fff",
                    }}
                  >
                    {count} Q
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #ececec",
          borderRadius: "16px",
          padding: "14px",
          marginBottom: "16px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
        }}
      >
        <div className="qa-compose-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <textarea
              value={newQuestion}
              onChange={(event) => setNewQuestion(event.target.value.slice(0, QUESTION_MAX))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleAsk();
                }
              }}
              placeholder="Ask your question for the selected session. Press Enter to send."
              rows={3}
              style={{
                width: "100%",
                border: "1px solid #ececec",
                borderRadius: "12px",
                outline: "none",
                resize: "vertical",
                minHeight: "88px",
                fontSize: "14px",
                color: "#222",
                lineHeight: 1.5,
                padding: "12px",
                background: "#fff",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#666", fontSize: "12px" }}>
                <Sparkles style={{ width: "14px", height: "14px", color: "#000000" }} />
                <span>
                  Asking as <strong style={{ color: "#000000" }}>{userName}</strong>
                  {selectedSession ? ` · ${selectedSession.time_range} · ${selectedSession.title}` : ""}
                </span>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color:
                    trimmedQuestion.length > QUESTION_MAX
                      ? "#b91c1c"
                      : trimmedQuestion.length >= QUESTION_MIN
                        ? "#166534"
                        : "#777",
                }}
              >
                {trimmedQuestion.length}/{QUESTION_MAX}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleAsk()}
            disabled={!canAsk}
            style={{
              height: "46px",
              border: "none",
              borderRadius: "12px",
              padding: "0 16px",
              cursor: canAsk ? "pointer" : "not-allowed",
              background: canAsk ? "#FE9727" : "#e6e6e6",
              color: canAsk ? "#fff" : "#9a9a9a",
              fontSize: "14px",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              minWidth: "130px",
            }}
          >
            {sending ? (
              <>
                <Loader2 style={{ width: "16px", height: "16px", animation: "spin 0.8s linear infinite" }} />
                Sending
              </>
            ) : (
              <>
                Ask Question
                <Send style={{ width: "15px", height: "15px" }} />
              </>
            )}
          </button>
        </div>

        {loadingSessions && (
          <div style={{ marginTop: "8px", fontSize: "12px", color: "#777" }}>
            Syncing Day 1 and Day 2 sessions...
          </div>
        )}
      </div>

      {statusMessage && (
        <div
          style={{
            marginBottom: "12px",
            borderRadius: "10px",
            border: "1px solid #f0e6c7",
            background: "#fffaf0",
            color: "#765400",
            padding: "9px 12px",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {statusMessage}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {loadingQuestions ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`qa-skeleton-${index}`}
              style={{
                background: "#fff",
                border: "1px solid #efefef",
                borderRadius: "14px",
                padding: "14px",
              }}
            >
              <div style={{ width: "42%", height: "11px", background: "#f2f2f2", borderRadius: "6px", marginBottom: "10px" }} />
              <div style={{ width: "92%", height: "10px", background: "#f4f4f4", borderRadius: "6px", marginBottom: "8px" }} />
              <div style={{ width: "70%", height: "10px", background: "#f4f4f4", borderRadius: "6px" }} />
            </div>
          ))
        ) : threadQuestions.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "56px 20px",
              background: "#fff",
              borderRadius: "16px",
              border: "1px solid #ececec",
            }}
          >
            <MessageSquare style={{ width: "38px", height: "38px", color: "#d2d2d2", marginBottom: "12px" }} />
            <p style={{ color: "#666", fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>
              No questions yet in this session
            </p>
            <p style={{ color: "#9a9a9a", fontSize: "13px" }}>
              Ask first and everyone on this thread will see it live.
            </p>
          </div>
        ) : (
          threadQuestions.map((question, index) => {
            return (
              <motion.article
                key={question.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: "14px",
                  border: "1px solid #efefef",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: "13px", color: "#000000" }}>{question.user_name}</span>
                    <span style={{ fontSize: "11px", color: "#7d7d7d" }}>
                      <Clock3 style={{ width: "11px", height: "11px", display: "inline-block", marginRight: "4px", transform: "translateY(1px)" }} />
                      {formatTimestamp(question.created_at)} ({getRelativeTime(question.created_at)})
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: "14px", color: "#2d2d2d", lineHeight: 1.65, margin: 0 }}>{question.question}</p>
              </motion.article>
            );
          })
        )}
      </div>
    </section>
  );
}
