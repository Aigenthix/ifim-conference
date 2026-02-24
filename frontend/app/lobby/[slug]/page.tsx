"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BarChart3, Image, MessageSquare, Award, LogOut, Mic, Bell, Compass } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { eventsApi } from "@/lib/api";
import type { EventLobby } from "@/lib/api";

import LobbyOverview from "@/components/lobby/lobby-overview";
import LivePolls from "@/components/polls/live-polls";
import GallerySection from "@/components/lobby/gallery-section";
import FeedbackSection from "@/components/lobby/feedback-section";
import CertificateSection from "@/components/lobby/certificate-section";
import SessionsSection from "@/components/lobby/sessions-section";
import AlertsSection from "@/components/lobby/alerts-section";
import StrategyCompassSection from "@/components/lobby/strategy-compass-section";
import ChatbotFAB from "@/components/chatbot/chatbot-fab";
import { GoldCoinRain } from "@/components/ui/gold-coin-rain";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "sessions", label: "Sessions", icon: Mic },
  { id: "polls", label: "Live Polls", icon: BarChart3 },
  { id: "strategy-compass", label: "Strategy Compass", icon: Compass },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "certificate", label: "Certificate", icon: Award },
] as const;

type Section = typeof SECTIONS[number]["id"];

export default function LobbyPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { token, logout, _hasHydrated } = useAuthStore();
  const [slug, setSlug] = useState<string | null>(null);
  const [lobby, setLobby] = useState<EventLobby | null>(null);
  const [active, setActive] = useState<Section>("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => { params.then((p) => setSlug(p.slug)); }, [params]);

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
          <div style={{ width: "36px", height: "36px", border: "3px solid #eee", borderTopColor: "#DC143C", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
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

        .desktop-tabs { display: flex; gap: 2px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .desktop-tabs::-webkit-scrollbar { display: none; }
        .mobile-bottom-bar { display: none; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; scrollbar-width: none; scroll-snap-type: x proximity; }
        .mobile-bottom-bar::-webkit-scrollbar { display: none; }
        .mobile-tab-track { display: flex; align-items: center; gap: 6px; min-width: max-content; padding: 0 2px; }
        .mobile-tab-btn { flex: 0 0 auto; min-width: 82px; max-width: 96px; scroll-snap-align: start; }
        .mobile-tab-label { display: block; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .header-logo-text { display: block; }

        @media (max-width: 900px) {
          .header-logo-text { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-tabs { display: none !important; }
          .mobile-bottom-bar { display: flex !important; }
        }
      `}</style>

      {/* Header — compact on mobile */}
      <header style={{
        background: "linear-gradient(135deg, #8B0000, #DC143C)",
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 4px 20px rgba(139,0,0,0.3)",
      }}>
        <nav style={{
          maxWidth: "1080px", margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 16px", height: "56px",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <img src="/logo.png" alt="Raj Darbar" style={{
              height: "32px", width: "auto", borderRadius: "6px", flexShrink: 0,
              objectFit: "contain", background: "rgba(255,255,255,0.9)",
              padding: "3px 6px",
            }} />

          </div>

          {/* Desktop Tabs */}
          <div className="desktop-tabs">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <button key={s.id} onClick={() => setActive(s.id)} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", borderRadius: "10px", border: "none", cursor: "pointer",
                  fontSize: "13px", fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                  background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                  transition: "all 0.15s",
                }}>
                  <Icon style={{ width: "15px", height: "15px" }} />{s.label}
                </button>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {lobby.is_active && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.15)", fontSize: "12px", color: "#fff", fontWeight: 500 }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", animation: "pulse 2s infinite" }} />Live
              </div>
            )}
            <button onClick={() => { logout(); if (slug) router.replace(`/register/${slug}`); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}>
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
            {active === "sessions" && <SessionsSection eventId={lobby.id} />}
            {active === "polls" && <LivePolls eventId={lobby.id} />}
            {active === "strategy-compass" && (
              <StrategyCompassSection eventSlug={lobby.slug} token={token ?? ""} />
            )}
            {active === "alerts" && <AlertsSection eventId={lobby.id} />}
            {active === "gallery" && <GallerySection eventId={lobby.id} />}
            {active === "feedback" && <FeedbackSection eventId={lobby.id} />}
            {active === "certificate" && <CertificateSection eventId={lobby.id} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <div className="mobile-bottom-bar" style={{
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
                  background: isActive ? "linear-gradient(135deg, #8B0000, #DC143C)" : "transparent",
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
                  color: isActive ? "#8B0000" : "#999",
                  letterSpacing: "-0.2px",
                  transition: "all 0.15s",
                }}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <ChatbotFAB eventId={lobby.id} />
      <GoldCoinRain />
    </div>
  );
}
