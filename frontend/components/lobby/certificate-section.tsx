"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award, Download, Loader2, Clock } from "lucide-react";
import { certificatesApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useState } from "react";

export default function CertificateSection({ eventId }: { eventId: string }) {
  const token = useAuthStore((s) => s.token) ?? "";
  const [downloading, setDownloading] = useState(false);

  const { data: cert, isLoading, refetch } = useQuery({
    queryKey: ["certificate", eventId],
    queryFn: () => certificatesApi.getMine(token),
    staleTime: 10_000,
    retry: false,
  });

  const handleDownload = async () => {
    if (!cert?.pdf_url || !token) return;
    setDownloading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiBase}${cert.pdf_url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "certificate.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return <div style={{ height: "200px", borderRadius: "20px", background: "#eee", maxWidth: "480px", margin: "0 auto", animation: "shimmer 1.5s infinite" }}>
      <style>{`@keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
    </div>;
  }

  if (!cert) {
    return (
      <div style={{ borderRadius: "20px", background: "#fff", border: "1px solid #eee", padding: "60px 24px", textAlign: "center", maxWidth: "480px", margin: "0 auto", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <Award style={{ width: "48px", height: "48px", color: "#ccc", margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#333", marginBottom: "8px" }}>Certificate Not Available</h3>
        <p style={{ color: "#888", fontSize: "14px" }}>Submit feedback first to receive your certificate.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ borderRadius: "20px", background: "#fff", border: "1px solid #eee", padding: "40px 24px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        {cert.status === "ready" && cert.pdf_url ? (
          <>
            <div style={{ width: "64px", height: "64px", margin: "0 auto 20px", borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award style={{ width: "32px", height: "32px", color: "#22c55e" }} />
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Certificate Ready!</h3>
            <p style={{ color: "#666", marginBottom: "24px", fontSize: "14px" }}>Your participation certificate has been generated.</p>
            <button onClick={handleDownload} disabled={downloading}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "14px 28px", borderRadius: "14px", fontWeight: 700,
                fontSize: "15px", color: "#fff", border: "none",
                background: "linear-gradient(135deg, #8B0000, #DC143C)",
                boxShadow: "0 4px 16px rgba(220,20,60,0.3)",
                cursor: downloading ? "wait" : "pointer",
                opacity: downloading ? 0.7 : 1,
              }}>
              {downloading ? <><Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" /> Downloading...</> :
                <><Download style={{ width: "16px", height: "16px" }} /> Download PDF</>}
            </button>
          </>
        ) : cert.status === "pending" || cert.status === "generating" ? (
          <>
            <div style={{ width: "64px", height: "64px", margin: "0 auto 20px", borderRadius: "50%", background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock style={{ width: "32px", height: "32px", color: "#f59e0b" }} />
            </div>
            <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Generating Certificate...</h3>
            <p style={{ color: "#666", marginBottom: "24px", fontSize: "14px" }}>Please wait while we generate your certificate.</p>
            <button onClick={() => refetch()}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "12px 24px", borderRadius: "12px", fontWeight: 600,
                fontSize: "14px", color: "#666", background: "#f5f5f5",
                border: "1px solid #eee", cursor: "pointer",
              }}>
              <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" /> Check Status
            </button>
          </>
        ) : (
          <>
            <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Certificate Unavailable</h3>
            <p style={{ color: "#666" }}>Please try again later.</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
