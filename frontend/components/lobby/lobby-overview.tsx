"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Shirt, Phone, Globe, Mic, Users, ChevronDown } from "lucide-react";
import type { EventLobby } from "@/lib/api";

type Speaker = { name: string; title?: string; bio?: string; image?: string };
type TeamMember = { name: string; role?: string };
type ScheduleItem = { time: string; title: string; day: string };
type Overview = { venue?: string; dress_code?: string; schedule?: ScheduleItem[] };

const SPEAKER_IMAGES: Record<string, string> = {
  "Hitesh Mali": "/speakers/hitesh-mali.png",
  "Siddharth Karnawat": "/speakers/siddharth-karnawat.png",
  "Nikhil Naik": "/speakers/nikhil-naik.png",
  "Jatin Popat": "/speakers/jatin-popat.png",
  "Rahul Agarwal": "/speakers/rahul-agarwal.png",
};

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
          {/* Logo — prominent with white bg */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <img src="/logo.png" alt="The Next Big Thing | Equitywala.com" style={{
              height: "60px", padding: "8px 12px", background: "rgba(255,255,255,0.95)",
              borderRadius: "12px", objectFit: "contain",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }} />
          </div>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, marginBottom: "6px", letterSpacing: "-0.5px" }}>
            {lobby.title}
          </h1>
          <p style={{ color: "#FFD700", fontSize: "16px", fontWeight: 600, fontStyle: "italic", marginBottom: "10px" }}>
            Time to Rule Your Segment
          </p>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", maxWidth: "600px", lineHeight: 1.7 }}>
            {lobby.description}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "20px" }}>
            <Pill icon={Calendar} text="27–28 February 2026" />
            <Pill icon={Clock} text="10:00 AM – 05:00 PM" />
            {overview?.venue && <Pill icon={MapPin} text={overview.venue} />}
            {overview?.dress_code && <Pill icon={Shirt} text={overview.dress_code} />}
          </div>
        </div>
      </motion.div>

      {/* Event Info Bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{
          display: "flex", flexWrap: "wrap", gap: "12px", padding: "16px 20px",
          borderRadius: "16px", background: "#fff", border: "1px solid #eee",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px" }}>
          <Phone style={{ width: "16px", height: "16px", color: "#8B0000" }} />
          <span style={{ fontSize: "13px", color: "#555" }}>9321064995</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px" }}>
          <Globe style={{ width: "16px", height: "16px", color: "#8B0000" }} />
          <span style={{ fontSize: "13px", color: "#555" }}>www.equitywala.com</span>
        </div>
        <div style={{ fontSize: "12px", color: "#DC143C", fontWeight: 600, fontStyle: "italic" }}>
          *Entry by Invitation Only
        </div>
      </motion.div>

      {/* Schedule with Dropdowns */}
      {overview?.schedule && overview.schedule.length > 0 && (
        <Section title="Event Schedule" icon={Clock} delay={0.1}>
          {Object.entries(scheduleByDay).map(([day, items], idx) => (
            <ScheduleDropdown key={day} day={day} items={items} defaultOpen={idx === 0} />
          ))}
        </Section>
      )}

      {/* Speakers */}
      {speakers && speakers.length > 0 && (
        <Section title="Speakers" icon={Mic} delay={0.15}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
            {speakers.map((s, i) => {
              const imgSrc = SPEAKER_IMAGES[s.name];
              return (
                <div key={i} style={{
                  borderRadius: "16px", padding: "24px", background: "#fafafa",
                  border: "1px solid #f0f0f0",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
                    {imgSrc ? (
                      <img src={imgSrc} alt={s.name} style={{
                        width: "56px", height: "56px", borderRadius: "50%",
                        objectFit: "cover", border: "3px solid #DC143C",
                      }} />
                    ) : (
                      <div style={{
                        width: "56px", height: "56px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #8B0000, #DC143C)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 700, fontSize: "20px",
                      }}>
                        {s.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 style={{ fontWeight: 600, fontSize: "15px", color: "#111" }}>{s.name}</h3>
                      {s.title && <p style={{ fontSize: "12px", color: "#8B0000", fontWeight: 500 }}>{s.title}</p>}
                    </div>
                  </div>
                  {s.bio && <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.7 }}>{s.bio}</p>}
                </div>
              );
            })}
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

/* ── Collapsible Schedule Dropdown ── */
function ScheduleDropdown({ day, items, defaultOpen }: { day: string; items: ScheduleItem[]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: "12px", borderRadius: "14px", border: "1px solid #f0f0f0", overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px", background: open ? "linear-gradient(135deg, #8B0000, #DC143C)" : "#fafafa",
        border: "none", cursor: "pointer", transition: "background 0.2s",
      }}>
        <span style={{
          fontSize: "13px", fontWeight: 700, letterSpacing: "0.5px",
          textTransform: "uppercase" as const,
          color: open ? "#fff" : "#DC143C",
        }}>
          {day}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", color: open ? "rgba(255,255,255,0.7)" : "#999" }}>
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
          <ChevronDown style={{
            width: "18px", height: "18px",
            color: open ? "#fff" : "#999",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }} />
        </div>
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "8px" }}>
          {items.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "16px",
              padding: "12px 14px", borderRadius: "10px", background: "#fff",
              border: "1px solid #f5f5f5",
            }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#8B0000", minWidth: "130px", fontFamily: "monospace" }}>{item.time}</span>
              <span style={{ fontSize: "14px", color: "#333", fontWeight: 500 }}>{item.title}</span>
            </div>
          ))}
        </div>
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
