import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(165deg, #1a1040 0%, #2d1b69 40%, #1a1040 100%)",
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
      <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(254,151,39,0.06)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(254,151,39,0.04)", pointerEvents: "none" }} />

      {/* Main Content Wrapper */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, zIndex: 1 }}>
        {/* Logo */}
        <img src="/logo.png" alt="Bharat Synapse@2047" style={{
          width: "200px", height: "auto", marginBottom: "28px",
          borderRadius: "16px",
          background: "rgba(255,255,255,0.95)",
          padding: "12px 16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }} />

        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "999px", border: "1px solid rgba(254,151,39,0.4)", background: "rgba(254,151,39,0.12)", marginBottom: "24px", fontSize: "13px", fontWeight: 600, color: "#FE9727", letterSpacing: "2px", textTransform: "uppercase" as const }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px rgba(74,222,128,0.6)" }} />
          Live Now
        </div>

        <p style={{ fontSize: "16px", fontWeight: 500, color: "rgba(255,255,255,0.7)", marginBottom: "8px", letterSpacing: "3px", textTransform: "uppercase" as const }}>
          1st National Conference on
        </p>

        <h1 style={{ fontSize: "clamp(36px, 8vw, 68px)", fontWeight: 800, color: "#FFFFFF", textAlign: "center" as const, lineHeight: 1.05, marginBottom: "8px", textShadow: "0 4px 24px rgba(0,0,0,0.3)", letterSpacing: "-1px" }}>
          BHARAT SYNAPSE@2047
        </h1>

        <div style={{ fontSize: "clamp(16px, 3vw, 22px)", fontWeight: 400, color: "rgba(255,255,255,0.75)", marginBottom: "16px", letterSpacing: "2px", textAlign: "center" }}>
          Contours of a Future-ready Bharat
        </div>

        <p style={{ fontSize: "17px", fontWeight: 600, color: "#FE9727", marginBottom: "16px", fontStyle: "italic", letterSpacing: "1px", textAlign: "center" }}>
          Role of AI in Achieving Viksit Bharat 2047 Goals
        </p>

        <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", maxWidth: "520px", textAlign: "center" as const, lineHeight: 1.7, marginBottom: "36px" }}>
          A national interdisciplinary academic platform bringing together faculty, researchers, and scholars to explore AI&apos;s role in shaping India&apos;s future. Organized by IFIM School of Technology, IFIM College.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", marginBottom: "36px" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "999px", background: "rgba(254,151,39,0.15)", fontSize: "13px", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
            📅 5–6 March 2026
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "999px", background: "rgba(254,151,39,0.15)", fontSize: "13px", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
            📍 IFIM College, Bengaluru
          </span>
        </div>

        <Link
          href="/register/event"
          style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "16px 40px", borderRadius: "999px", fontWeight: 700, fontSize: "15px", color: "#000", background: "#FE9727", textDecoration: "none", boxShadow: "0 8px 32px rgba(254,151,39,0.4)", letterSpacing: "0.5px" }}
        >
          Enter Conference
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {/* Conference Tracks */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "16px", fontSize: "13px", fontWeight: 600, color: "#FE9727", letterSpacing: "0.5px", marginTop: "42px", textAlign: "center" as const }}>
          <span style={{ whiteSpace: "nowrap" }}>Next-Gen Technologies</span>
          <span className="desktop-dot" style={{ display: "none" }}>•</span>
          <span style={{ whiteSpace: "nowrap" }}>AI & Governance</span>
          <span className="desktop-dot" style={{ display: "none" }}>•</span>
          <span style={{ whiteSpace: "nowrap" }}>AI Integrated with Law</span>
          <span className="desktop-dot" style={{ display: "none" }}>•</span>
          <span style={{ whiteSpace: "nowrap" }}>Viksit Bharat@2047</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", fontSize: "12px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.5px", marginTop: "48px", zIndex: 1, textAlign: "center" as const }}>
        <span style={{ whiteSpace: "nowrap" }}>www.ifimbharatsynapse2047.com</span>
        <span style={{ display: "none" }}>•</span>
        <span style={{ whiteSpace: "nowrap" }}>+91 9742111344</span>
        <span style={{ display: "none" }}>•</span>
        <span style={{ whiteSpace: "nowrap" }}>viksitbharat2026@ifim.edu.in</span>
        <style>{`@media (min-width: 600px) { span[style*="display: none"], .desktop-dot { display: inline !important; } }`}</style>
      </div>
    </main>
  );
}
