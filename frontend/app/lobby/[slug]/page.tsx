"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BarChart3, Image, MessageSquare, Award, LogOut, Mic, Bell, Compass, HelpCircle, MessageCircle, LayoutDashboard, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { eventsApi, alertsApi } from "@/lib/api";
import type { EventLobby } from "@/lib/api";

import LobbyOverview from "@/components/lobby/lobby-overview";
import DashboardSection from "@/components/lobby/dashboard-section";
import LivePolls from "@/components/polls/live-polls";
import GallerySection from "@/components/lobby/gallery-section";
import FeedbackSection from "@/components/lobby/feedback-section";
import CertificateSection from "@/components/lobby/certificate-section";
import SessionsSection from "@/components/lobby/sessions-section";
import AlertsSection from "@/components/lobby/alerts-section";
import StrategyCompassSection from "@/components/lobby/strategy-compass-section";
import ChatbotFAB from "@/components/chatbot/chatbot-fab";
import QASection from "@/components/lobby/qa-section";
import CommunityChatSection from "@/components/lobby/community-chat-section";

const ALERT_POLL_BASE_MS = 12_000;

const SECTIONS = [
  { id: "overview", label: "Overview", icon: Home },
  // { id: "sessions", label: "Sessions", icon: Mic },
  // { id: "polls", label: "Live Polls", icon: BarChart3 },
  // { id: "strategy-compass", label: "Strategy Compass", icon: Compass },
  // { id: "alerts", label: "Alerts", icon: Bell },
  // { id: "gallery", label: "Gallery", icon: Image },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "certificate", label: "Certificate", icon: Award },
  // { id: "qa", label: "Q&A", icon: HelpCircle },
  // { id: "community", label: "Community Chat", icon: MessageCircle },
  // { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
] as const;

type Section = typeof SECTIONS[number]["id"];

export default function LobbyPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { token, logout, _hasHydrated } = useAuthStore();
  const [slug, setSlug] = useState<string | null>(null);
  const [lobby, setLobby] = useState<EventLobby | null>(null);
  const [active, setActive] = useState<Section>("overview");
  const [loading, setLoading] = useState(true);
  const lastAlertIdRef = useRef<string | null>(null);
  const mobileBarRef = useRef<HTMLDivElement>(null);
  const [showRightFade, setShowRightFade] = useState(true);

  const handleMobileScroll = () => {
    if (mobileBarRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = mobileBarRef.current;
      setShowRightFade(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    handleMobileScroll();
    window.addEventListener('resize', handleMobileScroll);
    return () => window.removeEventListener('resize', handleMobileScroll);
  }, [lobby]);

  useEffect(() => { params.then((p) => setSlug(p.slug)); }, [params]);

  // ── Live Alert Popup ─────────────────────────────────
  useEffect(() => {
    if (!token || !lobby) return;
    const eventId = lobby.id;

    const pollAlerts = async () => {
      try {
        const data = await alertsApi.getEventAlerts(eventId, token);
        const alerts = data?.alerts ?? [];
        if (alerts.length > 0) {
          const latest = alerts[0];
          if (lastAlertIdRef.current && lastAlertIdRef.current !== latest.id) {
            // New alert detected — show popup
            toast(
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                  background: "#FE9727",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Bell style={{ width: "18px", height: "18px", color: "#fff" }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "14px", margin: "0 0 4px", color: "#111" }}>{latest.title}</p>
                  <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>{latest.message}</p>
                </div>
              </div>,
              {
                duration: 8000,
                position: "top-center",
                style: {
                  background: "#fff",
                  border: "1px solid #fed7aa",
                  boxShadow: "0 8px 32px rgba(254,151,39,0.15)",
                  borderRadius: "14px",
                  padding: "16px",
                },
              }
            );
          }
          lastAlertIdRef.current = latest.id;
        }
      } catch { /* ignore polling errors */ }
    };

    let timer: number | null = null;
    let active = true;
    const scheduleNext = () => {
      if (!active) return;
      const jitter = Math.floor(Math.random() * 2_500);
      timer = window.setTimeout(() => {
        void tick();
      }, ALERT_POLL_BASE_MS + jitter);
    };

    const tick = async () => {
      if (!active) return;
      if (document.visibilityState === "visible") {
        await pollAlerts();
      }
      scheduleNext();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void pollAlerts();
      }
    };

    void pollAlerts(); // initial fetch to seed lastAlertIdRef
    scheduleNext();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      active = false;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [token, lobby]);

  useEffect(() => {
    if (!_hasHydrated || !slug) return; // wait for zustand to rehydrate from localStorage
    if (!token) { router.replace(`/register/${slug}`); return; }
    eventsApi
      .getLobby(slug, token)
      .then(setLobby)
      .catch(() => {
        logout();
        router.replace(`/register/${slug}`);
      })
      .finally(() => setLoading(false));
  }, [token, slug, router, _hasHydrated, logout]);

  if (loading || !lobby) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid #eee", borderTopColor: "#FE9727", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#888", fontSize: "14px" }}>Loading event...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#f5f5f5", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Responsive Styles */}
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        .topbar-nav {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 168px minmax(0, 1fr) 168px;
          align-items: center;
          gap: 10px;
          padding: 0 16px;
          height: 62px;
        }
        .topbar-left {
          width: 168px;
          display: flex;
          align-items: center;
        }
        .topbar-logo {
          height: 36px;
          width: auto;
          border-radius: 8px;
          flex-shrink: 0;
          object-fit: contain;
          background: rgba(255,255,255,0.92);
          padding: 4px 8px;
        }
        .desktop-tabs-shell {
          min-width: 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          display: flex;
          justify-content: flex-start;
        }
        .desktop-tabs-shell::-webkit-scrollbar { display: none; }
        .desktop-tabs {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-width: max-content;
          padding: 2px;
          margin: 0 auto;
        }
        .desktop-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 36px;
          padding: 0 13px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          line-height: 1;
          transition: all 0.18s;
          white-space: nowrap;
        }
        .topbar-right {
          width: 168px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }
        .topbar-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.16);
          font-size: 12px;
          color: #fff;
          font-weight: 600;
          line-height: 1;
        }
        .topbar-logout-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.82);
          background: rgba(255,255,255,0.12);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.18s;
        }
        .topbar-logout-btn:hover {
          background: rgba(255,255,255,0.2);
          color: #fff;
        }

        .mobile-bottom-bar { display: none; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; scrollbar-width: none; scroll-snap-type: x proximity; }
        .mobile-bottom-bar::-webkit-scrollbar { display: none; }
        .mobile-tab-track { display: flex; align-items: center; gap: 6px; min-width: max-content; padding: 0 2px; }
        .mobile-tab-btn { flex: 0 0 auto; min-width: 82px; max-width: 96px; scroll-snap-align: start; }
        .mobile-tab-label { display: block; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mobile-scroll-indicator { display: none !important; }
        .header-logo-text { display: block; }

        @media (max-width: 900px) {
          .header-logo-text { display: none !important; }
          .topbar-nav {
            grid-template-columns: 142px minmax(0, 1fr) 142px;
            padding: 0 12px;
          }
          .topbar-left,
          .topbar-right {
            width: 142px;
          }
          .desktop-tab-btn {
            height: 34px;
            padding: 0 11px;
            font-size: 11px;
          }
        }
        @media (max-width: 768px) {
          .topbar-nav {
            height: 56px;
            grid-template-columns: 1fr auto;
            gap: 8px;
          }
          .topbar-left,
          .topbar-right {
            width: auto;
          }
          .desktop-tabs-shell { display: none !important; }
          .topbar-live-pill { display: none; }
          .mobile-bottom-bar { display: flex !important; }
          .mobile-scroll-indicator { display: flex !important; }
        }
      `}</style>

      {/* Header — compact on mobile */}
      <header style={{
        background: "linear-gradient(135deg, #1a1040, #2d1b69)",
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 4px 20px rgba(26,16,64,0.4)",
      }}>
        <nav className="topbar-nav">
          {/* Logo */}
          <div className="topbar-left">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/logo.png" alt="Bharat Synapse Logo" className="topbar-logo" style={{ maxHeight: "36px", width: "auto" }} />
            <img src="/event.png" alt="Bharat Synapse Event" className="topbar-logo" style={{ maxHeight: "36px", width: "auto" }} />
          </div>
          </div>

          {/* Desktop Tabs */}
          <div className="desktop-tabs-shell">
            <div className="desktop-tabs">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    className="desktop-tab-btn"
                    onClick={() => setActive(s.id)}
                    style={{
                      color: isActive ? "#fff" : "rgba(255,255,255,0.8)",
                      background: isActive ? "rgba(255,255,255,0.22)" : "transparent",
                    }}
                  >
                    <Icon style={{ width: "14px", height: "14px", flexShrink: 0 }} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="topbar-right">
            {lobby.is_active && (
              <div className="topbar-live-pill">
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", animation: "pulse 2s infinite" }} />Live
              </div>
            )}
            <button
              className="topbar-logout-btn"
              onClick={() => { logout(); if (slug) router.replace(`/register/${slug}`); }}
              aria-label="Logout"
            >
              <LogOut style={{ width: "16px", height: "16px" }} />
            </button>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main style={{ maxWidth: "1080px", margin: "0 auto", padding: "20px 16px 118px" }}>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            {active === "overview" && <LobbyOverview lobby={lobby} />}
            {/* {active === "dashboard" && (
              <DashboardSection eventSlug={lobby.slug} eventId={lobby.id} token={token ?? ""} />
            )} */}
            {/* {active === "sessions" && <SessionsSection eventId={lobby.id} />}
            {active === "polls" && <LivePolls eventId={lobby.id} />}
            {active === "strategy-compass" && (
              <StrategyCompassSection eventSlug={lobby.slug} token={token ?? ""} />
            )}
            {active === "alerts" && <AlertsSection eventId={lobby.id} />}
            {active === "gallery" && <GallerySection eventId={lobby.id} />} */}
            {active === "feedback" && <FeedbackSection eventId={lobby.id} />}
            {active === "certificate" && <CertificateSection eventId={lobby.id} />}
            {/* {active === "qa" && <QASection eventId={lobby.id} />}
            {active === "community" && <CommunityChatSection eventId={lobby.id} />} */}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div 
        ref={mobileBarRef}
        onScroll={handleMobileScroll}
        className="mobile-bottom-bar" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "#fff",
        borderTop: "1px solid #eee",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        display: "none", /* overridden by CSS class on mobile */
        alignItems: "center",
        padding: "6px 8px max(6px, env(safe-area-inset-bottom))",
        touchAction: "pan-x",
      }}>
        <div className="mobile-tab-track">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.id;
            return (
              <button key={s.id} className="mobile-tab-btn" onClick={() => setActive(s.id)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
                padding: "6px 8px", border: "none", cursor: "pointer",
                background: "transparent", borderRadius: "10px",
                transition: "all 0.15s",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isActive ? "#FE9727" : "transparent",
                  transition: "all 0.2s",
                }}>
                  <Icon style={{
                    width: "18px", height: "18px",
                    color: isActive ? "#fff" : "#999",
                    transition: "color 0.15s",
                  }} />
                </div>
                <span className="mobile-tab-label" style={{
                  fontSize: "10px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#000000" : "#999",
                  letterSpacing: "-0.2px",
                  transition: "all 0.15s",
                }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scroll indicator overlay */}
      {showRightFade && (
        <div className="mobile-scroll-indicator" style={{
          position: "fixed", bottom: 0, right: 0, zIndex: 51,
          height: "calc(max(6px, env(safe-area-inset-bottom)) + 58px)",
          width: "48px",
          background: "linear-gradient(to right, transparent, rgba(255,255,255,0.95) 40%, #fff)",
          display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "10px",
          pointerEvents: "none"
        }}>
          <MoreHorizontal style={{ color: "#aaa", width: "20px" }} />
        </div>
      )}

      <ChatbotFAB eventId={lobby.id} />
    </div>
  );
}
