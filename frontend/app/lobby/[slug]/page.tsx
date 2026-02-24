"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BarChart3, Image, MessageSquare, Award, Menu, X, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { eventsApi } from "@/lib/api";
import type { EventLobby } from "@/lib/api";

import LobbyOverview from "@/components/lobby/lobby-overview";
import LivePolls from "@/components/polls/live-polls";
import GallerySection from "@/components/lobby/gallery-section";
import FeedbackSection from "@/components/lobby/feedback-section";
import CertificateSection from "@/components/lobby/certificate-section";
import ChatbotFAB from "@/components/chatbot/chatbot-fab";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "polls", label: "Live Polls", icon: BarChart3 },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
  { id: "certificate", label: "Certificate", icon: Award },
] as const;

type Section = typeof SECTIONS[number]["id"];

export default function LobbyPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const [slug, setSlug] = useState<string | null>(null);
  const [lobby, setLobby] = useState<EventLobby | null>(null);
  const [active, setActive] = useState<Section>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { params.then((p) => setSlug(p.slug)); }, [params]);

  useEffect(() => {
    if (!token || !slug) { if (slug) router.replace(`/register/${slug}`); return; }
    eventsApi
      .getLobby(slug, token)
      .then(setLobby)
      .catch(() => router.replace(`/register/${slug}`))
      .finally(() => setLoading(false));
  }, [token, slug, router]);

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
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #8B0000, #DC143C)",
        position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 4px 20px rgba(139,0,0,0.3)",
      }}>
        <nav style={{
          maxWidth: "1080px", margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", height: "60px",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "14px", color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
            }}>RD</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "#fff", lineHeight: 1.2 }}>{lobby.title}</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
                {new Date(lobby.starts_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — {new Date(lobby.ends_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:flex" style={{ display: "flex", gap: "2px" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {lobby.is_active && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "999px", background: "rgba(255,255,255,0.15)", fontSize: "12px", color: "#fff", fontWeight: 500 }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 6px #4ade80", animation: "pulse 2s infinite" }} />Live
              </div>
            )}
            <button onClick={() => { logout(); if (slug) router.replace(`/register/${slug}`); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}>
              <LogOut style={{ width: "16px", height: "16px" }} />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden" style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: "4px" }}>
              {mobileOpen ? <X style={{ width: "22px", height: "22px" }} /> : <Menu style={{ width: "22px", height: "22px" }} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="md:hidden" style={{ overflow: "hidden" }}>
              <div style={{ padding: "4px 12px 12px" }}>
                {SECTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button key={s.id} onClick={() => { setActive(s.id); setMobileOpen(false); }} style={{
                      display: "flex", alignItems: "center", gap: "12px", width: "100%",
                      padding: "12px 16px", borderRadius: "10px", border: "none", cursor: "pointer",
                      fontSize: "14px", fontWeight: active === s.id ? 600 : 400,
                      color: active === s.id ? "#fff" : "rgba(255,255,255,0.7)",
                      background: active === s.id ? "rgba(255,255,255,0.15)" : "transparent",
                      textAlign: "left" as const, marginBottom: "2px",
                    }}>
                      <Icon style={{ width: "18px", height: "18px" }} />{s.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>

      {/* Content */}
      <main style={{ maxWidth: "1080px", margin: "0 auto", padding: "28px 20px 100px" }}>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            {active === "overview" && <LobbyOverview lobby={lobby} />}
            {active === "polls" && <LivePolls eventId={lobby.id} />}
            {active === "gallery" && <GallerySection eventId={lobby.id} />}
            {active === "feedback" && <FeedbackSection eventId={lobby.id} />}
            {active === "certificate" && <CertificateSection eventId={lobby.id} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <ChatbotFAB eventId={lobby.id} />
    </div>
  );
}
