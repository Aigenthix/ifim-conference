"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Shirt, UserCircle, Mic, Users } from "lucide-react";
import type { EventLobby } from "@/lib/api";

type Speaker = { name: string; title?: string; bio?: string };
type TeamMember = { name: string; role?: string };
type ScheduleItem = { time: string; title: string; day: string };
type Overview = { venue?: string; dress_code?: string; schedule?: ScheduleItem[] };

export default function LobbyOverview({ lobby }: { lobby: EventLobby }) {
  const speakers = lobby.speakers as Speaker[] | null;
  const team = lobby.team as TeamMember[] | null;
  const overview = lobby.overview as Overview | null;

  const scheduleByDay: Record<string, ScheduleItem[]> = {};
  if (overview?.schedule) {
    for (const item of overview.schedule) {
      if (!scheduleByDay[item.day]) scheduleByDay[item.day] = [];
      scheduleByDay[item.day].push(item);
    }
  }

  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Hero Card */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" style={{
        borderRadius: "20px", background: "linear-gradient(135deg, #8B0000, #DC143C)",
        padding: "36px", color: "#fff", position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(139,0,0,0.25)",
      }}>
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, marginBottom: "10px", letterSpacing: "-0.5px" }}>
            {lobby.title}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", maxWidth: "600px", lineHeight: 1.7 }}>
            {lobby.description}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "20px" }}>
            <Pill icon={Calendar} text={new Date(lobby.starts_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
            <Pill icon={Clock} text={new Date(lobby.starts_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} />
            {overview?.venue && <Pill icon={MapPin} text={overview.venue} />}
            {overview?.dress_code && <Pill icon={Shirt} text={overview.dress_code} />}
          </div>
        </div>
      </motion.div>

      {/* Schedule */}
      {overview?.schedule && overview.schedule.length > 0 && (
        <Section title="Event Schedule" icon={Clock} delay={0.1}>
          {Object.entries(scheduleByDay).map(([day, items]) => (
            <div key={day} style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#DC143C", marginBottom: "10px", letterSpacing: "1px", textTransform: "uppercase" as const }}>
                {day}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {items.map((item, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "16px",
                    padding: "14px 18px", borderRadius: "12px", background: "#fafafa",
                    border: "1px solid #f0f0f0",
                  }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#8B0000", minWidth: "130px", fontFamily: "monospace" }}>{item.time}</span>
                    <span style={{ fontSize: "14px", color: "#333", fontWeight: 500 }}>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Speakers */}
      {speakers && speakers.length > 0 && (
        <Section title="Speakers" icon={Mic} delay={0.15}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
            {speakers.map((s, i) => (
              <div key={i} style={{
                borderRadius: "16px", padding: "24px", background: "#fafafa",
                border: "1px solid #f0f0f0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #8B0000, #DC143C)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 700, fontSize: "18px",
                  }}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: "15px", color: "#111" }}>{s.name}</h3>
                    {s.title && <p style={{ fontSize: "12px", color: "#8B0000", fontWeight: 500 }}>{s.title}</p>}
                  </div>
                </div>
                {s.bio && <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.7 }}>{s.bio}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Team */}
      {team && team.length > 0 && (
        <Section title="Team Behind the Event" icon={Users} delay={0.2}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" }}>
            {team.map((t, i) => (
              <div key={i} style={{
                borderRadius: "16px", padding: "20px", textAlign: "center" as const,
                background: "#fafafa", border: "1px solid #f0f0f0",
              }}>
                <div style={{
                  width: "44px", height: "44px", margin: "0 auto 10px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #DC143C, #FF6B6B)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: "16px",
                }}>
                  {t.name.charAt(0)}
                </div>
                <p style={{ fontWeight: 600, fontSize: "14px", color: "#111" }}>{t.name}</p>
                {t.role && <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>{t.role}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Pill({ icon: Icon, text }: { icon: React.ComponentType<{ style?: React.CSSProperties }>; text: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      padding: "8px 14px", borderRadius: "999px",
      background: "rgba(255,255,255,0.15)", fontSize: "12px", color: "#fff", fontWeight: 500,
    }}>
      <Icon style={{ width: "14px", height: "14px" }} />{text}
    </div>
  );
}

function Section({ title, icon: Icon, delay, children }: { title: string; icon: React.ComponentType<{ style?: React.CSSProperties }>; delay: number; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }} style={{
      borderRadius: "20px", background: "#fff", padding: "28px",
      border: "1px solid #eee", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px",
          background: "linear-gradient(135deg, #8B0000, #DC143C)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon style={{ width: "18px", height: "18px", color: "#fff" }} />
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}
