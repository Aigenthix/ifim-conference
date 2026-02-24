"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Mail, Phone, ArrowRight, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function RegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { login, isAuthenticated, eventSlug } = useAuthStore();
  const [slug, setSlug] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { params.then((p) => setSlug(p.slug)); }, [params]);
  useEffect(() => {
    if (isAuthenticated && eventSlug === slug && slug) router.replace(`/lobby/${slug}`);
  }, [isAuthenticated, eventSlug, slug, router]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 7) e.phone = "Valid phone required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.register({ ...form, event_slug: slug });
      login(res.access_token, res.user_id, res.event_id, slug);
      toast.success("Welcome! Entering event...");
      router.push(`/lobby/${slug}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px",
      background: "linear-gradient(165deg, #0a0a0a 0%, #1a1a1a 40%, #111 70%, #0a0a0a 100%)",
      fontFamily: "'Inter', -apple-system, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "350px", height: "350px", borderRadius: "50%", background: "rgba(255,255,255,0.02)" }} />
      <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "280px", height: "280px", borderRadius: "50%", background: "rgba(255,255,255,0.015)" }} />

      {/* Logo */}
      <img src="/logo.png" alt="Raj Darbar 2026" style={{
        width: "200px", height: "auto", marginBottom: "24px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.95)",
        padding: "10px 14px",
        boxShadow: "0 8px 32px rgba(255,255,255,0.15)",
      }} />

      <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", marginBottom: "6px", textAlign: "center" }}>
        Join RAJ DARBAR 2026
      </h1>
      <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "32px", textAlign: "center" }}>
        Enter your details to access the full experience
      </p>

      {/* Form Card */}
      <form onSubmit={handleSubmit} style={{
        width: "100%", maxWidth: "420px", borderRadius: "24px",
        background: "#fff", padding: "32px", position: "relative",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <InputField icon={User} label="Full Name" type="text" placeholder="Your name"
          value={form.name} onChange={(v) => setForm({ ...form, name: v })} error={errors.name} />
        <InputField icon={Mail} label="Email Address" type="email" placeholder="you@example.com"
          value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={errors.email} />
        <InputField icon={Phone} label="Phone Number" type="tel" placeholder="+91 98765 43210"
          value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} error={errors.phone} />

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "16px", borderRadius: "14px", border: "none",
          background: loading ? "#888" : "#000", color: "#fff",
          fontWeight: 700, fontSize: "15px", cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          transition: "all 0.2s",
        }}>
          {loading ? <><Loader2 style={{ width: "18px", height: "18px", animation: "spin 1s linear infinite" }} /> Entering...</>
            : <>Enter Event <ArrowRight style={{ width: "16px", height: "16px" }} /></>}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>

      <p style={{ marginTop: "24px", fontSize: "12px", color: "rgba(255,255,255,0.25)", letterSpacing: "1px" }}>
        27 — 28 FEBRUARY 2026
      </p>
    </main>
  );
}

function InputField({ icon: Icon, label, type, placeholder, value, onChange, error }: {
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
  label: string; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#333", marginBottom: "8px" }}>{label}</label>
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "14px 16px", borderRadius: "12px",
        border: `2px solid ${error ? "#e00" : "#eee"}`, background: "#fafafa",
        transition: "border-color 0.2s",
      }}>
        <Icon style={{ width: "18px", height: "18px", color: "#999", flexShrink: 0 }} />
        <input type={type} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1, border: "none", background: "transparent", outline: "none",
            fontSize: "14px", color: "#111",
          }}
        />
      </div>
      {error && <p style={{ fontSize: "12px", color: "#e00", marginTop: "4px" }}>{error}</p>}
    </div>
  );
}
