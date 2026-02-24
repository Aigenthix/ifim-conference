"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { eventsApi } from "@/lib/api";

export default function AdminDashboardRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) {
      router.replace("/admin");
      return;
    }

    // Fetch the first active event and redirect to its admin page
    eventsApi
      .getLobby("event", token)
      .then((lobby) => {
        router.replace(`/admin/${lobby.id}`);
      })
      .catch(() => {
        // If no event found, stay on this page
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0a0a0a", color: "#fff", fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "36px", height: "36px", border: "3px solid #333", borderTopColor: "#DC143C", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#666", fontSize: "14px" }}>Loading dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0a0a0a", color: "#fff", fontFamily: "'Inter', sans-serif",
    }}>
      <p style={{ color: "#666" }}>No events found. Please create an event first.</p>
    </div>
  );
}
