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
        overflow: "hidden",
        padding: "24px",
        fontFamily: "'Inter', -apple-system, sans-serif",
      }}
    >
      <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
      <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />

      <div style={{ width: "60px", height: "3px", background: "rgba(255,255,255,0.4)", borderRadius: "4px", marginBottom: "32px" }} />

      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", marginBottom: "24px", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.9)", letterSpacing: "2px", textTransform: "uppercase" as const }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px rgba(74,222,128,0.6)" }} />
        Live Now
      </div>

      <h1 style={{ fontSize: "clamp(48px, 10vw, 80px)", fontWeight: 800, color: "#FFFFFF", textAlign: "center" as const, lineHeight: 1.05, marginBottom: "8px", textShadow: "0 4px 24px rgba(0,0,0,0.3)", letterSpacing: "-1px" }}>
        RAJ DARBAR
      </h1>

      <div style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 300, color: "rgba(255,255,255,0.85)", marginBottom: "28px", letterSpacing: "6px" }}>
        2026
      </div>

      <div style={{ width: "120px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)", marginBottom: "28px" }} />

      <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", maxWidth: "460px", textAlign: "center" as const, lineHeight: 1.7, marginBottom: "40px" }}>
        Scan, register, and access live polls, AI assistant, photo gallery, feedback, and instant certificates — all from one link.
      </p>

      <Link
        href="/register/event"
        style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "16px 40px", borderRadius: "999px", fontWeight: 700, fontSize: "15px", color: "#8B0000", background: "#FFFFFF", textDecoration: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", letterSpacing: "0.5px" }}
      >
        Enter Event
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <div style={{ position: "absolute", bottom: "24px", fontSize: "12px", color: "rgba(255,255,255,0.35)", letterSpacing: "1px" }}>
        27 — 28 FEBRUARY 2026
      </div>
    </main>
  );
}
