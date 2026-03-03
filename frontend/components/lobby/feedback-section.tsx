"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Star, Send, Loader2, CheckCircle2 } from "lucide-react";
import { feedbackApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function FeedbackSection({ eventId }: { eventId: string }) {
  const token = useAuthStore((s) => s.token) ?? "";
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Check if feedback already submitted
  const { data: existingFeedback, isLoading: checking } = useQuery({
    queryKey: ["feedback-check", eventId],
    queryFn: () => feedbackApi.check(eventId, token),
    enabled: !!eventId && !!token,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (existingFeedback?.submitted) setSubmitted(true);
  }, [existingFeedback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error("Please select a rating"); return; }

    setLoading(true);
    try {
      await feedbackApi.submit({ event_id: eventId, rating, comments: comments.trim() || undefined }, token);
      setSubmitted(true);
      toast.success("Feedback submitted! Certificate is being generated.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      if (msg.includes("already")) setSubmitted(true);
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <div style={{ height: "200px", borderRadius: "20px", background: "#eee", maxWidth: "480px", margin: "0 auto", animation: "shimmer 1.5s infinite" }}>
      <style>{`@keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }`}</style>
    </div>;
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ borderRadius: "20px", background: "#fff", border: "1px solid #eee", padding: "60px 24px", textAlign: "center", maxWidth: "480px", margin: "0 auto", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }}
          style={{ width: "64px", height: "64px", margin: "0 auto 20px", borderRadius: "50%", background: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle2 style={{ width: "32px", height: "32px", color: "#22c55e" }} />
        </motion.div>
        <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#111", marginBottom: "8px" }}>Thank You!</h3>
        <p style={{ color: "#666", fontSize: "15px", lineHeight: 1.7 }}>
          Your feedback has been recorded.<br />Your certificate is ready for download.
        </p>
      </motion.div>
    );
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto" }}>
      <div style={{ borderRadius: "20px", background: "#fff", border: "1px solid #eee", padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#FE9727", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Star style={{ width: "18px", height: "18px", color: "#fff" }} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>Share Your Feedback</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "12px" }}>How was your experience?</label>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button key={star} type="button" whileTap={{ scale: 0.8 }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                  <Star style={{
                    width: "36px", height: "36px", transition: "all 0.15s",
                    fill: star <= (hoverRating || rating) ? "#f59e0b" : "transparent",
                    color: star <= (hoverRating || rating) ? "#f59e0b" : "#ddd",
                  }} />
                </motion.button>
              ))}
            </div>
            {rating > 0 && <p style={{ textAlign: "center", fontSize: "13px", color: "#888", marginTop: "8px" }}>{["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}</p>}
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#555", marginBottom: "8px" }}>Comments (optional)</label>
            <textarea value={comments} onChange={(e) => setComments(e.target.value)}
              placeholder="Share your thoughts..." rows={4} maxLength={2000}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "2px solid #eee", fontSize: "14px", color: "#111", outline: "none", resize: "none", background: "#fafafa", boxSizing: "border-box" }} />
          </div>

          <motion.button type="submit" disabled={loading || rating === 0} whileTap={{ scale: 0.97 }}
            style={{
              width: "100%", padding: "14px", borderRadius: "14px", fontWeight: 700,
              fontSize: "15px", color: "#fff", cursor: loading || rating === 0 ? "not-allowed" : "pointer",
              background: rating === 0 ? "#ccc" : "#FE9727",
              border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              opacity: loading ? 0.7 : 1, boxShadow: rating > 0 ? "0 4px 16px rgba(220,20,60,0.3)" : "none",
            }}>
            {loading ? <><Loader2 style={{ width: "18px", height: "18px" }} className="animate-spin" /> Submitting...</> : <><Send style={{ width: "16px", height: "16px" }} /> Submit Feedback</>}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
