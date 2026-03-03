"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Smile, X, Reply } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { communityApi } from "@/lib/api";
import type { CommunityMessageItem } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const CHAT_POLL_INTERVAL_MS = 5_000;

function getTimeStr(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function CommunityChatSection({ eventId }: { eventId: string }) {
  const token = useAuthStore((s) => s.token) ?? "";
  const userId = useAuthStore((s) => s.userId) ?? "";
  const [messages, setMessages] = useState<CommunityMessageItem[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [replyTo, setReplyTo] = useState<CommunityMessageItem | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<string>("");
  const latestMessageAtRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    try {
      const data = await communityApi.getMessages(eventId, token, {
        after: latestMessageAtRef.current ?? undefined,
        limit: 200,
      });
      const incoming = data.messages ?? [];
      if (incoming.length > 0) {
        setMessages((prev) => {
          if (!latestMessageAtRef.current) {
            const sortedInitial = [...incoming].sort(
              (a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            snapshotRef.current = `${sortedInitial.length}:${sortedInitial.at(-1)?.id ?? ""}`;
            return sortedInitial;
          }

          const mergedMap = new Map<string, CommunityMessageItem>(
            prev.map((message) => [message.id, message])
          );
          incoming.forEach((message) => {
            mergedMap.set(message.id, message);
          });
          const merged = Array.from(mergedMap.values()).sort(
            (a, b) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          snapshotRef.current = `${merged.length}:${merged.at(-1)?.id ?? ""}`;
          return merged;
        });

        latestMessageAtRef.current = incoming.reduce((latest, message) => {
          const latestTs = new Date(latest).getTime();
          const messageTs = new Date(message.created_at).getTime();
          return Number.isFinite(messageTs) && messageTs > latestTs
            ? message.created_at
            : latest;
        }, latestMessageAtRef.current ?? incoming[0].created_at);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [eventId, token]);

  useEffect(() => {
    latestMessageAtRef.current = null;
    snapshotRef.current = "";
    void fetchMessages();
    let timer: number | null = null;
    let active = true;

    const scheduleNext = () => {
      if (!active) return;
      timer = window.setTimeout(() => {
        void tick();
      }, CHAT_POLL_INTERVAL_MS);
    };

    const tick = async () => {
      if (!active) return;
      if (document.visibilityState === "visible") {
        await fetchMessages();
      }
      scheduleNext();
    };

    scheduleNext();
    return () => {
      active = false;
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || sending) return;
    setSending(true);
    try {
      const msg = await communityApi.send({ 
        event_id: eventId, 
        message: newMsg.trim(),
        reply_to_id: replyTo?.id,
        reply_to_user_name: replyTo?.user_name,
        reply_to_message: replyTo?.message,
      }, token);
      setMessages((prev) => {
        const merged = [...prev, msg];
        snapshotRef.current = `${merged.length}:${merged.at(-1)?.id ?? ""}`;
        latestMessageAtRef.current = msg.created_at;
        return merged;
      });
      setNewMsg("");
      setReplyTo(null);
      setShowEmojiPicker(false);
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
  };

  // Color based on user name hash
  const getColor = (name: string) => {
    const colors = ["#FE9727", "#000000", "#E67E22", "#2E86C1", "#27AE60", "#8E44AD", "#C0392B", "#16A085"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "12px",
          background: "#FE9727",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <MessageCircle style={{ width: "20px", height: "20px", color: "#fff" }} />
        </div>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111" }}>Community Chat</h2>
          <p style={{ fontSize: "13px", color: "#888" }}>Chat live with all attendees</p>
        </div>
        <div style={{
          marginLeft: "auto", padding: "4px 12px", borderRadius: "999px",
          background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: "11px", fontWeight: 600,
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
          Live
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>

      {/* Chat Container */}
      <div style={{
        background: "#fff", borderRadius: "16px", border: "1px solid #eee",
        display: "flex", flexDirection: "column", height: "500px",
        overflow: "hidden",
      }}>
        {/* Messages Area */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "16px",
          display: "flex", flexDirection: "column", gap: "12px",
        }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ width: "28px", height: "28px", border: "3px solid #eee", borderTopColor: "#FE9727", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <MessageCircle style={{ width: "36px", height: "36px", color: "#ddd", marginBottom: "12px" }} />
              <p style={{ color: "#999", fontSize: "14px" }}>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.user_id === userId;
              return (
                <div key={m.id} style={{
                  display: "flex", gap: "10px",
                  flexDirection: isMe ? "row-reverse" : "row",
                  alignItems: "flex-end",
                }}>
                  {!isMe && (
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                      background: getColor(m.user_name),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: "11px", fontWeight: 700,
                    }}>
                      {getInitials(m.user_name)}
                    </div>
                  )}
                  <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                    {!isMe && (
                      <span style={{ fontSize: "11px", fontWeight: 600, color: getColor(m.user_name), marginBottom: "2px" }}>
                        {m.user_name}
                      </span>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexDirection: isMe ? "row-reverse" : "row" }}>
                      <div style={{
                        padding: "10px 14px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        background: isMe ? "#FE9727" : "#f5f5f5",
                        color: isMe ? "#fff" : "#333", fontSize: "14px", lineHeight: 1.5,
                        whiteSpace: "pre-wrap", wordBreak: "break-word"
                      }}>
                        {m.reply_to_message && (
                          <div style={{
                            fontSize: "12px", background: "rgba(0,0,0,0.06)", borderRadius: "6px",
                            padding: "6px 10px", marginBottom: "6px", borderLeft: `3px solid ${isMe ? "#fff" : "#000000"}`,
                            color: isMe ? "rgba(255,255,255,0.9)" : "#666",
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                          }}>
                            <strong style={{ fontSize: "10px", display: "block", marginBottom: "2px" }}>{m.reply_to_user_name}</strong>
                            {m.reply_to_message}
                          </div>
                        )}
                        {m.message}
                      </div>

                      <button 
                        onClick={() => setReplyTo(m)}
                        style={{ 
                          background: "none", border: "none", color: "#ccc", cursor: "pointer", 
                          padding: "4px", display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "color 0.2s"
                        }}
                        title="Reply"
                        onMouseEnter={(e) => e.currentTarget.style.color = "#000000"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#ccc"}
                      >
                        <Reply style={{ width: "14px", height: "14px" }} />
                      </button>
                    </div>
                    <span style={{ fontSize: "10px", color: "#bbb", marginTop: "4px" }}>
                      {getTimeStr(m.created_at)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Context */}
        <AnimatePresence>
          {replyTo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: "#f8f9fa", borderTop: "1px solid #eee", padding: "10px 16px",
                display: "flex", alignItems: "center", gap: "12px", overflow: "hidden"
              }}
            >
              <div style={{ width: "3px", height: "30px", background: "#000000", borderRadius: "2px" }} />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#000000", display: "block" }}>
                  Replying to {replyTo.user_name}
                </span>
                <span style={{ fontSize: "12px", color: "#666", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {replyTo.message}
                </span>
              </div>
              <button 
                onClick={() => setReplyTo(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#999", padding: "4px" }}
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Bar */}
        <div style={{ position: "relative" }}>
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{ position: "absolute", bottom: "100%", right: "16px", zIndex: 10, marginBottom: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", borderRadius: "8px" }}
              >
                <EmojiPicker 
                  onEmojiClick={(emojiData) => setNewMsg((prev) => prev + emojiData.emoji)} 
                  autoFocusSearch={false}
                  height={350}
                  width="100%"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              borderTop: "1px solid #eee", padding: "12px 16px",
              display: "flex", gap: "10px", alignItems: "center",
              background: "#fff"
            }}
          >
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                background: "none", border: "none", cursor: "pointer", color: showEmojiPicker ? "#000000" : "#999",
                display: "flex", alignItems: "center", justifyContent: "center", transition: "color 0.2s"
              }}
            >
              <Smile style={{ width: "20px", height: "20px" }} />
            </button>
            <textarea
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onClick={() => showEmojiPicker && setShowEmojiPicker(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (newMsg.trim() && !sending) {
                    handleSend();
                  }
                }
              }}
              placeholder="Type a message... (Shift+Enter for new line)"
              rows={newMsg.split('\n').length > 1 ? Math.min(newMsg.split('\n').length, 4) : 1}
              style={{
                flex: 1, border: "none", outline: "none", fontSize: "14px",
                background: "transparent", color: "#333", resize: "none",
                fontFamily: "inherit", padding: "10px 0", lineHeight: "1.4",
                maxHeight: "100px", overflowY: "auto"
              }}
            />
            <button type="submit" disabled={sending || !newMsg.trim()} style={{
              width: "40px", height: "40px", borderRadius: "50%", border: "none", cursor: "pointer",
              background: newMsg.trim() ? "#FE9727" : "#eee",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
              <Send style={{ width: "16px", height: "16px", color: newMsg.trim() ? "#fff" : "#bbb" }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
