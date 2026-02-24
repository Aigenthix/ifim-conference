"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, BarChart3, Star, MessageSquare, Activity, TrendingUp, Award, Zap,
  Bell, Mic, Plus, Trash2, Send, LogOut,
} from "lucide-react";
import { adminApi, sessionsApi, alertsApi } from "@/lib/api";
import type { SessionItem, AlertItem } from "@/lib/api";

type Tab = "dashboard" | "sessions" | "alerts";

export default function AdminDashboard({ params }: { params: Promise<{ eventId: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [eventId, setEventId] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [token, setToken] = useState("");

  useEffect(() => {
    params.then((p) => setEventId(p.eventId));
    const t = localStorage.getItem("admin-token") || "";
    if (!t) router.replace("/admin");
    setToken(t);
  }, [params, router]);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["admin-dashboard", eventId],
    queryFn: () => adminApi.getDashboard(eventId, token),
    enabled: !!eventId && !!token,
    refetchInterval: 10_000,
  });

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin-email");
    localStorage.removeItem("admin-role");
    router.replace("/admin");
  };

  const tabs: { id: Tab; label: string; icon: typeof Zap }[] = [
    { id: "dashboard", label: "Dashboard", icon: Zap },
    { id: "sessions", label: "Sessions", icon: Mic },
    { id: "alerts", label: "Alerts", icon: Bell },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,10,10,0.8)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{
          maxWidth: "1200px", margin: "0 auto", padding: "0 20px",
          height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #8B0000, #DC143C)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap style={{ width: "18px", height: "18px", color: "#fff" }} />
            </div>
            <span style={{ fontWeight: 600, fontSize: "16px" }}>Admin Dashboard</span>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "4px", marginLeft: "20px" }}>
              {tabs.map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 14px", borderRadius: "10px", border: "none", cursor: "pointer",
                    fontSize: "13px", fontWeight: activeTab === t.id ? 600 : 400,
                    color: activeTab === t.id ? "#fff" : "rgba(255,255,255,0.5)",
                    background: activeTab === t.id ? "rgba(255,255,255,0.1)" : "transparent",
                  }}>
                    <Icon style={{ width: "14px", height: "14px" }} />{t.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
              Auto-refresh 10s
            </span>
            <button onClick={handleLogout} style={{
              background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "8px",
              padding: "8px", cursor: "pointer", color: "rgba(255,255,255,0.5)",
            }}>
              <LogOut style={{ width: "16px", height: "16px" }} />
            </button>
          </div>
        </div>
      </nav>

      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 20px" }}>
        {activeTab === "dashboard" && <DashboardTab dashboard={dashboard} isLoading={isLoading} />}
        {activeTab === "sessions" && <SessionsTab eventId={eventId} token={token} />}
        {activeTab === "alerts" && <AlertsTab eventId={eventId} token={token} />}
      </main>
    </div>
  );
}

// ── Dashboard Tab ──────────────────────────────────────────

function DashboardTab({ dashboard, isLoading }: { dashboard: any; isLoading: boolean }) {
  if (isLoading || !dashboard) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ height: "120px", borderRadius: "16px", background: "rgba(255,255,255,0.03)" }} />
        ))}
      </div>
    );
  }

  const stats = [
    { label: "Registrations", value: dashboard.total_registrations, icon: Users, color: "#60a5fa" },
    { label: "Live Users", value: dashboard.live_concurrent_users, icon: Activity, color: "#4ade80", live: true },
    { label: "Total Votes", value: dashboard.total_votes, icon: BarChart3, color: "#a855f7" },
    { label: "Avg Rating", value: dashboard.average_rating?.toFixed(1) || "0.0", icon: Star, color: "#facc15" },
    { label: "Feedback", value: dashboard.total_feedback, icon: Award, color: "#ec4899" },
    { label: "AI Queries", value: dashboard.total_queries, icon: MessageSquare, color: "#818cf8" },
    { label: "Active Polls", value: dashboard.total_polls, icon: TrendingUp, color: "#22d3ee" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{
                padding: "20px", borderRadius: "16px",
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "12px",
                  background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon style={{ width: "20px", height: "20px", color: stat.color }} />
                </div>
                {stat.live && (
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#4ade80" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />Live
                  </span>
                )}
              </div>
              <p style={{ fontSize: "28px", fontWeight: 700 }}>{stat.value}</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "4px" }}>{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {dashboard.top_queries?.length > 0 && (
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare style={{ width: "16px", height: "16px", color: "#DC143C" }} /> Top AI Queries
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {dashboard.top_queries.map((q: string, i: number) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)",
                fontSize: "13px", color: "rgba(255,255,255,0.6)",
              }}>
                <span style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>#{i + 1}</span>
                {q}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sessions Management Tab ────────────────────────────────

function SessionsTab({ eventId, token }: { eventId: string; token: string }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", speaker_name: "", speaker_title: "", day: 1, audio_url: "", video_url: "" });

  const { data } = useQuery({
    queryKey: ["admin-sessions", eventId],
    queryFn: () => sessionsApi.getEventSessions(eventId, token),
    enabled: !!eventId && !!token,
  });

  const createMutation = useMutation({
    mutationFn: () => sessionsApi.create({ ...form, event_id: eventId, day: form.day }, token),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-sessions"] }); setShowForm(false); setForm({ title: "", speaker_name: "", speaker_title: "", day: 1, audio_url: "", video_url: "" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sessionsApi.delete(id, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-sessions"] }),
  });

  const sessions = data?.sessions ?? [];
  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
    color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" as const,
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Sessions ({sessions.length})</h2>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "10px 18px", borderRadius: "10px", border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #8B0000, #DC143C)", color: "#fff",
          fontSize: "13px", fontWeight: 600,
        }}>
          <Plus style={{ width: "16px", height: "16px" }} /> Add Session
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <input placeholder="Session Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
            <input placeholder="Speaker Name" value={form.speaker_name} onChange={(e) => setForm({ ...form, speaker_name: e.target.value })} style={inputStyle} />
            <input placeholder="Speaker Title/Role" value={form.speaker_title} onChange={(e) => setForm({ ...form, speaker_title: e.target.value })} style={inputStyle} />
            <select value={form.day} onChange={(e) => setForm({ ...form, day: Number(e.target.value) })} style={inputStyle}>
              <option value={1}>Day 1</option>
              <option value={2}>Day 2</option>
            </select>
            <input placeholder="Audio URL (Google Drive)" value={form.audio_url} onChange={(e) => setForm({ ...form, audio_url: e.target.value })} style={inputStyle} />
            <input placeholder="Video URL (YouTube)" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "14px" }}>
            <button onClick={() => setShowForm(false)} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#fff", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
            <button onClick={() => createMutation.mutate()} disabled={!form.title || createMutation.isPending}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #8B0000, #DC143C)", color: "#fff", fontSize: "13px", cursor: "pointer", opacity: !form.title ? 0.5 : 1 }}>
              {createMutation.isPending ? "Creating..." : "Create Session"}
            </button>
          </div>
        </motion.div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {sessions.map((s) => (
          <div key={s.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", borderRadius: "12px",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: "14px" }}>{s.speaker_name || s.title}</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Day {s.day} · {s.speaker_title || s.title}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {s.audio_url && <span style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", background: "rgba(220,20,60,0.15)", color: "#f87171" }}>🎙 Audio</span>}
              {s.video_url && <span style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "6px", background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>▶ Video</span>}
              <button onClick={() => deleteMutation.mutate(s.id)} style={{
                background: "rgba(239,68,68,0.1)", border: "none", borderRadius: "8px",
                padding: "6px", cursor: "pointer", color: "#f87171",
              }}>
                <Trash2 style={{ width: "14px", height: "14px" }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Alerts Management Tab ──────────────────────────────────

function AlertsTab({ eventId, token }: { eventId: string; token: string }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const { data } = useQuery({
    queryKey: ["admin-alerts", eventId],
    queryFn: () => alertsApi.getEventAlerts(eventId, token),
    enabled: !!eventId && !!token,
  });

  const createMutation = useMutation({
    mutationFn: () => alertsApi.create({ event_id: eventId, title, message }, token),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-alerts"] }); setTitle(""); setMessage(""); },
  });

  const alerts = data?.alerts ?? [];

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px" }}>
        <Bell style={{ width: "20px", height: "20px", display: "inline", marginRight: "8px", verticalAlign: "middle" }} />
        Push Notification ({alerts.length})
      </h2>

      {/* Create Alert Form */}
      <div style={{
        padding: "20px", borderRadius: "16px", marginBottom: "24px",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Send Live Notification</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input placeholder="Notification title" value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
              color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box",
            }} />
          <textarea placeholder="Notification message..." value={message}
            onChange={(e) => setMessage(e.target.value)} rows={3}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
              color: "#fff", fontSize: "13px", outline: "none", resize: "vertical",
              fontFamily: "'Inter', sans-serif", boxSizing: "border-box",
            }} />
          <button onClick={() => createMutation.mutate()} disabled={!title.trim() || !message.trim() || createMutation.isPending}
            style={{
              alignSelf: "flex-end", display: "flex", alignItems: "center", gap: "6px",
              padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #8B0000, #DC143C)", color: "#fff",
              fontSize: "13px", fontWeight: 600,
              opacity: (!title.trim() || !message.trim()) ? 0.5 : 1,
            }}>
            <Send style={{ width: "14px", height: "14px" }} />
            {createMutation.isPending ? "Sending..." : "Send to All Users"}
          </button>
        </div>
      </div>

      {/* Alert History */}
      <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: "rgba(255,255,255,0.6)" }}>Sent Notifications</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {alerts.map((a) => (
          <div key={a.id} style={{
            padding: "14px 16px", borderRadius: "12px",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <p style={{ fontWeight: 600, fontSize: "14px" }}>{a.title}</p>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                {new Date(a.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>{a.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
