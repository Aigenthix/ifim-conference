"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Loader2, Bot } from "lucide-react";
import { chatbotApi } from "@/lib/api";
import { useChatStore } from "@/store/chat";
import { useAuthStore } from "@/store/auth";

export default function ChatbotFAB({ eventId }: { eventId: string }) {
  const token = useAuthStore((s) => s.token) ?? "";
  const { isOpen, toggleOpen } = useChatStore();

  return (
    <>
      <style>{`@media (max-width: 768px) { .chatbot-fab { bottom: 80px !important; } .chatbot-drawer { bottom: 152px !important; max-height: calc(100dvh - 176px) !important; } }`}</style>
      {/* FAB Button */}
      <motion.button
        onClick={toggleOpen}
        whileTap={{ scale: 0.9 }}
        className="chatbot-fab"
        style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 50,
          width: "56px", height: "56px", borderRadius: "50%",
          background: "linear-gradient(135deg, #8B0000, #DC143C)",
          color: "#fff", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(220,20,60,0.4)",
        }}
        aria-label="Open AI assistant"
      >
        {isOpen ? <X style={{ width: "22px", height: "22px" }} /> : <MessageSquare style={{ width: "22px", height: "22px" }} />}
      </motion.button>

      {/* Chat Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="chatbot-drawer"
            style={{
              position: "fixed", bottom: "96px", right: "24px", zIndex: 50,
              width: "380px", maxWidth: "calc(100vw - 48px)",
              height: "520px", maxHeight: "calc(100dvh - 120px)",
              borderRadius: "20px", overflow: "hidden",
              background: "#fff", border: "1px solid #eee",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              display: "flex", flexDirection: "column",
            }}
          >
            <ChatPanel eventId={eventId} token={token} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ChatPanel({ eventId, token }: { eventId: string; token: string }) {
  const { messages, isLoading, addMessage, setLoading } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return;
    addMessage({ id: Date.now().toString(), role: "user", content: query.trim(), timestamp: Date.now() });
    setLoading(true);

    try {
      const res = await chatbotApi.query({ event_id: eventId, query: query.trim() }, token);
      addMessage({ id: (Date.now() + 1).toString(), role: "assistant", content: res.response, sources: res.sources, timestamp: Date.now() });
    } catch {
      addMessage({ id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, I encountered an error. Please try again.", timestamp: Date.now() });
    } finally {
      setLoading(false);
    }
  }, [eventId, token, isLoading, addMessage, setLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current) { handleSend(inputRef.current.value); inputRef.current.value = ""; }
  };

  return (
    <>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px",
        borderBottom: "1px solid #eee",
        background: "linear-gradient(135deg, #8B0000, #DC143C)", color: "#fff",
      }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bot style={{ width: "16px", height: "16px", color: "#fff" }} />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: "14px" }}>AI Event Assistant</p>
          <p style={{ fontSize: "11px", opacity: 0.8 }}>Ask about RAJ DARBAR 2026</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Bot style={{ width: "40px", height: "40px", color: "#ddd", margin: "0 auto 12px" }} />
            <p style={{ fontSize: "13px", color: "#999" }}>Ask me anything about the event!</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: "16px" }}>
              {["What's the full event schedule?", "Tell me about the speakers", "What are the discussion topics?", "Venue & dress code details?"].map((q) => (
                <button key={q} onClick={() => { handleSend(q); if (inputRef.current) inputRef.current.value = ""; }}
                  style={{ padding: "8px 14px", borderRadius: "999px", border: "1px solid #eee", background: "#fafafa", fontSize: "12px", color: "#555", cursor: "pointer" }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", gap: "10px", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #8B0000, #DC143C)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "4px" }}>
                <Bot style={{ width: "14px", height: "14px", color: "#fff" }} />
              </div>
            )}
            <div style={{
              maxWidth: "80%", padding: "12px 16px", borderRadius: "16px", fontSize: "13px", lineHeight: 1.7,
              ...(msg.role === "user"
                ? { background: "linear-gradient(135deg, #8B0000, #DC143C)", color: "#fff", borderBottomRightRadius: "4px" }
                : { background: "#f5f5f5", color: "#333", borderBottomLeftRadius: "4px" }),
            }}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #8B0000, #DC143C)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bot style={{ width: "14px", height: "14px", color: "#fff" }} />
            </div>
            <div style={{ background: "#f5f5f5", borderRadius: "16px", padding: "12px 16px", display: "flex", gap: "4px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ccc", animation: "bounce 1.4s infinite", animationDelay: "0ms" }} />
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ccc", animation: "bounce 1.4s infinite", animationDelay: "150ms" }} />
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ccc", animation: "bounce 1.4s infinite", animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
      </div>
      <style>{`@keyframes bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }`}</style>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ padding: "12px 16px", borderTop: "1px solid #eee" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input ref={inputRef} type="text" placeholder="Ask a question..."
            style={{
              flex: 1, padding: "12px 16px", borderRadius: "14px", border: "2px solid #eee",
              fontSize: "13px", color: "#111", outline: "none", background: "#fafafa",
            }}
          />
          <button type="submit" disabled={isLoading}
            style={{
              width: "42px", height: "42px", borderRadius: "14px",
              background: "linear-gradient(135deg, #8B0000, #DC143C)", color: "#fff",
              border: "none", cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: isLoading ? 0.5 : 1,
            }}>
            {isLoading ? <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" /> : <Send style={{ width: "16px", height: "16px" }} />}
          </button>
        </div>
      </form>
    </>
  );
}
