import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(165deg, #8B0000 0%, #DC143C 40%, #B22222 70%, #8B0000 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflowX: "hidden",
        overflowY: "auto",
        padding: "40px 24px",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

      {/* Main Content Wrapper (pushes footer down) */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, zIndex: 1 }}>
        {/* Logo */}
        <img src="/logo.png" alt="Raj Darbar 2026" style={{
          width: "200px", height: "auto", marginBottom: "28px",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.95)",
          padding: "12px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", marginBottom: "24px", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.9)", letterSpacing: "2px", textTransform: "uppercase" as const }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px rgba(74,222,128,0.6)" }} />
          Live Now
        </div>

        <h1 style={{ fontSize: "clamp(48px, 10vw, 80px)", fontWeight: 800, color: "#FFFFFF", textAlign: "center" as const, lineHeight: 1.05, marginBottom: "8px", textShadow: "0 4px 24px rgba(0,0,0,0.3)", letterSpacing: "-1px" }}>
          RAJ DARBAR
        </h1>

        <div style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 300, color: "rgba(255,255,255,0.85)", marginBottom: "12px", letterSpacing: "6px" }}>
          2026
        </div>

        <p style={{ fontSize: "17px", fontWeight: 600, color: "#FFD700", marginBottom: "16px", fontStyle: "italic", letterSpacing: "1px", textAlign: "center" }}>
          Time to Rule Your Segment
        </p>

        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", maxWidth: "500px", textAlign: "center" as const, lineHeight: 1.7, marginBottom: "36px" }}>
          Powered by The Next Big Thing | Equitywala.com. A premium, invitation-only conference for top financial leaders and entrepreneurs.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", marginBottom: "36px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "999px", background: "rgba(255,255,255,0.12)", fontSize: "13px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
            📅 27–28 February 2026
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "999px", background: "rgba(255,255,255,0.12)", fontSize: "13px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
            📍 Grand Mercure, Vadodara
          </span>
        </div>

        <Link
          href="/register/event"
          style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "16px 40px", borderRadius: "999px", fontWeight: 700, fontSize: "15px", color: "#8B0000", background: "#FFFFFF", textDecoration: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", letterSpacing: "0.5px" }}
        >
          Enter Event
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {/* Golden Core Values */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", fontSize: "14px", fontWeight: 800, color: "#FFD700", letterSpacing: "0.5px", marginTop: "42px", textAlign: "center" as const, textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
          <span style={{ whiteSpace: "nowrap" }}>Growth Through Technology</span>
          <span className="desktop-dot" style={{ display: "none" }}>•</span>
          <span style={{ whiteSpace: "nowrap" }}>Growth Through Team</span>
          <span className="desktop-dot" style={{ display: "none" }}>•</span>
          <span style={{ whiteSpace: "nowrap" }}>Growth Through Communication</span>
          <span className="desktop-dot" style={{ display: "none" }}>•</span>
          <span style={{ whiteSpace: "nowrap" }}>Growth Through Networking</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", fontSize: "12px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.5px", marginTop: "48px", zIndex: 1, textAlign: "center" as const }}>
        <span style={{ whiteSpace: "nowrap" }}>www.equitywala.com</span>
        <span style={{ display: "none" }}>•</span>
        <span style={{ whiteSpace: "nowrap" }}>9321064995</span>
        <span style={{ display: "none" }}>•</span>
        <span style={{ whiteSpace: "nowrap" }}>*Entry by Invitation Only</span>
        <style>{`@media (min-width: 600px) { span[style*="display: none"], .desktop-dot { display: inline !important; } }`}</style>
      </div>
    </main>
  );
}
