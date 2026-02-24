"use client";

import { useEffect, useMemo, useCallback, useState, useRef, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { BarChart3, Check, ChevronLeft, ChevronRight, Timer } from "lucide-react";
import { pollsApi } from "@/lib/api";
import { createPollSocket } from "@/lib/websocket";
import { usePollStore } from "@/store/polls";
import { useAuthStore } from "@/store/auth";

const ROTATION_INTERVAL = 10 * 60 * 1000; // 10 minutes
const REFETCH_INTERVAL = 5 * 1000; // 5 seconds for live updates

export default function LivePolls({ eventId }: { eventId: string }) {
  const token = useAuthStore((s) => s.token) ?? "";
  const { polls, setPolls, updatePollVotes } = usePollStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROTATION_INTERVAL);
  const manualOverride = useRef(false);
  const manualTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch polls with auto-refetch every 5s for real-time
  const { data, isLoading } = useQuery({
    queryKey: ["polls", eventId],
    queryFn: () => pollsApi.getEventPolls(eventId, token),
    enabled: !!eventId,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: 2_000,
  });

  useEffect(() => { if (data) setPolls(data); }, [data, setPolls]);

  // WebSocket for instant updates
  useEffect(() => {
    if (!token || !eventId) return;
    const ws = createPollSocket(eventId, token);
    ws.connect();
    const unsub = ws.on("poll_update", (msg) => {
      if (msg.poll_id && msg.votes) updatePollVotes(msg.poll_id, msg.votes as Record<string, number>);
    });
    return () => { unsub(); ws.disconnect(); };
  }, [eventId, token, updatePollVotes]);

  // Auto-rotate polls every 10 minutes — persisted timer
  useEffect(() => {
    if (polls.length <= 1) return;

    const rotationStart = usePollStore.getState().rotationStartTime;

    const tick = () => {
      const elapsed = Date.now() - rotationStart;
      const cyclePosition = elapsed % ROTATION_INTERVAL;
      const remaining = ROTATION_INTERVAL - cyclePosition;
      setTimeLeft(remaining);

      // Only auto-rotate if user hasn't manually navigated recently
      if (!manualOverride.current) {
        const targetIndex = Math.floor(elapsed / ROTATION_INTERVAL) % polls.length;
        setCurrentIndex(targetIndex);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [polls.length]);

  // Manual navigation — temporarily disables auto-rotation
  const navigate = (direction: "next" | "prev" | number) => {
    manualOverride.current = true;
    if (manualTimer.current) clearTimeout(manualTimer.current);

    if (typeof direction === "number") {
      setCurrentIndex(direction);
    } else if (direction === "next") {
      setCurrentIndex((prev) => (prev + 1) % polls.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + polls.length) % polls.length);
    }

    // Re-enable auto-rotation after 30 seconds
    manualTimer.current = setTimeout(() => {
      manualOverride.current = false;
    }, 30_000);
  };

  useEffect(() => {
    return () => {
      if (manualTimer.current) clearTimeout(manualTimer.current);
    };
  }, []);

  // Reset index if polls change
  useEffect(() => {
    if (currentIndex >= polls.length && polls.length > 0) setCurrentIndex(0);
  }, [polls.length, currentIndex]);

  const formatTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ height: "300px", borderRadius: "20px", background: "#eee", animation: "shimmer 1.5s infinite" }} />
        <style>{`@keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div style={{ borderRadius: "20px", background: "#fff", border: "1px solid #eee", padding: "60px 24px", textAlign: "center" }}>
        <BarChart3 style={{ width: "48px", height: "48px", color: "#ccc", margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#333", marginBottom: "8px" }}>No Active Polls</h3>
        <p style={{ color: "#888", fontSize: "14px" }}>Polls will appear here when created.</p>
      </div>
    );
  }

  const currentPoll = polls[currentIndex];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #8B0000, #DC143C)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart3 style={{ width: "18px", height: "18px", color: "#fff" }} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>Live Polls</h2>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 14px", borderRadius: "999px", background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: "12px", fontWeight: 500 }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />Live
          </span>
        </div>

        {/* Timer + Navigation */}
        {polls.length > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#888" }}>
              <Timer style={{ width: "14px", height: "14px" }} />
              <span>Next in {formatTime(timeLeft)}</span>
            </div>
            <button onClick={() => navigate("prev")} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #eee", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft style={{ width: "16px", height: "16px", color: "#666" }} />
            </button>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#555", minWidth: "40px", textAlign: "center" as const }}>{currentIndex + 1}/{polls.length}</span>
            <button onClick={() => navigate("next")} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1px solid #eee", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ChevronRight style={{ width: "16px", height: "16px", color: "#666" }} />
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>

      {/* Dots indicator */}
      {polls.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
          {polls.map((_, i) => (
            <button key={i} onClick={() => navigate(i)} style={{
              width: i === currentIndex ? "24px" : "8px", height: "8px",
              borderRadius: "999px", border: "none", cursor: "pointer",
              background: i === currentIndex ? "#DC143C" : "#ddd",
              transition: "all 0.3s",
            }} />
          ))}
        </div>
      )}

      {/* Active Poll */}
      <AnimatePresence mode="wait">
        {currentPoll && <PollCard key={currentPoll.id} poll={currentPoll} token={token} />}
      </AnimatePresence>
    </div>
  );
}

const PollCard = memo(function PollCard({ poll, token }: { poll: import("@/lib/api").Poll; token: string }) {
  const { markVoted, hasVoted: checkVoted, getSelectedOption, updatePollVotes } = usePollStore();
  const voted = checkVoted(poll.id);
  const selectedOption = getSelectedOption(poll.id);
  const [pendingOption, setPendingOption] = useState<string | null>(null);
  const totalVotes = useMemo(() => poll.options.reduce((sum, o) => sum + o.vote_count, 0), [poll.options]);

  const handleVote = useCallback(async (optionId: string) => {
    if (pendingOption) return; // prevent double-click while loading
    if (selectedOption === optionId) return; // same option, no-op

    setPendingOption(optionId);

    // Optimistic update: immediately show the selection
    markVoted(poll.id, optionId);

    // Optimistic vote count update
    const newVotes: Record<string, number> = {};
    poll.options.forEach((opt) => {
      let count = opt.vote_count;
      if (opt.id === optionId) count += 1;
      if (selectedOption && opt.id === selectedOption) count = Math.max(0, count - 1);
      newVotes[opt.id] = count;
    });
    updatePollVotes(poll.id, newVotes);

    try {
      await pollsApi.vote(poll.id, optionId, token);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Vote failed");
    } finally {
      setPendingOption(null);
    }
  }, [poll.id, poll.options, token, selectedOption, pendingOption, markVoted, updatePollVotes]);

  const activeOption = pendingOption || selectedOption;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      style={{ borderRadius: "20px", background: "#fff", border: "1px solid #eee", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
    >
      <h3 style={{ fontSize: "17px", fontWeight: 600, color: "#111", marginBottom: "20px" }}>{poll.question}</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {poll.options.map((opt) => {
          const pct = totalVotes > 0 ? (opt.vote_count / totalVotes) * 100 : 0;
          const isSelected = activeOption === opt.id;
          const isPending = pendingOption === opt.id;
          return (
            <button key={opt.id} onClick={() => handleVote(opt.id)} disabled={!poll.is_active || isPending}
              style={{
                position: "relative", width: "100%", overflow: "hidden", borderRadius: "14px",
                padding: "16px 18px", textAlign: "left" as const, cursor: isPending ? "wait" : "pointer",
                border: isSelected ? "2px solid #DC143C" : "1px solid #eee",
                background: isSelected ? "rgba(220,20,60,0.05)" : "#fafafa",
                transition: "all 0.15s",
                transform: isSelected ? "scale(1.01)" : "scale(1)",
              }}>
              <motion.div
                style={{ position: "absolute", top: 0, left: 0, bottom: 0, background: isSelected ? "rgba(220,20,60,0.15)" : "rgba(220,20,60,0.08)", borderRadius: "14px" }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {isSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                      <Check style={{ width: "16px", height: "16px", color: "#DC143C" }} />
                    </motion.div>
                  )}
                  <span style={{ fontWeight: isSelected ? 600 : 500, fontSize: "14px", color: isSelected ? "#8B0000" : "#333" }}>{opt.option_text}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", color: "#8B0000", fontWeight: 700, fontFamily: "monospace" }}>{pct.toFixed(1)}%</span>
                  <span style={{ fontSize: "12px", color: "#999", fontFamily: "monospace" }}>({opt.vote_count})</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "18px", fontSize: "13px" }}>
        <span style={{ color: "#999" }}>{totalVotes} total vote{totalVotes !== 1 ? "s" : ""}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {voted && <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#22c55e", fontWeight: 500 }}><Check style={{ width: "14px", height: "14px" }} />Voted</span>}
          {voted && <span style={{ color: "#aaa", fontSize: "11px" }}>· Tap another to change</span>}
          <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#DC143C", fontSize: "11px", fontWeight: 500 }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#DC143C", animation: "pulse 2s infinite" }} />
            Auto-refreshing
          </span>
        </div>
      </div>
    </motion.div>
  );
});
