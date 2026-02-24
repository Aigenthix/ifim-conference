"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Zap } from "lucide-react";
import { adminApi } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const resp = await adminApi.login(email, password);
      // Store admin token in localStorage
      localStorage.setItem("admin-token", resp.token);
      localStorage.setItem("admin-email", resp.email);
      localStorage.setItem("admin-role", resp.role);
      // Redirect to admin dashboard — need event ID
      // For now redirect to a known event, or a selector
      router.push(`/admin/dashboard`);
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #1a0000, #3d0000, #1a0000)",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "100%", maxWidth: "420px", margin: "0 16px",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px", padding: "40px 32px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "linear-gradient(135deg, #8B0000, #DC143C)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: "16px",
            boxShadow: "0 8px 24px rgba(220,20,60,0.4)",
          }}>
            <Zap style={{ width: "28px", height: "28px", color: "#fff" }} />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
            Admin Portal
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
            Event management dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Email */}
          <div style={{ position: "relative" }}>
            <Mail style={{
              position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
              width: "18px", height: "18px", color: "rgba(255,255,255,0.3)",
            }} />
            <input
              type="email" placeholder="Admin email" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              style={{
                width: "100%", padding: "14px 14px 14px 44px", borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                color: "#fff", fontSize: "14px", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ position: "relative" }}>
            <Lock style={{
              position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
              width: "18px", height: "18px", color: "rgba(255,255,255,0.3)",
            }} />
            <input
              type={showPass ? "text" : "password"} placeholder="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              style={{
                width: "100%", padding: "14px 44px 14px 44px", borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                color: "#fff", fontSize: "14px", outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{
              position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)",
            }}>
              {showPass ? <EyeOff style={{ width: "18px", height: "18px" }} /> : <Eye style={{ width: "18px", height: "18px" }} />}
            </button>
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: "13px", textAlign: "center" }}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={{
            padding: "14px", borderRadius: "14px", border: "none", cursor: loading ? "not-allowed" : "pointer",
            background: "linear-gradient(135deg, #8B0000, #DC143C)",
            color: "#fff", fontSize: "15px", fontWeight: 600,
            opacity: loading ? 0.6 : 1, transition: "opacity 0.15s",
            boxShadow: "0 8px 24px rgba(220,20,60,0.3)",
          }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
