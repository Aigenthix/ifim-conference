"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Video, ChevronRight } from "lucide-react";
import { sessionsApi } from "@/lib/api";
import type { SessionItem } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function SessionsSection({ eventId }: { eventId: string }) {
  const token = useAuthStore((s) => s.token) ?? "";
  const [activeDay, setActiveDay] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["sessions", eventId],
    queryFn: () => sessionsApi.getEventSessions(eventId, token),
    enabled: !!token,
    refetchInterval: 30_000,
  });

  const sessions = data?.sessions ?? [];
  const days = [...new Set(sessions.map((s) => s.day))].sort();
  const filteredSessions = sessions.filter((s) => s.day === activeDay);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid #eee", borderTopColor: "#DC143C", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "12px",
          background: "linear-gradient(135deg, #fee2e2, #fecaca)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Mic style={{ width: "20px", height: "20px", color: "#DC143C" }} />
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111" }}>Sessions</h2>
      </div>

      {/* Day Tabs */}
      <div style={{
        display: "flex", gap: "0", marginBottom: "20px",
        background: "#f5f5f5", borderRadius: "14px", padding: "4px",
      }}>
        {(days.length > 0 ? days : [1, 2]).map((day) => (
          <button key={day} onClick={() => setActiveDay(day)} style={{
            flex: 1, padding: "12px 20px", borderRadius: "12px", border: "none",
            cursor: "pointer", fontSize: "14px", fontWeight: 600,
            background: activeDay === day ? "linear-gradient(135deg, #8B0000, #DC143C)" : "transparent",
            color: activeDay === day ? "#fff" : "#666",
            transition: "all 0.2s",
            boxShadow: activeDay === day ? "0 4px 12px rgba(220,20,60,0.3)" : "none",
          }}>
            Day {day}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          {filteredSessions.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              background: "#fff", borderRadius: "16px", border: "1px solid #eee",
            }}>
              <Mic style={{ width: "40px", height: "40px", color: "#ddd", marginBottom: "12px" }} />
              <p style={{ color: "#999", fontSize: "14px" }}>No sessions for Day {activeDay} yet</p>
            </div>
          ) : (
            filteredSessions.map((session, i) => (
              <SessionCard key={session.id} session={session} index={i} />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SessionCard({ session, index }: { session: SessionItem; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const initials = (session.speaker_name || session.title)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleClick = () => {
    if (session.description) {
      setIsExpanded(!isExpanded);
    } else if (session.video_url) {
      window.open(session.video_url, "_blank", "noopener,noreferrer");
    }
  };

  const isClickable = !!(session.description || session.video_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleClick}
      style={{
        background: "#fff", borderRadius: "16px", padding: "16px",
        border: "1px solid #eee",
        display: "flex", flexDirection: "column",
        transition: "box-shadow 0.2s",
        cursor: isClickable ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%" }}>
        {/* Avatar */}
        <div style={{
          width: "48px", height: "48px", borderRadius: "14px", flexShrink: 0,
          background: "linear-gradient(135deg, #fee2e2, #fecaca)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #8B0000, #DC143C)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 700, fontSize: "13px",
          }}>
            {initials}
          </div>
        </div>
  
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: "15px", color: "#111", marginBottom: "2px" }}>
            {session.speaker_name || session.title}
          </p>
          <p style={{ fontSize: "13px", color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {session.speaker_title || session.title}
          </p>
        </div>
  
        {/* Media Buttons */}
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          {session.audio_url && (
            <a href={session.audio_url} target="_blank" rel="noopener noreferrer"
              style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", textDecoration: "none",
              }}>
              <Mic style={{ width: "16px", height: "16px", color: "#DC143C" }} />
            </a>
          )}
          {session.video_url && (
            <a href={session.video_url} target="_blank" rel="noopener noreferrer"
              style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", textDecoration: "none",
              }}>
              <Video style={{ width: "16px", height: "16px", color: "#DC143C" }} />
            </a>
          )}
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
            <ChevronRight style={{ width: "18px", height: "18px", color: "#ccc", alignSelf: "center", cursor: "pointer" }} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && session.description && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              marginTop: "16px", paddingTop: "16px", borderTop: "1px dashed #eee",
              fontSize: "14px", color: "#555", lineHeight: 1.6, whiteSpace: "pre-wrap"
            }}>
              {session.description}
              
              {session.video_url && (
                <div style={{ marginTop: "12px" }}>
                  <a 
                    href={session.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} 
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      color: "#DC143C", fontWeight: 600, fontSize: "13px", textDecoration: "none",
                      padding: "8px 14px", background: "#fff5f5", borderRadius: "8px"
                    }}
                  >
                    <Video style={{ width: "14px", height: "14px" }} />
                    Watch Video / Webinar Link
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
