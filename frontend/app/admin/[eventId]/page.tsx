"use client";

import { useState, useEffect, useRef, useCallback, useMemo, useDeferredValue } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, BarChart3, Star, MessageSquare, Activity, TrendingUp, Award, Zap,
  Bell, Mic, Plus, Trash2, Send, LogOut, UserPlus, Gift, ClipboardList,
  Search, Check, X, Mail, Phone, Building2, Shirt, UtensilsCrossed,
  ScanLine, Camera, QrCode, Loader2, MessageCircle, Clock3, Sparkles
} from "lucide-react";
import { adminApi, sessionsApi, alertsApi, qaApi, bulkEmailApi } from "@/lib/api";
import type { SessionItem, AlertItem, Dashboard, QAQuestionItem, QASessionItem, TicketItem } from "@/lib/api";
import { toast } from "sonner";

type Tab = "dashboard" | "sessions" | "alerts" | "attendance" | "food" | "adduser" | "feedback" | "qa" | "bulkemail";

type BarcodeDetectorResult = { rawValue?: string };
type BarcodeDetectorInstance = {
  detect: (input: ImageBitmapSource) => Promise<BarcodeDetectorResult[]>;
};
type BarcodeDetectorCtor = {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
  getSupportedFormats?: () => Promise<string[]>;
};

const ATTENDANCE_PAGE_SIZE = 50;
const EMPTY_ATTENDEES: Array<{
  user_id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  food_preference: string | null;
  tshirt_size: string | null;
  growth_focus: string | null;
  goodies_given: boolean;
  registered_at: string;
}> = [];

export default function AdminDashboard({ params }: { params: Promise<{ eventId: string }> }) {
  const router = useRouter();
  const [eventId, setEventId] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [token] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("admin-token") || "" : ""
  );

  useEffect(() => {
    params.then((p) => setEventId(p.eventId));
    if (!token) router.replace("/admin");
  }, [params, router, token]);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["admin-dashboard", eventId],
    queryFn: () => adminApi.getDashboard(eventId, token),
    enabled: !!eventId && !!token,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  });

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin-email");
    localStorage.removeItem("admin-role");
    router.replace("/admin");
  };

  const tabs: { id: Tab; label: string; icon: typeof Zap }[] = [
    { id: "dashboard", label: "Dashboard", icon: Zap },
    { id: "attendance", label: "Attendance", icon: ClipboardList },
    { id: "food", label: "Food", icon: UtensilsCrossed },
    { id: "adduser", label: "Add User", icon: UserPlus },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    // { id: "qa", label: "Q&A", icon: MessageCircle },
    // { id: "sessions", label: "Sessions", icon: Mic },
    // { id: "alerts", label: "Alerts", icon: Bell },
    { id: "bulkemail", label: "Bulk Email", icon: Mail },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "#0a0a0a", color: "#fff", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,10,10,0.8)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        {/* Top row: logo + logout */}
        <div style={{
          maxWidth: "1200px", margin: "0 auto", padding: "0 16px",
          height: "50px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "#FE9727",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Zap style={{ width: "16px", height: "16px", color: "#fff" }} />
            </div>
            <span style={{ fontWeight: 600, fontSize: "15px", whiteSpace: "nowrap" }}>Admin Dashboard</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="auto-refresh-label" style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", animation: "pulse 2s infinite" }} />
              Auto-refresh 10s
            </span>
            <button onClick={handleLogout} style={{
              background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "8px",
              padding: "7px", cursor: "pointer", color: "rgba(255,255,255,0.5)", flexShrink: 0,
            }}>
              <LogOut style={{ width: "15px", height: "15px" }} />
            </button>
          </div>
        </div>
        {/* Tab row: horizontally scrollable */}
        <div style={{
          maxWidth: "1200px", margin: "0 auto", padding: "0 12px 8px",
          display: "flex", gap: "4px", overflowX: "auto",
          WebkitOverflowScrolling: "touch", scrollbarWidth: "none",
        }}>
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "7px 12px", borderRadius: "8px", border: "none", cursor: "pointer",
                fontSize: "12px", fontWeight: activeTab === t.id ? 600 : 400,
                color: activeTab === t.id ? "#fff" : "rgba(255,255,255,0.5)",
                background: activeTab === t.id ? "rgba(255,255,255,0.1)" : "transparent",
                whiteSpace: "nowrap", flexShrink: 0,
              }}>
                <Icon style={{ width: "13px", height: "13px" }} />{t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        nav div::-webkit-scrollbar { display: none; }
        @media (max-width: 600px) {
          .auto-refresh-label { display: none !important; }
        }
      `}</style>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 20px" }}>
        {activeTab === "dashboard" && <DashboardTab dashboard={dashboard} isLoading={isLoading} />}
        {activeTab === "attendance" && <AttendanceTab eventId={eventId} token={token} />}
        {activeTab === "food" && <FoodAttendanceTab eventId={eventId} token={token} />}
        {activeTab === "adduser" && <AddUserTab eventId={eventId} token={token} />}
        {activeTab === "feedback" && <FeedbackTab eventId={eventId} token={token} />}
        {/* {activeTab === "sessions" && <SessionsTab eventId={eventId} token={token} />} */}
        {/* {activeTab === "alerts" && <AlertsTab eventId={eventId} token={token} />} */}
        {/* {activeTab === "qa" && <QATab eventId={eventId} token={token} />} */}
        {activeTab === "bulkemail" && <BulkEmailTab eventId={eventId} token={token} />}
      </main>
    </div>
  );
}

// ── Dashboard Tab ──────────────────────────────────────────
function DashboardTab({ dashboard, isLoading }: { dashboard: Dashboard | undefined; isLoading: boolean }) {
  if (isLoading || !dashboard) return <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading dashboard…</p>;

  const stats = [
    { label: "Registrations", value: dashboard.total_registrations, icon: Users, color: "#3b82f6" },
    { label: "Live Users", value: dashboard.live_concurrent_users, icon: Activity, color: "#22c55e", badge: "Live" },
    // { label: "Total Votes", value: dashboard.total_votes, icon: BarChart3, color: "#a855f7" },
    { label: "Avg Rating", value: dashboard.average_rating?.toFixed(1), icon: Star, color: "#eab308" },
    { label: "Feedback", value: dashboard.total_feedback, icon: MessageSquare, color: "#ec4899" },
    // { label: "AI Queries", value: dashboard.total_queries, icon: TrendingUp, color: "#06b6d4" },
    // { label: "Active Polls", value: dashboard.total_polls, icon: Award, color: "#f97316" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              style={{
                padding: "20px", borderRadius: "16px", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)", position: "relative",
              }}>
              {s.badge && <span style={{
                position: "absolute", top: "12px", right: "12px", fontSize: "10px", fontWeight: 600,
                background: s.color, color: "#fff", padding: "2px 8px", borderRadius: "6px",
              }}>{s.badge}</span>}
              <Icon style={{ width: "24px", height: "24px", color: s.color, marginBottom: "12px" }} />
              <div style={{ fontSize: "28px", fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* {dashboard.top_queries?.length > 0 && (
        <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", fontSize: "16px" }}>
            <TrendingUp style={{ width: "18px", height: "18px", color: "#06b6d4" }} /> Top AI Queries
          </h3>
          {dashboard.top_queries.map((q: string, i: number) => (
            <div key={i} style={{
              padding: "12px 16px", borderRadius: "10px",
              background: "rgba(255,255,255,0.02)", marginBottom: "8px",
              display: "flex", alignItems: "center", gap: "12px",
            }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>#{i + 1}</span>
              <span style={{ fontSize: "14px" }}>{q}</span>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}

// ── Attendance Tab ─────────────────────────────────────────
function AttendanceTab({ eventId, token }: { eventId: string; token: string }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scanPayloadInput, setScanPayloadInput] = useState("");
  const [lastScannedUserId, setLastScannedUserId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const scannerBusyRef = useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-attendance", eventId],
    queryFn: () => adminApi.getAttendance(eventId, token),
    enabled: !!eventId && !!token,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
    staleTime: 5_000,
  });

  const toggleGoodies = useMutation({
    mutationFn: (args: { user_id: string; goodies_given: boolean }) =>
      adminApi.toggleGoodies(eventId, args, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-attendance"] }),
  });

  const scanQrMutation = useMutation({
    mutationFn: (args: { qr_payload: string }) =>
      adminApi.scanAttendanceQr(eventId, args, token),
    onSuccess: (result) => {
      setLastScannedUserId(result.attendee.user_id);
      setSearch(result.attendee.name);
      setScannerOpen(false);
      setScanPayloadInput("");
      setScannerError(null);
      scannerBusyRef.current = false;
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: ["admin-attendance", eventId] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard", eventId] });
    },
    onError: (error: Error) => {
      setScannerError(error.message);
      scannerBusyRef.current = false;
      toast.error(error.message);
    },
  });

  const stopScanner = useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    scannerBusyRef.current = false;
  }, []);

  const handleScanPayload = useCallback(async (payload: string) => {
    const cleaned = payload.trim();
    if (!cleaned) {
      setScannerError("Scanned payload is empty. Try scanning again.");
      return;
    }

    if (scanQrMutation.isPending) return;
    await scanQrMutation.mutateAsync({ qr_payload: cleaned });
  }, [scanQrMutation]);

  useEffect(() => {
    if (!scannerOpen) {
      stopScanner();
      return;
    }

    const startScanner = async () => {
      setScannerError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerError("Camera access is not available in this browser.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch {
        setScannerError("Unable to access camera. Allow permission or use manual QR payload input.");
        return;
      }

      const detectorCtor = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      if (!detectorCtor) {
        setScannerError("Auto QR detection is not supported here. Use manual QR payload input.");
        return;
      }

      if (detectorCtor.getSupportedFormats) {
        try {
          const formats = await detectorCtor.getSupportedFormats();
          if (!formats.includes("qr_code")) {
            setScannerError("This browser camera does not support QR format detection.");
            return;
          }
        } catch {
          // Continue; some browsers throw while still supporting detection.
        }
      }

      const detector = new detectorCtor({ formats: ["qr_code"] });

      const scanFrame = async () => {
        if (!videoRef.current) return;
        if (scannerBusyRef.current) {
          rafRef.current = window.requestAnimationFrame(() => {
            void scanFrame();
          });
          return;
        }

        try {
          if (videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            const codes = await detector.detect(videoRef.current);
            const rawValue = codes.find((code) => code.rawValue?.trim())?.rawValue?.trim();
            if (rawValue) {
              scannerBusyRef.current = true;
              try {
                await handleScanPayload(rawValue);
                return;
              } catch {
                scannerBusyRef.current = false;
              }
            }
          }
        } catch {
          // Ignore decode errors and keep scanning.
        }

        rafRef.current = window.requestAnimationFrame(() => {
          void scanFrame();
        });
      };

      rafRef.current = window.requestAnimationFrame(() => {
        void scanFrame();
      });
    };

    void startScanner();
    return () => {
      stopScanner();
    };
  }, [handleScanPayload, scannerOpen, stopScanner]);

  const attendees = data?.attendees ?? EMPTY_ATTENDEES;
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const filtered = useMemo(
    () =>
      attendees.filter((a) =>
        !deferredSearch
          ? true
          : a.name.toLowerCase().includes(deferredSearch) ||
            a.email.toLowerCase().includes(deferredSearch) ||
            a.company?.toLowerCase().includes(deferredSearch)
      ),
    [attendees, deferredSearch]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ATTENDANCE_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * ATTENDANCE_PAGE_SIZE;
  const visibleRows = useMemo(
    () => filtered.slice(pageStart, pageStart + ATTENDANCE_PAGE_SIZE),
    [filtered, pageStart]
  );

  const goodiesCount = attendees.filter((a) => a.goodies_given).length;
  const lastScannedAttendee = attendees.find((attendee) => attendee.user_id === lastScannedUserId) || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Stats Row */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ padding: "16px 24px", borderRadius: "12px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#3b82f6" }}>{data?.total || 0}</span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginLeft: "8px" }}>Total Registered</span>
        </div>
        <div style={{ padding: "16px 24px", borderRadius: "12px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#22c55e" }}>{goodiesCount}</span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginLeft: "8px" }}>Goodies Given</span>
        </div>
        <button
          type="button"
          onClick={() => setScannerOpen(true)}
          style={{
            padding: "16px 20px",
            borderRadius: "12px",
            border: "1px solid rgba(217,70,239,0.35)",
            background: "linear-gradient(135deg, rgba(168,85,247,0.22), rgba(79,70,229,0.2))",
            color: "#e9d5ff",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ScanLine style={{ width: "16px", height: "16px" }} />
          Scan QR
        </button>
        {lastScannedAttendee && (
          <div style={{ padding: "16px 20px", borderRadius: "12px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.22)" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#93c5fd" }}>Last scan:</span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", marginLeft: "8px" }}>{lastScannedAttendee.name}</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        padding: "12px 16px", borderRadius: "12px",
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <Search style={{ width: "16px", height: "16px", color: "rgba(255,255,255,0.3)" }} />
        <input
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "#fff", fontSize: "14px",
          }}
        />
      </div>

      {isLoading ? (
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading attendance…</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                {["#", "Name", "Email", "Phone", "Title of Paper", "Goodies"].map((h) => (
                  <th key={h} style={{ padding: "12px 10px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((a, i) => (
                <tr
                  key={a.user_id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    background: a.user_id === lastScannedUserId ? "rgba(34,197,94,0.08)" : "transparent",
                  }}
                >
                  <td style={{ padding: "10px" }}>{pageStart + i + 1}</td>
                  <td style={{ padding: "10px", fontWeight: 500 }}>{a.name}</td>
                  <td style={{ padding: "10px", color: "rgba(255,255,255,0.6)" }}>{a.email}</td>
                  <td style={{ padding: "10px", color: "rgba(255,255,255,0.6)" }}>{a.phone}</td>
                  <td style={{ padding: "10px", color: "rgba(255,255,255,0.6)" }}>{a.growth_focus || "—"}</td>
                  <td style={{ padding: "10px" }}>
                    <button
                      onClick={() => toggleGoodies.mutate({ user_id: a.user_id, goodies_given: !a.goodies_given })}
                      style={{
                        width: "32px", height: "32px", borderRadius: "8px", border: "none", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: a.goodies_given ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
                        color: a.goodies_given ? "#22c55e" : "rgba(255,255,255,0.3)",
                        transition: "all 0.2s",
                      }}
                    >
                      {a.goodies_given ? <Check style={{ width: "16px", height: "16px" }} /> : <Gift style={{ width: "16px", height: "16px" }} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "40px 0" }}>No attendees found</p>
          )}
          {filtered.length > 0 && (
            <div style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              color: "rgba(255,255,255,0.65)",
              fontSize: "12px",
            }}>
              <div>
                Showing {pageStart + 1}-{Math.min(pageStart + ATTENDANCE_PAGE_SIZE, filtered.length)} of {filtered.length}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={safePage <= 1}
                  style={{
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.05)",
                    color: safePage <= 1 ? "rgba(255,255,255,0.35)" : "#fff",
                    cursor: safePage <= 1 ? "not-allowed" : "pointer",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  Previous
                </button>
                <span style={{ minWidth: "84px", textAlign: "center" }}>
                  Page {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safePage >= totalPages}
                  style={{
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "rgba(255,255,255,0.05)",
                    color: safePage >= totalPages ? "rgba(255,255,255,0.35)" : "#fff",
                    cursor: safePage >= totalPages ? "not-allowed" : "pointer",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {scannerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(0,0,0,0.74)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setScannerOpen(false)}
        >
          <div
            style={{
              width: "min(840px, calc(100vw - 24px))",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#0f0f0f",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              overflow: "hidden",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                  <QrCode style={{ width: "18px", height: "18px", color: "#a855f7" }} />
                  Scan Attendee QR
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                  Scan from attendee badge QR. Attendance + goodies are marked automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "9px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.85)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", padding: "14px" }}>
              <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", background: "#050505", overflow: "hidden" }}>
                <div style={{ position: "relative", aspectRatio: "4 / 3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    autoPlay
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute",
                    width: "60%",
                    maxWidth: "260px",
                    aspectRatio: "1 / 1",
                    border: "2px dashed rgba(168,85,247,0.9)",
                    borderRadius: "10px",
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.25)",
                    pointerEvents: "none",
                  }} />
                </div>
                <div style={{
                  padding: "10px 12px",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.75)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  {scanQrMutation.isPending ? (
                    <>
                      <Loader2 style={{ width: "14px", height: "14px", color: "#a855f7", animation: "spin 0.8s linear infinite" }} />
                      Processing QR scan...
                    </>
                  ) : (
                    <>
                      <Camera style={{ width: "14px", height: "14px", color: "#22c55e" }} />
                      Point camera to attendee QR code
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", padding: "12px", background: "rgba(255,255,255,0.03)" }}>
                  <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                    Manual fallback
                  </p>
                  <p style={{ margin: "4px 0 10px", fontSize: "11px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                    If camera scanning fails, paste the decoded QR payload from scanner device.
                  </p>
                  <textarea
                    value={scanPayloadInput}
                    onChange={(event) => setScanPayloadInput(event.target.value)}
                    placeholder="Paste QR payload here..."
                    style={{
                      width: "100%",
                      minHeight: "120px",
                      borderRadius: "10px",
                      resize: "vertical",
                      padding: "10px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "#0a0a0a",
                      color: "#fff",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void handleScanPayload(scanPayloadInput);
                    }}
                    disabled={scanQrMutation.isPending || scanPayloadInput.trim().length === 0}
                    style={{
                      marginTop: "10px",
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "none",
                      cursor: scanQrMutation.isPending || scanPayloadInput.trim().length === 0 ? "not-allowed" : "pointer",
                      background: scanQrMutation.isPending || scanPayloadInput.trim().length === 0
                        ? "rgba(255,255,255,0.15)"
                        : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    Submit Payload
                  </button>
                </div>

                {scannerError && (
                  <div style={{
                    borderRadius: "10px",
                    border: "1px solid rgba(239,68,68,0.35)",
                    background: "rgba(239,68,68,0.12)",
                    color: "#fca5a5",
                    padding: "10px 12px",
                    fontSize: "12px",
                    lineHeight: 1.5,
                  }}>
                    {scannerError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add User Tab ───────────────────────────────────────────
function AddUserTab({ eventId, token }: { eventId: string; token: string }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", food_preference: "", tshirt_size: "" });

  const addUser = useMutation({
    mutationFn: () => adminApi.addUser(eventId, form, token),
    onSuccess: (res) => {
      toast.success(res.message);
      setForm({ name: "", email: "", phone: "", company: "", food_preference: "", tshirt_size: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) return toast.error("Name, email, and phone are required");
    addUser.mutate();
  };

  const fields = [
    { key: "name", label: "Full Name", icon: Users, required: true, placeholder: "John Doe" },
    { key: "email", label: "Email Address", icon: Mail, required: true, placeholder: "john@company.com" },
    { key: "phone", label: "Phone Number", icon: Phone, required: true, placeholder: "+91 98765 43210" },
    { key: "company", label: "Student/Company", icon: Building2, required: false, placeholder: "Company Name" },
    { key: "growth_focus", label: "Title of Paper", icon: TrendingUp, required: false, placeholder: "Title of Paper:.." },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      style={{
        maxWidth: "600px", padding: "32px", borderRadius: "20px",
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      }}>
      <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
        <UserPlus style={{ width: "22px", height: "22px", color: "#3b82f6" }} /> Add New User
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {fields.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.key}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {f.label} {f.required && <span style={{ color: "#ef4444" }}>*</span>}
              </label>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px 14px", borderRadius: "10px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <Icon style={{ width: "16px", height: "16px", color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                <input
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "14px" }}
                />
              </div>
            </div>
          );
        })}
        <button type="submit" disabled={addUser.isPending} style={{
          marginTop: "8px", padding: "14px", borderRadius: "12px", border: "none",
          background: addUser.isPending ? "#555" : "linear-gradient(135deg, #3b82f6, #2563eb)",
          color: "#fff", fontWeight: 600, fontSize: "14px", cursor: addUser.isPending ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}>
          <UserPlus style={{ width: "16px", height: "16px" }} />
          {addUser.isPending ? "Adding..." : "Add User to Event"}
        </button>
      </form>
    </motion.div>
  );
}

// ── Feedback Tab ───────────────────────────────────────────
function FeedbackTab({ eventId, token }: { eventId: string; token: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-feedback", eventId],
    queryFn: () => adminApi.getFeedback(eventId, token),
    enabled: !!eventId && !!token,
    refetchInterval: 15_000,
  });

  const feedback = data?.feedback || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Stats Row */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ padding: "16px 24px", borderRadius: "12px", background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)" }}>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#ec4899" }}>{data?.total || 0}</span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginLeft: "8px" }}>Total Feedback</span>
        </div>
        <div style={{ padding: "16px 24px", borderRadius: "12px", background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#eab308" }}>{data?.average_rating?.toFixed(1) || "0.0"}</span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginLeft: "8px" }}>Average Rating</span>
        </div>
      </div>

      {isLoading ? (
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading feedback…</p>
      ) : feedback.length === 0 ? (
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "40px 0" }}>No feedback yet</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {feedback.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                padding: "20px", borderRadius: "14px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: "15px" }}>{f.user_name}</span>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginLeft: "10px" }}>{f.user_email}</span>
                </div>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} style={{
                      width: "16px", height: "16px",
                      color: s <= f.rating ? "#eab308" : "rgba(255,255,255,0.15)",
                      fill: s <= f.rating ? "#eab308" : "none",
                    }} />
                  ))}
                </div>
              </div>
              {f.comments && (
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: 0 }}>
                  &ldquo;{f.comments}&rdquo;
                </p>
              )}
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "10px" }}>
                {new Date(f.submitted_at).toLocaleString()}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sessions Management Tab ────────────────────────────────
function SessionsTab({ eventId, token }: { eventId: string; token: string }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", speaker_name: "", speaker_title: "", description: "", day: 1, display_order: 0, audio_url: "", video_url: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-sessions", eventId],
    queryFn: () => sessionsApi.getEventSessions(eventId, token),
    enabled: !!eventId && !!token,
  });

  const createSession = useMutation({
    mutationFn: () => sessionsApi.create({ ...form, event_id: eventId }, token),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-sessions"] }); setShowForm(false); setForm({ title: "", speaker_name: "", speaker_title: "", description: "", day: 1, display_order: 0, audio_url: "", video_url: "" }); },
  });
  const deleteSession = useMutation({
    mutationFn: (id: string) => sessionsApi.delete(id, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-sessions"] }),
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
          <Mic style={{ width: "20px", height: "20px", color: "#a855f7" }} /> Sessions
        </h2>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: "8px 16px", borderRadius: "10px", border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #a855f7, #7c3aed)", color: "#fff", fontWeight: 600, fontSize: "13px",
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          <Plus style={{ width: "14px", height: "14px" }} /> Add Session
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createSession.mutate(); }} style={{
          padding: "20px", borderRadius: "14px", background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "12px",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { key: "title", label: "Title", ph: "Session title" },
              { key: "speaker_name", label: "Speaker Name (Optional)", ph: "Speaker name" },
              { key: "speaker_title", label: "Speaker Title (Optional)", ph: "CEO, Founder..." },
              { key: "video_url", label: "Video URL (Optional)", ph: "https://youtube.com/..." },
              { key: "day", label: "Day", ph: "1" },
            ].map((f) => (
              <div key={f.key}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: "4px", display: "block" }}>{f.label}</label>
                <input placeholder={f.ph}
                  required={f.key === "title" || f.key === "day"}
                  value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [f.key]: f.key === "day" || f.key === "display_order" ? Number(e.target.value) : e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px", outline: "none" }}
                />
              </div>
            ))}
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: "4px", display: "block" }}>Description (Optional)</label>
            <textarea
              placeholder="Information about the session... (supports line breaks and bullet points)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={6}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6" }}
            />
          </div>
          <button type="submit" style={{
            padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #a855f7, #7c3aed)", color: "#fff", fontWeight: 600,
          }}>Create Session</button>
        </form>
      )}

      {isLoading ? <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading…</p> :
        data?.sessions?.map((s: SessionItem) => (
          <div key={s.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px", borderRadius: "12px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div>
              <span style={{ fontWeight: 600 }}>{s.title}</span>
              {s.speaker_name && <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginLeft: "10px" }}>— {s.speaker_name}</span>}
            </div>
            <button onClick={() => deleteSession.mutate(s.id)} style={{
              background: "rgba(239,68,68,0.15)", border: "none", borderRadius: "8px",
              padding: "8px", cursor: "pointer", color: "#ef4444",
            }}>
              <Trash2 style={{ width: "14px", height: "14px" }} />
            </button>
          </div>
        ))
      }
    </div>
  );
}

// ── Alerts Management Tab ──────────────────────────────────
function AlertsTab({ eventId, token }: { eventId: string; token: string }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", message: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-alerts", eventId],
    queryFn: () => alertsApi.getEventAlerts(eventId, token),
    enabled: !!eventId && !!token,
  });

  const { data: autoStatus } = useQuery({
    queryKey: ["admin-auto-alerts", eventId],
    queryFn: () => alertsApi.getAutoAlertStatus(eventId, token),
    enabled: !!eventId && !!token,
  });

  const toggleAuto = useMutation({
    mutationFn: (enabled: boolean) => alertsApi.toggleAutoAlerts(eventId, enabled, token),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-auto-alerts"] });
      toast.success(data.enabled ? "Auto-notifications enabled" : "Auto-notifications disabled");
    },
  });

  const createAlert = useMutation({
    mutationFn: () => alertsApi.create({ event_id: eventId, ...form }, token),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-alerts"] }); setForm({ title: "", message: "" }); },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
        <Bell style={{ width: "20px", height: "20px", color: "#f97316" }} /> Alerts
      </h2>

      {/* Auto-Notification Toggle */}
      <div style={{
        padding: "20px", borderRadius: "14px",
        background: autoStatus?.enabled
          ? "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))"
          : "rgba(255,255,255,0.04)",
        border: autoStatus?.enabled ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
            ⏰ Auto-Notification Scheduler
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
            Automatically sends alerts 15 minutes before each session on Feb 27 & 28
          </div>
        </div>
        <button
          onClick={() => toggleAuto.mutate(!autoStatus?.enabled)}
          style={{
            width: "52px", height: "28px", borderRadius: "14px", border: "none", cursor: "pointer",
            background: autoStatus?.enabled ? "#22c55e" : "rgba(255,255,255,0.15)",
            position: "relative", transition: "background 0.2s",
          }}
        >
          <div style={{
            width: "22px", height: "22px", borderRadius: "50%", background: "#fff",
            position: "absolute", top: "3px",
            left: autoStatus?.enabled ? "27px" : "3px",
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }} />
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); createAlert.mutate(); }} style={{
        padding: "20px", borderRadius: "14px", background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "12px",
      }}>
        <input placeholder="Alert title"
          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px", outline: "none" }}
        />
        <textarea placeholder="Alert message"
          value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px", outline: "none", minHeight: "80px", resize: "vertical" }}
        />
        <button type="submit" style={{
          padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
        }}>
          <Send style={{ width: "14px", height: "14px" }} /> Send Alert
        </button>
      </form>

      {isLoading ? <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading…</p> :
        data?.alerts?.map((a: AlertItem) => (
          <div key={a.id} style={{
            padding: "16px", borderRadius: "12px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ fontWeight: 600, marginBottom: "4px" }}>{a.title}</div>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>{a.message}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "8px" }}>{new Date(a.created_at).toLocaleString()}</div>
          </div>
        ))
      }
    </div>
  );
}

// ── Q&A Tab ──────────────────────────────────────────────

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

function QATab({ eventId, token }: { eventId: string; token: string }) {
  const userName = "Admin";
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
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.02);
          border-radius: 999px;
          padding: 9px 16px;
          min-width: max-content;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 13px;
          font-weight: 700;
        }
        .qa-session-pill {
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.02);
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
            <MessageCircle style={{ width: "20px", height: "20px", color: "#fff" }} />
          </div>
          <div>
            <h2 style={{ fontSize: "30px", lineHeight: 1.1, fontWeight: 800, color: "#fff" }}>Q&A</h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", marginTop: "3px" }}>
              Live session-wise questions with instant visibility for everyone.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "999px",
              padding: "6px 12px",
              background: "rgba(255,255,255,0.05)",
              fontSize: "12px",
              color: "rgba(255,255,255,0.6)",
              fontWeight: 600,
            }}
          >
            {threadQuestions.length} Questions
          </div>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "999px",
              padding: "6px 12px",
              background: "rgba(255,255,255,0.05)",
              fontSize: "12px",
              color: "rgba(255,255,255,0.6)",
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
              border: "1px solid rgba(220,20,60,0.2)",
              borderRadius: "999px",
              padding: "6px 12px",
              background: "rgba(220,20,60,0.1)",
              fontSize: "12px",
              color: "#ff6b6b",
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
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
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
                  borderColor: isActive ? "#de3755" : "rgba(255,255,255,0.1)",
                  background: isActive ? "#FE9727" : "rgba(255,255,255,0.02)",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
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
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
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
                  borderColor: isActive ? "#de3755" : "rgba(255,255,255,0.1)",
                  background: isActive ? "rgba(220,20,60,0.05)" : "rgba(255,255,255,0.02)",
                  boxShadow: isActive ? "0 6px 16px rgba(220,20,60,0.08)" : "none",
                }}
              >
                <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                  {session.time_range}
                </p>
                <p style={{ fontSize: "14px", lineHeight: 1.35, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>
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
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                    {session.speaker_name}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.6)",
                      borderRadius: "999px",
                      padding: "3px 8px",
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.05)",
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
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "16px",
          padding: "14px",
          marginBottom: "16px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
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
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                outline: "none",
                resize: "vertical",
                minHeight: "88px",
                fontSize: "14px",
                color: "#fff",
                lineHeight: 1.5,
                padding: "12px",
                background: "rgba(255,255,255,0.03)",
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
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                <Sparkles style={{ width: "14px", height: "14px", color: "#FE9727" }} />
                <span>
                  Asking as <strong style={{ color: "#FE9727" }}>{userName}</strong>
                  {selectedSession ? ` · ${selectedSession.time_range} · ${selectedSession.title}` : ""}
                </span>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color:
                    trimmedQuestion.length > QUESTION_MAX
                      ? "#ef4444"
                      : trimmedQuestion.length >= QUESTION_MIN
                        ? "#22c55e"
                        : "rgba(255,255,255,0.4)",
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
              background: canAsk ? "#FE9727" : "rgba(255,255,255,0.05)",
              color: canAsk ? "#fff" : "rgba(255,255,255,0.3)",
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
          <div style={{ marginTop: "8px", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
            Syncing Day 1 and Day 2 sessions...
          </div>
        )}
      </div>

      {statusMessage && (
        <div
          style={{
            marginBottom: "12px",
            borderRadius: "10px",
            border: "1px solid rgba(220,165,32,0.3)",
            background: "rgba(220,165,32,0.1)",
            color: "#fbbf24",
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
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "14px",
                padding: "14px",
              }}
            >
              <div style={{ width: "42%", height: "11px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", marginBottom: "10px" }} />
              <div style={{ width: "92%", height: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", marginBottom: "8px" }} />
              <div style={{ width: "70%", height: "10px", background: "rgba(255,255,255,0.05)", borderRadius: "6px" }} />
            </div>
          ))
        ) : threadQuestions.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "56px 20px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <MessageCircle style={{ width: "38px", height: "38px", color: "rgba(255,255,255,0.2)", marginBottom: "12px" }} />
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>
              No questions yet in this session
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
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
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "14px",
                  padding: "14px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.2)",
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
                    <span style={{ fontWeight: 700, fontSize: "13px", color: "#FE9727" }}>{question.user_name}</span>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                      <Clock3 style={{ width: "11px", height: "11px", display: "inline-block", marginRight: "4px", transform: "translateY(1px)" }} />
                      {formatTimestamp(question.created_at)} ({getRelativeTime(question.created_at)})
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)", lineHeight: 1.65, margin: 0 }}>{question.question}</p>
              </motion.article>
            );
          })
        )}
      </div>
    </section>
  );
}

// ── Bulk Email Tab ────────────────────────────────────────

// ── Food Attendance Tab ─────────────────────────────────────
const MEAL_SLOTS = [
  { key: "dinner1", label: "Dinner 1", emoji: "🍽️" },
  { key: "breakfast", label: "Breakfast", emoji: "🥐" },
  { key: "tea1", label: "Tea 1", emoji: "☕" },
  { key: "tea2", label: "Tea 2", emoji: "☕" },
  { key: "lunch", label: "Lunch", emoji: "🍱" },
  { key: "tea3", label: "Tea 3", emoji: "☕" },
  { key: "dinner2", label: "Dinner 2", emoji: "🍽️" },
  { key: "tea4", label: "Tea 4", emoji: "☕" },
];

function FoodAttendanceTab({ eventId, token }: { eventId: string; token: string }) {
  const [search, setSearch] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string>("auto");
  const [lastScannedUserId, setLastScannedUserId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  // Camera scanner refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const scannerBusyRef = useRef(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  const { data: foodData, isLoading, refetch } = useQuery({
    queryKey: ["food-attendance", eventId],
    queryFn: () => adminApi.getFoodAttendance(eventId, token),
    refetchInterval: 10_000,
  });

  const scanMutation = useMutation({
    mutationFn: (args: { qr_payload: string; slot?: string }) =>
      adminApi.scanFoodQr(eventId, args, token),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        setLastScannedUserId(res.attendee.user_id);
      } else {
        toast.error(res.message);
      }
      refetch();
      setScanInput("");
      scannerBusyRef.current = false;
    },
    onError: (err: Error) => {
      toast.error(err.message);
      scannerBusyRef.current = false;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (args: { user_id: string; slot: string; value: boolean }) =>
      adminApi.toggleFoodSlot(eventId, args, token),
    onSuccess: () => refetch(),
    onError: (err: Error) => toast.error(err.message),
  });

  const handleScanPayload = useCallback(async (qrPayload: string) => {
    const cleaned = qrPayload.trim();
    if (!cleaned) return;
    const body: { qr_payload: string; slot?: string } = { qr_payload: cleaned };
    if (selectedSlot !== "auto") body.slot = selectedSlot;
    await scanMutation.mutateAsync(body);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlot]);

  const handleManualScan = () => handleScanPayload(scanInput);

  // Camera scanner
  const stopScanner = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    scannerBusyRef.current = false;
  }, []);

  useEffect(() => {
    if (!showScanner) { stopScanner(); return; }

    const startScanner = async () => {
      setScannerError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerError("Camera not available. Use manual input below.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
      } catch {
        setScannerError("Camera permission denied. Use manual input below.");
        return;
      }

      const detectorCtor = (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      if (!detectorCtor) {
        setScannerError("QR detection not supported. Use manual input below.");
        return;
      }
      const detector = new detectorCtor({ formats: ["qr_code"] });

      const scanFrame = async () => {
        if (!videoRef.current || scannerBusyRef.current) {
          rafRef.current = requestAnimationFrame(() => { void scanFrame(); });
          return;
        }
        try {
          if (videoRef.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            const codes = await detector.detect(videoRef.current);
            const raw = codes.find((c) => c.rawValue?.trim())?.rawValue?.trim();
            if (raw) {
              scannerBusyRef.current = true;
              try { await handleScanPayload(raw); } catch { scannerBusyRef.current = false; }
              return;
            }
          }
        } catch { /* ignore */ }
        rafRef.current = requestAnimationFrame(() => { void scanFrame(); });
      };
      rafRef.current = requestAnimationFrame(() => { void scanFrame(); });
    };

    void startScanner();
    return () => { stopScanner(); };
  }, [handleScanPayload, showScanner, stopScanner]);

  const attendees = foodData?.attendees || [];
  const filtered = attendees.filter((a) =>
    `${a.name} ${a.email} ${a.company || ""}`.toLowerCase().includes(search.toLowerCase())
  );
  const pageStart = page * PAGE_SIZE;
  const visibleRows = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const selectStyle: React.CSSProperties = {
    padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: "13px", outline: "none",
    cursor: "pointer", fontWeight: 600, minWidth: "140px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Stats */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ padding: "16px 24px", borderRadius: "16px", background: "rgba(139,0,0,0.15)", border: "1px solid rgba(220,20,60,0.2)" }}>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#FE9727" }}>{foodData?.total || 0}</span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginLeft: "8px" }}>Total Registered</span>
        </div>
        <div style={{ padding: "16px 24px", borderRadius: "16px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#22c55e" }}>{foodData?.total_meals_served || 0}</span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginLeft: "8px" }}>Meals Served</span>
        </div>
        <button onClick={() => setShowScanner(!showScanner)} style={{
          padding: "16px 24px", borderRadius: "16px", border: "1px solid rgba(168,85,247,0.3)",
          background: showScanner ? "rgba(168,85,247,0.2)" : "rgba(168,85,247,0.1)",
          color: "#a855f7", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
          fontSize: "14px", fontWeight: 600,
        }}>
          <Camera style={{ width: "18px", height: "18px" }} /> {showScanner ? "Close Scanner" : "Scan QR"}
        </button>
      </div>

      {/* QR Scanner */}
      {showScanner && (
        <div style={{
          padding: "20px", borderRadius: "16px",
          background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)",
        }}>
          {/* Slot Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>MARKING FOR:</span>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              style={selectStyle}
            >
              <option value="auto">🔄 Auto (next empty)</option>
              {MEAL_SLOTS.map((s) => (
                <option key={s.key} value={s.key}>{s.emoji} {s.label}</option>
              ))}
            </select>
          </div>

          {/* Camera View */}
          <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", background: "#000", marginBottom: "12px", maxHeight: "300px" }}>
            <video ref={videoRef} playsInline muted autoPlay style={{ width: "100%", display: "block", maxHeight: "300px", objectFit: "cover" }} />
            {scanMutation.isPending && (
              <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.6)", color: "#a855f7", fontSize: "16px", fontWeight: 700,
              }}>
                <Loader2 style={{ width: "24px", height: "24px", animation: "spin 1s linear infinite" }} /> Marking meal…
              </div>
            )}
          </div>

          {scannerError && (
            <p style={{ color: "#f87171", fontSize: "12px", marginBottom: "8px" }}>{scannerError}</p>
          )}

          {/* Manual fallback */}
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualScan()}
              placeholder="Or paste QR data here…"
              style={{
                flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0,0,0,0.3)", color: "#fff", fontSize: "13px", outline: "none",
              }}
            />
            <button onClick={handleManualScan} disabled={scanMutation.isPending} style={{
              padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff",
              fontSize: "13px", fontWeight: 600,
            }}>
              {scanMutation.isPending ? "Scanning…" : "Mark Meal"}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative" }}>
        <Search style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", width: "16px", height: "16px", color: "rgba(255,255,255,0.3)" }} />
        <input
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search by name, email, or company..."
          style={{
            width: "100%", padding: "12px 12px 12px 40px", borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
            color: "#fff", fontSize: "13px", outline: "none",
          }}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading food attendance…</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                {["#", "Name", "Email", "Phone", "Food Pref", ...MEAL_SLOTS.map(s => s.label), "Total"].map((h) => (
                  <th key={h} style={{ padding: "10px 6px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((a, i) => (
                <tr key={a.user_id} style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: a.user_id === lastScannedUserId ? "rgba(168,85,247,0.08)" : "transparent",
                }}>
                  <td style={{ padding: "8px 6px" }}>{pageStart + i + 1}</td>
                  <td style={{ padding: "8px 6px", fontWeight: 500 }}>{a.name}</td>
                  <td style={{ padding: "8px 6px", color: "rgba(255,255,255,0.6)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis" }}>{a.email}</td>
                  <td style={{ padding: "8px 6px", color: "rgba(255,255,255,0.6)" }}>{a.phone}</td>
                  <td style={{ padding: "8px 6px", color: "rgba(255,255,255,0.6)" }}>{a.food_preference || "—"}</td>
                  {MEAL_SLOTS.map((slot) => {
                    const checked = (a as Record<string, unknown>)[slot.key] as boolean;
                    return (
                      <td key={slot.key} style={{ padding: "8px 6px", textAlign: "center" }}>
                        <button
                          onClick={() => toggleMutation.mutate({ user_id: a.user_id, slot: slot.key, value: !checked })}
                          style={{
                            width: "28px", height: "28px", borderRadius: "6px", border: "none", cursor: "pointer",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            background: checked ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
                            color: checked ? "#22c55e" : "rgba(255,255,255,0.2)",
                            transition: "all 0.2s", fontSize: "14px",
                          }}
                        >
                          {checked ? <Check style={{ width: "14px", height: "14px" }} /> : <span style={{ fontSize: "10px" }}>{slot.emoji}</span>}
                        </button>
                      </td>
                    );
                  })}
                  <td style={{ padding: "8px 6px", textAlign: "center", fontWeight: 700, color: a.total_meals > 0 ? "#22c55e" : "rgba(255,255,255,0.3)" }}>
                    {a.total_meals}/8
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "40px 0" }}>No attendees found</p>
          )}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
              {Array.from({ length: totalPages }, (_, p) => (
                <button key={p} onClick={() => setPage(p)} style={{
                  padding: "6px 12px", borderRadius: "8px", border: "none", cursor: "pointer",
                  background: page === p ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.06)",
                  color: page === p ? "#a855f7" : "rgba(255,255,255,0.4)",
                  fontSize: "12px", fontWeight: 600,
                }}>{p + 1}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Bulk Email Tab ──────────────────────────────────────────
function BulkEmailTab({ eventId, token }: { eventId: string; token: string }) {
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPassword, setSenderPassword] = useState("");
  const [provider, setProvider] = useState<"smtp" | "sendgrid">("smtp");

  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<{ status: string; name?: string; scanned_at?: string } | null>(null);

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    if (!eventId || !token) return;
    try {
      const data = await bulkEmailApi.getTickets(eventId, token);
      setTickets(data);
    } catch {
      // silent
    } finally {
      setLoadingTickets(false);
    }
  }, [eventId, token]);

  useEffect(() => {
    void fetchTickets();
    const timer = setInterval(fetchTickets, 10_000);
    return () => clearInterval(timer);
  }, [fetchTickets]);

  // Parse file for preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setUploadResult(null);

    if (f.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const lines = text.split("\n").filter((l) => l.trim());
        if (lines.length < 2) {
          setPreviewRows([]);
          setTotalRows(0);
          return;
        }
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/ /g, "_"));
        const rows: Record<string, string>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(",").map((v) => v.trim());
          const row: Record<string, string> = {};
          headers.forEach((h, j) => {
            row[h] = vals[j] || "";
          });
          rows.push(row);
        }
        setTotalRows(rows.length);
        setPreviewRows(rows.slice(0, 5));
      };
      reader.readAsText(f);
    } else {
      setTotalRows(-1); // unknown for xlsx, show file name
      setPreviewRows([]);
    }
  };

  // Upload
  const handleUpload = async () => {
    if (!file || !senderEmail || !senderPassword) {
      toast.error("Please fill in sender email, password, and select a file");
      return;
    }
    setUploading(true);
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("event_id", eventId);
      formData.append("smtp_host", smtpHost);
      formData.append("smtp_port", smtpPort);
      formData.append("sender_email", senderEmail);
      formData.append("sender_password", senderPassword);
      formData.append("provider", provider);

      const res = await bulkEmailApi.upload(formData, token);
      setUploadResult(res.message);
      toast.success(res.message);
      void fetchTickets();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadResult(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  // Scan
  const handleScan = async () => {
    if (!scanInput.trim()) return;
    try {
      const res = await bulkEmailApi.scan(scanInput.trim(), token);
      setScanResult(res);
      if (res.status === "success") {
        toast.success(`✅ Valid ticket — ${res.name}`);
        void fetchTickets();
      } else if (res.status === "already_used") {
        toast.error(`⚠️ Already used — ${res.name}`);
      } else {
        toast.error("❌ Invalid ticket ID");
      }
    } catch {
      toast.error("Scan failed");
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      sent: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
      failed: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
      pending: { bg: "rgba(234,179,8,0.15)", color: "#eab308" },
    };
    const c = colors[status] || colors.pending;
    return (
      <span style={{
        padding: "4px 10px", borderRadius: "999px", fontSize: "11px",
        fontWeight: 600, background: c.bg, color: c.color,
        textTransform: "capitalize" as const,
      }}>{status}</span>
    );
  };

  const inputStyle: React.CSSProperties = {
    padding: "10px 14px", borderRadius: "10px",
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff", fontSize: "13px", outline: "none", width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: "4px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "12px",
          background: "#FE9727",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Mail style={{ width: "20px", height: "20px", color: "#fff" }} />
        </div>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Bulk Email</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", margin: 0 }}>
            Upload CSV/XLSX → Generate QR tickets → Send emails
          </p>
        </div>
      </div>

      {/* SMTP Configuration */}
      <div style={{
        padding: "20px", borderRadius: "16px",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FE9727" }} />
          Email Configuration
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <p style={labelStyle}>Sender Email</p>
            <input value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="you@gmail.com" style={inputStyle} />
          </div>
          <div>
            <p style={labelStyle}>Sender Password / App Password</p>
            <input type="password" value={senderPassword} onChange={(e) => setSenderPassword(e.target.value)}
              placeholder="••••••••" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div style={{
        padding: "20px", borderRadius: "16px",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FE9727" }} />
          Upload Visitor File
        </h3>

        <label style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "32px", borderRadius: "12px", border: "2px dashed rgba(255,255,255,0.1)",
          cursor: "pointer", transition: "all 0.2s",
          background: file ? "rgba(34,197,94,0.05)" : "transparent",
        }}>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange}
            style={{ display: "none" }} />
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>{file ? "✅" : "📄"}</div>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", margin: 0 }}>
            {file ? file.name : "Click to select CSV or XLSX file"}
          </p>
          {totalRows > 0 && (
            <p style={{ fontSize: "12px", color: "#22c55e", margin: "4px 0 0" }}>
              {totalRows} visitor{totalRows !== 1 ? "s" : ""} detected
            </p>
          )}
        </label>

        {/* Preview table */}
        {previewRows.length > 0 && (
          <div style={{ marginTop: "16px", overflowX: "auto" }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>Preview (first 5 rows)</p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>
                  {Object.keys(previewRows[0]).map((k) => (
                    <th key={k} style={{
                      textAlign: "left", padding: "8px 12px",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.5)", fontWeight: 600,
                      textTransform: "capitalize" as const,
                    }}>{k.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} style={{
                        padding: "8px 12px",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.8)",
                      }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Upload button */}
        <button onClick={handleUpload} disabled={uploading || !file} style={{
          marginTop: "16px", padding: "12px 24px", borderRadius: "12px",
          border: "none", cursor: uploading ? "wait" : "pointer",
          background: !file ? "rgba(255,255,255,0.06)" : "#FE9727",
          color: "#fff", fontWeight: 600, fontSize: "14px", width: "100%",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          opacity: !file ? 0.4 : 1, transition: "all 0.2s",
        }}>
          {uploading ? (
            <>
              <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />
              Uploading & Queuing Emails...
            </>
          ) : (
            <>
              <Send style={{ width: "16px", height: "16px" }} />
              Upload & Send Emails
            </>
          )}
        </button>

        {uploadResult && (
          <p style={{
            marginTop: "12px", padding: "12px 16px", borderRadius: "10px",
            background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
            color: "#22c55e", fontSize: "13px",
          }}>{uploadResult}</p>
        )}
      </div>

      {/* QR Scan */}
      <div style={{
        padding: "20px", borderRadius: "16px",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FE9727" }} />
          Scan Ticket
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <input value={scanInput} onChange={(e) => setScanInput(e.target.value)}
            placeholder="Enter Ticket ID (e.g. RD26-A1B2C3)"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            style={{ ...inputStyle, flex: 1 }} />
          <button onClick={handleScan} style={{
            padding: "10px 20px", borderRadius: "10px", border: "none", cursor: "pointer",
            background: "#FE9727", color: "#fff",
            fontWeight: 600, fontSize: "13px", whiteSpace: "nowrap",
          }}>
            <QrCode style={{ width: "14px", height: "14px" }} /> Scan
          </button>
        </div>
        {scanResult && (
          <div style={{
            marginTop: "12px", padding: "12px 16px", borderRadius: "10px",
            background: scanResult.status === "success" ? "rgba(34,197,94,0.1)"
              : scanResult.status === "already_used" ? "rgba(234,179,8,0.1)"
              : "rgba(239,68,68,0.1)",
            border: `1px solid ${scanResult.status === "success" ? "rgba(34,197,94,0.2)"
              : scanResult.status === "already_used" ? "rgba(234,179,8,0.2)"
              : "rgba(239,68,68,0.2)"}`,
            fontSize: "13px",
            color: scanResult.status === "success" ? "#22c55e"
              : scanResult.status === "already_used" ? "#eab308"
              : "#ef4444",
          }}>
            {scanResult.status === "success" && `✅ Valid Ticket — Welcome, ${scanResult.name}!`}
            {scanResult.status === "already_used" && `⚠️ Already Used — ${scanResult.name}`}
            {scanResult.status === "invalid" && "❌ Invalid Ticket ID"}
          </div>
        )}
      </div>

      {/* Tickets Table */}
      <div style={{
        padding: "20px", borderRadius: "16px",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#FE9727" }} />
            Ticket History
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {tickets.some((t) => t.email_status === "pending" || t.email_status === "failed") && senderEmail && senderPassword && (
              <button onClick={async () => {
                try {
                  const res = await bulkEmailApi.retry({
                    event_id: eventId, smtp_host: smtpHost, smtp_port: parseInt(smtpPort),
                    sender_email: senderEmail, sender_password: senderPassword, provider,
                  }, token);
                  toast.success(res.message);
                  void fetchTickets();
                } catch { toast.error("Retry failed"); }
              }} style={{
                padding: "6px 14px", borderRadius: "8px", border: "none", cursor: "pointer",
                background: "rgba(234,179,8,0.15)", color: "#eab308",
                fontSize: "11px", fontWeight: 600,
              }}>🔄 Retry All</button>
            )}
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {loadingTickets ? (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Loading…</p>
        ) : tickets.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", textAlign: "center", padding: "32px" }}>
            No tickets yet. Upload a CSV/XLSX to get started.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>
                  {["Name", "Email", "Phone", "Ticket ID", "Email", "Scanned", "Created"].map((h) => (
                    <th key={h} style={{
                      textAlign: "left", padding: "10px 12px",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.5)", fontWeight: 600, whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "#fff", fontWeight: 500 }}>{t.name}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)" }}>{t.email}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.7)" }}>{t.phone}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <code style={{ background: "rgba(255,255,255,0.06)", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", color: "#FE9727", fontWeight: 600 }}>
                        {t.ticket_id}
                      </code>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{statusBadge(t.email_status)}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      {t.scanned ? (
                        <span style={{ color: "#22c55e", fontWeight: 600, fontSize: "11px" }}>✅ Yes</span>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", fontSize: "11px", whiteSpace: "nowrap" }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
