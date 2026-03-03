"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { alertsApi } from "@/lib/api";
import type { AlertItem } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
    " at " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function AlertsSection({ eventId }: { eventId: string }) {
  const token = useAuthStore((s) => s.token) ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["alerts", eventId],
    queryFn: () => alertsApi.getEventAlerts(eventId, token),
    enabled: !!token,
    refetchInterval: 10_000, // poll every 10s for new alerts
  });

  const alerts = data?.alerts ?? [];

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid #eee", borderTopColor: "#FE9727", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "linear-gradient(135deg, #fee2e2, #fecaca)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Bell style={{ width: "20px", height: "20px", color: "#FE9727" }} />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111" }}>Notifications</h2>
        </div>
        <p style={{ fontSize: "13px", color: "#888", marginLeft: "52px" }}>
          Stay updated with event announcements
        </p>
      </div>

      {/* Alerts List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {alerts.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            background: "#fff", borderRadius: "16px", border: "1px solid #eee",
          }}>
            <Bell style={{ width: "40px", height: "40px", color: "#ddd", marginBottom: "12px" }} />
            <p style={{ color: "#999", fontSize: "14px" }}>No notifications yet</p>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <AlertCard key={alert.id} alert={alert} index={i} isLatest={i === 0} />
          ))
        )}
      </div>
    </div>
  );
}

function AlertCard({ alert, index, isLatest }: { alert: AlertItem; index: number; isLatest: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        background: isLatest ? "linear-gradient(135deg, #fff5f5, #fff)" : "#fff",
        borderRadius: "16px", padding: "16px 20px",
        border: isLatest ? "1px solid #fecaca" : "1px solid #eee",
        display: "flex", gap: "14px", alignItems: "flex-start",
      }}
    >
      {/* Icon */}
      <div style={{
        width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
        background: isLatest ? "#FE9727" : "#f5f5f5",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Bell style={{
          width: "18px", height: "18px",
          color: isLatest ? "#fff" : "#ccc",
        }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
          <p style={{ fontWeight: 600, fontSize: "15px", color: "#111" }}>{alert.title}</p>
          <span style={{ fontSize: "11px", color: "#aaa", flexShrink: 0, marginLeft: "8px" }}>
            {getRelativeTime(alert.created_at)}
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.5 }}>{alert.message}</p>
        <p style={{ fontSize: "11px", color: "#bbb", marginTop: "6px" }}>
          {formatDate(alert.created_at)}
        </p>
      </div>
    </motion.div>
  );
}
