"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Shirt, Phone, Globe, Mic, Users, ChevronDown, Sparkles, QrCode, X } from "lucide-react";
import type { EventLobby } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
type Speaker = { name: string; title?: string; bio?: string; image?: string };
type TeamMember = { name: string; role?: string };
type ScheduleItem = { time: string; title: string; day: string };
type Overview = { venue?: string; dress_code?: string; schedule?: ScheduleItem[] };

const SPEAKER_IMAGES: Record<string, string> = {};

const SPEAKER_BIOS: Record<string, string> = {};

export default function LobbyOverview({ lobby }: { lobby: EventLobby }) {
  const { userId, eventId, userName, userEmail, userPhone, userCompany, userFoodPreference, userTshirtSize, userGrowthFocus } = useAuthStore();

  // Generate QR code URL encoding user profile as vCard
  const qrCodeUrl = useMemo(() => {
    if (!userName) return null;
    const vCard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${userName}`,
      userEmail ? `EMAIL:${userEmail}` : "",
      userPhone ? `TEL:${userPhone}` : "",
      userCompany ? `ORG:${userCompany}` : "",
      userId ? `X-USER-ID:${userId}` : "",
      eventId ? `X-EVENT-ID:${eventId}` : "",
      userFoodPreference ? `NOTE:Food: ${userFoodPreference}; T-Shirt: ${userTshirtSize || "N/A"}; Growth Focus: ${userGrowthFocus || "N/A"}` : "",
      "END:VCARD",
    ].filter(Boolean).join("\n");
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(vCard)}`;
  }, [eventId, userId, userName, userEmail, userPhone, userCompany, userFoodPreference, userTshirtSize, userGrowthFocus]);
  const [showQr, setShowQr] = useState(false);
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
      {/* Welcome Banner */}
      {userName && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{
          borderRadius: "16px",
          background: "#ffffff",
          padding: "24px 28px",
          boxShadow: "0 4px 20px rgba(254,151,39,0.1)",
          border: "1px solid #fed7aa",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: "#FE9727",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Sparkles style={{ width: "20px", height: "20px", color: "#fff" }} />
            </div>
            <div>
              <h2 style={{
                fontSize: "18px", fontWeight: 800, color: "#000000",
                margin: 0, lineHeight: 1.3,
              }}>
                {userName}, Welcome to Bharat Synapse@2047
              </h2>
              <p style={{
                fontSize: "13px", color: "#FE9727", margin: "6px 0 0",
                lineHeight: 1.5, opacity: 0.85,
              }}>
                A national interdisciplinary academic platform for India&apos;s future.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* QR Code Profile Card */}
      {userName && qrCodeUrl && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" style={{
          borderRadius: "16px", background: "#fff", padding: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "#FE9727",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <QrCode style={{ width: "16px", height: "16px", color: "#fff" }} />
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Your Event Badge</h3>
            </div>
            <button
              onClick={() => setShowQr(!showQr)}
              style={{
                padding: "8px 18px", borderRadius: "10px", border: "none",
                background: showQr ? "#f0f0f0" : "#FE9727",
                color: showQr ? "#666" : "#fff",
                fontSize: "13px", fontWeight: 600, cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {showQr ? "Hide QR" : "Generate QR"}
            </button>
          </div>

          {showQr && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: "20px" }}
            >
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "center" }}>
                {/* QR Code */}
                <div style={{
                  padding: "12px", borderRadius: "12px", background: "#f9f9f9",
                  border: "1px solid #eee", flexShrink: 0, margin: "0 auto",
                }}>
                  <img src={qrCodeUrl} alt="Profile QR Code" width={160} height={160}
                    style={{ display: "block", borderRadius: "8px" }} />
                  <p style={{ fontSize: "10px", color: "#999", textAlign: "center", margin: "8px 0 0" }}>
                    Scan to view profile
                  </p>
                </div>

                {/* Profile Details */}
                <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <ProfileRow icon="👤" label="Name" value={userName} />
                  {userCompany && <ProfileRow icon="🏢" label="Company" value={userCompany} />}
                  {userEmail && <ProfileRow icon="📧" label="Email" value={userEmail} />}
                  {userPhone && <ProfileRow icon="📱" label="Phone" value={userPhone} />}
                  {userFoodPreference && <ProfileRow icon="🍽️" label="Food" value={userFoodPreference} />}
                  {userTshirtSize && <ProfileRow icon="👕" label="T-Shirt" value={userTshirtSize} />}
                  {userGrowthFocus && <ProfileRow icon="🎯" label="Growth Focus" value={userGrowthFocus} />}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Hero Card */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" style={{
        borderRadius: "20px", background: "#FE9727",
        padding: "36px", color: "#fff", position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(254,151,39,0.25)",
      }}>
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "relative" }}>
          {/* Logos — prominent with white bg */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <img src="/logo.png" alt="Bharat Synapse Logo" style={{
              height: "60px", padding: "8px 12px", background: "rgba(255,255,255,0.95)",
              borderRadius: "12px", objectFit: "contain",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }} />
            <img src="/event.png" alt="Bharat Synapse Event" style={{
              height: "60px", padding: "8px 12px", background: "rgba(255,255,255,0.95)",
              borderRadius: "12px", objectFit: "contain",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }} />
          </div>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, marginBottom: "6px", letterSpacing: "-0.5px" }}>
            {lobby.title}
          </h1>
          <p style={{ color: "#FE9727", fontSize: "16px", fontWeight: 600, fontStyle: "italic", marginBottom: "10px" }}>
            Contours of a Future-ready Bharat
          </p>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", maxWidth: "600px", lineHeight: 1.7 }}>
            {lobby.description}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "20px" }}>
            <Pill icon={Calendar} text="5–6 March 2026" />
            <Pill icon={Clock} text="Day 1: 2:30–4:00 PM • Day 2: 10:00 AM–1:15 PM" />
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
          <Phone style={{ width: "16px", height: "16px", color: "#000000" }} />
          <span style={{ fontSize: "13px", color: "#555" }}>+91 9742111344</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px" }}>
          <Globe style={{ width: "16px", height: "16px", color: "#000000" }} />
          <span style={{ fontSize: "13px", color: "#555" }}>www.ifimbharatsynapse2047.com</span>
        </div>
        <div style={{ fontSize: "12px", color: "#FE9727", fontWeight: 600, fontStyle: "italic" }}>
          viksitbharat2026@ifim.edu.in
        </div>
      </motion.div>

      {/* Embedded Conference Papers */}
      <Section title="Conference Paper Presentation Details" icon={Calendar} delay={0.08}>
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #eaeaea", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", backgroundColor: "#fff" }}>
            <div style={{ padding: "16px 20px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", borderBottom: "1px solid #eaeaea", backgroundColor: "#fafafa" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#222" }}>Bharat Synapse@2047 - Presentation Details</span>
              </div>
              <a
                href="/conference-paper-1.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", borderRadius: "10px",
                  background: "#FE9727", color: "#fff",
                  fontSize: "13px", fontWeight: 600,
                  textDecoration: "none", whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(254,151,39,0.3)"
                }}
              >
                View / Download PDF ›
              </a>
            </div>
            <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <iframe
                src="/conference-paper-1.pdf#view=FitH&toolbar=0"
                style={{ width: "100%", minWidth: "100%", height: "650px", border: "none", display: "block", backgroundColor: "#f8f9fa", maxWidth: "100vw" }}
                title="Bharat Synapse@2047 Paper"
              />
            </div>
          </div>

          <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #eaeaea", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", backgroundColor: "#fff" }}>
            <div style={{ padding: "16px 20px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", borderBottom: "1px solid #eaeaea", backgroundColor: "#fafafa" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#222" }}>Bharat Synapse Paper Schedule (Final)</span>
              </div>
              <a
                href="/conference-paper-2.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", borderRadius: "10px",
                  background: "#FE9727", color: "#fff",
                  fontSize: "13px", fontWeight: 600,
                  textDecoration: "none", whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(254,151,39,0.3)"
                }}
              >
                View / Download PDF ›
              </a>
            </div>
            <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <iframe
                src="/conference-paper-2.pdf#view=FitH&toolbar=0"
                style={{ width: "100%", minWidth: "100%", height: "650px", border: "none", display: "block", backgroundColor: "#f8f9fa", maxWidth: "100vw" }}
                title="Bharat Synapse Schedule"
              />
            </div>
          </div>
        </div>
      </Section>

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
            {speakers.map((s, i) => (
              <SpeakerCard key={i} speaker={s} />
            ))}
          </div>
        </Section>
      )}

      {/* Panel Discussions */}
      <Section title="Panel Discussions" icon={Users} delay={0.2}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Panel 1 */}
          <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #eaeaea", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", backgroundColor: "#fff" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eaeaea", backgroundColor: "#fafafa" }}>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#111", marginBottom: "4px" }}>Panel Discussion</div>
              <div style={{ fontWeight: 600, fontSize: "14px", color: "#FE9727" }}>Topic: Role of AI in Achieving Viksit Bharat 2047 Goals</div>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ fontWeight: 600, fontSize: "14px", color: "#333", marginBottom: "12px" }}>Panelists:</div>
              <ul style={{ listStyleType: "none", paddingLeft: "0", display: "flex", flexDirection: "column", gap: "10px", margin: 0 }}>
                <li style={{ fontSize: "14px", color: "#444", display: "flex", alignItems: "flex-start", gap: "8px" }}><span style={{ color: "#FE9727", marginTop: "-2px" }}>•</span> <span><strong>Mr. Pranav Padode</strong>, Board Member, CDE</span></li>
                <li style={{ fontSize: "14px", color: "#444", display: "flex", alignItems: "flex-start", gap: "8px" }}><span style={{ color: "#FE9727", marginTop: "-2px" }}>•</span> <span><strong>Dr. A V Arun Kumar</strong>, Director, IFIM College</span></li>
                <li style={{ fontSize: "14px", color: "#444", display: "flex", alignItems: "flex-start", gap: "8px" }}><span style={{ color: "#FE9727", marginTop: "-2px" }}>•</span> <span><strong>Dr. Sridevi Varanasi</strong>, Academic Dean, JAGSOM</span></li>
                <li style={{ fontSize: "14px", color: "#444", display: "flex", alignItems: "flex-start", gap: "8px" }}><span style={{ color: "#FE9727", marginTop: "-2px" }}>•</span> <span><strong>Dr. Nilima Panchal</strong>, Prof. & Head, Dept. of Public Policy & Governance, Gujarat University</span></li>
                <li style={{ fontSize: "14px", color: "#444", display: "flex", alignItems: "flex-start", gap: "8px" }}><span style={{ color: "#FE9727", marginTop: "-2px" }}>•</span> <span><strong>Prof. Nikil Gupta</strong>, Professor of Practice, IFIM College</span></li>
              </ul>
            </div>
          </div>

          {/* Panel 2 */}
          <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #eaeaea", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", backgroundColor: "#fff" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #eaeaea", backgroundColor: "#fafafa" }}>
              <div style={{ fontWeight: 700, fontSize: "16px", color: "#111", marginBottom: "4px" }}>Panel Discussion</div>
              <div style={{ fontWeight: 600, fontSize: "14px", color: "#FE9727" }}>Topic: AI Enabled workforce across domains: Challenges and Opportunities</div>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ fontWeight: 600, fontSize: "14px", color: "#333", marginBottom: "12px" }}>Panelists:</div>
              <ul style={{ listStyleType: "none", paddingLeft: "0", display: "flex", flexDirection: "column", gap: "10px", margin: 0 }}>
                <li style={{ fontSize: "14px", color: "#444", display: "flex", alignItems: "flex-start", gap: "8px" }}><span style={{ color: "#FE9727", marginTop: "-2px" }}>•</span> <span><strong>Dr. Sakkthivel A M</strong>, Principal, IFIM College</span></li>
                <li style={{ fontSize: "14px", color: "#444", display: "flex", alignItems: "flex-start", gap: "8px" }}><span style={{ color: "#FE9727", marginTop: "-2px" }}>•</span> <span><strong>Dr. Tapan Nayak</strong>, Director, ISBR</span></li>
                <li style={{ fontSize: "14px", color: "#444", display: "flex", alignItems: "flex-start", gap: "8px" }}><span style={{ color: "#FE9727", marginTop: "-2px" }}>•</span> <span><strong>Dr Arpit Deepak Yadav</strong>, Assistant Professor in IT and Analytics, IFIM College</span></li>
                <li style={{ fontSize: "14px", color: "#444", display: "flex", alignItems: "flex-start", gap: "8px" }}><span style={{ color: "#FE9727", marginTop: "-2px" }}>•</span> <span><strong>Srinivas K</strong>, Finance Planning & Analysis Manager, Hewlett-Packard (HP)</span></li>
                <li style={{ fontSize: "14px", color: "#444", display: "flex", alignItems: "flex-start", gap: "8px" }}><span style={{ color: "#FE9727", marginTop: "-2px" }}>•</span> <span><strong>Nitish Mathur</strong>, CEO, 3Cans | AI, XR & Marketing Strategist</span></li>
              </ul>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ── Speaker Card with Modal Bio ── */
function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const [openBio, setOpenBio] = useState(false);
  const imgSrc = SPEAKER_IMAGES[speaker.name];
  const speakerBio = speaker.bio || SPEAKER_BIOS[speaker.name] || "";
  const bioParagraphs = useMemo(
    () =>
      speakerBio
        .split(/\n{2,}/)
        .map((part) => part.trim())
        .filter(Boolean),
    [speakerBio]
  );
  const previewText = useMemo(() => {
    const firstParagraph = bioParagraphs[0] || "";
    if (!firstParagraph) return "Speaker details coming soon.";
    return firstParagraph.length > 160 ? `${firstParagraph.slice(0, 160)}...` : firstParagraph;
  }, [bioParagraphs]);
  const hasBio = bioParagraphs.length > 0;

  return (
    <>
      <div
        style={{
          borderRadius: "16px",
          padding: "18px",
          background: "#fafafa",
          border: "1px solid #f0f0f0",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          minHeight: "214px",
          transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          {imgSrc ? (
            <img src={imgSrc} alt={speaker.name} style={{
              width: "56px", height: "56px", borderRadius: "50%",
              objectFit: "cover", border: "3px solid #FE9727", flexShrink: 0,
            }} />
          ) : (
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%",
              background: "#FE9727",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: "20px", flexShrink: 0,
            }}>
              {speaker.name.charAt(0)}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontWeight: 700, fontSize: "22px", color: "#111", lineHeight: 1.2, margin: 0 }}>
              {speaker.name}
            </h3>
            {speaker.title && (
              <p style={{ fontSize: "13px", color: "#000000", fontWeight: 600, marginTop: "5px", marginBottom: 0 }}>
                {speaker.title}
              </p>
            )}
          </div>
        </div>
        <p
          style={{
            fontSize: "13px",
            color: "#5a5a5a",
            lineHeight: 1.65,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "84px",
          }}
        >
          {previewText}
        </p>
        <button
          type="button"
          onClick={() => {
            if (!hasBio) return;
            setOpenBio(true);
          }}
          disabled={!hasBio}
          style={{
            marginTop: "auto",
            border: "none",
            borderRadius: "10px",
            padding: "10px 12px",
            background: hasBio ? "#FE9727" : "#ededed",
            color: hasBio ? "#fff" : "#8f8f8f",
            fontSize: "12px",
            fontWeight: 700,
            cursor: hasBio ? "pointer" : "not-allowed",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
          }}
        >
          {hasBio ? "Tap to read full profile" : "Profile coming soon"}
          <ChevronDown style={{ width: "14px", height: "14px" }} />
        </button>
      </div>

      {openBio && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpenBio(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 70,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(760px, calc(100vw - 24px))",
              maxHeight: "85vh",
              overflow: "hidden",
              borderRadius: "18px",
              background: "#fff",
              border: "1px solid #ececec",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: "20px", lineHeight: 1.2, color: "#121212", fontWeight: 800 }}>
                  {speaker.name}
                </h3>
                {speaker.title && (
                  <p style={{ margin: "5px 0 0", fontSize: "13px", color: "#000000", fontWeight: 600 }}>
                    {speaker.title}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpenBio(false)}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  border: "1px solid #ececec",
                  background: "#fff",
                  color: "#666",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-label="Close speaker bio"
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>

            <div
              style={{
                padding: "18px",
                overflowY: "auto",
                maxHeight: "calc(85vh - 90px)",
              }}
            >
              {bioParagraphs.map((paragraph, index) => (
                <p
                  key={`${speaker.name}-bio-${index}`}
                  style={{
                    fontSize: "14px",
                    color: "#444",
                    lineHeight: 1.8,
                    marginTop: 0,
                    marginBottom: index === bioParagraphs.length - 1 ? 0 : "16px",
                  }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

/* ── Collapsible Schedule Dropdown ── */
function ScheduleDropdown({ day, items, defaultOpen }: { day: string; items: ScheduleItem[]; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: "12px", borderRadius: "14px", border: "1px solid #f0f0f0", overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px", background: open ? "#FE9727" : "#fafafa",
        border: "none", cursor: "pointer", transition: "background 0.2s",
      }}>
        <span style={{
          fontSize: "13px", fontWeight: 700, letterSpacing: "0.5px",
          textTransform: "uppercase" as const,
          color: open ? "#fff" : "#FE9727",
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
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#000000", minWidth: "130px", fontFamily: "monospace" }}>{item.time}</span>
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
          background: "#FE9727",
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

function ProfileRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontSize: "16px", width: "24px", textAlign: "center" }}>{icon}</span>
      <div>
        <span style={{ fontSize: "11px", color: "#999", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
        <p style={{ fontSize: "14px", color: "#333", fontWeight: 500, margin: 0 }}>{value}</p>
      </div>
    </div>
  );
}
