"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2, Bot } from "lucide-react";
import { chatbotApi } from "@/lib/api";
import { useChatStore } from "@/store/chat";
import { useAuthStore } from "@/store/auth";

type CuratedFaqRule = {
  keywords: string[];
  response: string;
};

const GREETINGS = ["hi", "hello", "hey", "greetings", "good morning", "good afternoon", "good evening"];

function normalizeFaqText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[–—]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toBullets(lines: string[]): string {
  const cleaned = lines.map((line) => line.trim()).filter(Boolean);
  if (cleaned.length === 0) return "";
  return `Key Points:\n- ${cleaned.join("\n- ")}`;
}

const CURATED_FAQ_RULES: CuratedFaqRule[] = [
  {
    keywords: ["automation", "save", "time", "scale"],
    response: toBullets([
      "Automate onboarding, KYC follow-ups, and meeting summaries to remove repetitive work.",
      "Use AI copilots for first drafts, then review before client send.",
      "Reinvest saved hours into advisory calls and revenue conversations.",
    ]),
  },
  {
    keywords: ["daily", "business", "operations"],
    response: toBullets([
      "Start with high-frequency workflows: onboarding, documentation, reminders, and reporting.",
      "Track three KPIs weekly: turnaround time, error rate, and conversion.",
    ]),
  },
  {
    keywords: ["tools", "new", "tech", "adoption"],
    response: toBullets([
      "Begin with one CRM, one automation layer, and one AI assistant.",
      "Roll out one use-case at a time for 30 days before adding more tools.",
    ]),
  },
  {
    keywords: ["client", "engagement", "reporting"],
    response: toBullets([
      "Use AI for personalized nudges based on client goals and portfolio behavior.",
      "Keep human calls for major decisions and trust-building conversations.",
    ]),
  },
  {
    keywords: ["mistakes", "adopting", "digital", "tools"],
    response: toBullets([
      "Buying too many tools before defining one measurable outcome.",
      "Ignoring data quality and compliance checkpoints.",
      "Automating without ownership and review rhythm.",
    ]),
  },
  {
    keywords: ["balance", "personal", "connect", "digital"],
    response: toBullets([
      "Use digital systems for repeatable tasks and reminders.",
      "Use personal touch for advice, objections, and goal reviews.",
    ]),
  },
  {
    keywords: ["right", "time", "hire", "first", "team"],
    response: toBullets([
      "Hire when founder time is blocked by repeatable non-advisory tasks.",
      "Define role outcomes before hiring: service quality, compliance, or revenue support.",
    ]),
  },
  {
    keywords: ["define", "roles", "business", "small"],
    response: toBullets([
      "Split ownership into client service, operations, and compliance.",
      "Set one owner and 2-3 measurable KPIs per role.",
    ]),
  },
  {
    keywords: ["ownership", "mindset", "dependency"],
    response: toBullets([
      "Assign outcomes, not just tasks, with clear decision boundaries.",
      "Run weekly reviews with evidence-based feedback.",
    ]),
  },
  {
    keywords: ["track", "team", "productivity"],
    response: toBullets([
      "Track throughput, turnaround time, and quality/compliance errors.",
      "Use one dashboard and review trends every week.",
    ]),
  },
  {
    keywords: ["hire", "skill", "attitude"],
    response: toBullets([
      "Early-stage teams should prioritize attitude and learning speed.",
      "Validate baseline skill through scenario-based tasks.",
    ]),
  },
  {
    keywords: ["meaningful", "professional", "relationships", "events"],
    response: toBullets([
      "Follow up with context + value, not only requests.",
      "Build consistency with periodic insights, intros, or collaboration ideas.",
    ]),
  },
  {
    keywords: ["networking", "quantity", "quality"],
    response: toBullets([
      "Start quality-first with high-fit peers in your niche.",
      "Expand quantity only after building a reliable core network.",
    ]),
  },
  {
    keywords: ["follow", "up", "transactional"],
    response: toBullets([
      "Reference the last discussion and add one useful takeaway/resource.",
      "Use a light cadence and ask for value-aligned next steps.",
    ]),
  },
  {
    keywords: ["collaboration", "opportunities"],
    response: toBullets([
      "Start with a low-risk pilot such as co-webinar or co-referral workflow.",
      "Define owner, timeline, and success metric before launch.",
    ]),
  },
  {
    keywords: ["value", "proposition", "prospects"],
    response: toBullets([
      "Use one-line clarity: who you help, what problem, what measurable outcome.",
      "Support with one proof metric and one client story.",
    ]),
  },
  {
    keywords: ["storytelling", "client", "conversations"],
    response: toBullets([
      "Use Problem -> Action -> Result stories to simplify complex financial concepts.",
      "End each story with a clear client next step.",
    ]),
  },
  {
    keywords: ["difficult", "client", "conversations"],
    response: toBullets([
      "Lead with empathy, align on facts, and present option trade-offs.",
      "Close with documented action items, owners, and timelines.",
    ]),
  },
  {
    keywords: ["objective", "group", "discussion"],
    response: toBullets([
      "Convert ideas into practical actions for growth, compliance, and client outcomes.",
      "Leverage peer inputs to leave with implementable next steps.",
    ]),
  },
  {
    keywords: ["outcome", "end", "session"],
    response: toBullets([
      "You should leave with 2-3 concrete actions and a 30-day execution plan.",
      "Capture accountability partners and measurable checkpoints.",
    ]),
  },
  {
    keywords: ["time", "discipline", "group"],
    response: toBullets([
      "Use fixed speaking slots and problem -> action -> result format.",
      "Park deep dives and close with owner + deadline for each action.",
    ]),
  },
  {
    keywords: ["tool", "demonstrations"],
    response: toBullets([
      "Discussion is primary, with practical BFSI + AI examples.",
      "Live demonstrations can be covered in focused Q&A segments.",
    ]),
  },
  {
    keywords: ["platform", "queries"],
    response: toBullets([
      "Yes, platform-specific questions are welcome.",
      "Share your exact use case, constraints, and expected output for better guidance.",
    ]),
  },
  {
    keywords: ["resources", "tool", "lists", "shared"],
    response: toBullets([
      "Yes, practical tool references and rollout notes can be shared post-session.",
      "Prioritize tools by business use case, not by popularity.",
    ]),
  },
  {
    keywords: ["time", "available", "q", "a"],
    response: toBullets([
      "Q&A windows are focused and time-boxed within each discussion block.",
      "Use concise, scenario-based questions for faster and better answers.",
    ]),
  },
  {
    keywords: ["team", "challenges", "openly"],
    response: toBullets([
      "Yes, practical team challenges can be discussed openly.",
      "Share context safely and avoid exposing sensitive client details.",
    ]),
  },
  {
    keywords: ["templates", "role", "clarity", "review"],
    response: toBullets([
      "Yes, role clarity and review cadence templates can be used.",
      "Keep the template simple: owner, KPI, review frequency, and next action.",
    ]),
  },
  {
    keywords: ["discussion", "confidential", "group"],
    response: toBullets([
      "Treat group discussions as confidential and professional.",
      "Discuss patterns and scenarios without client-identifying information.",
    ]),
  },
  {
    keywords: ["examples", "real", "practices"],
    response: toBullets([
      "Yes, examples are usually shared from real operating contexts.",
      "The focus remains on replicable frameworks, not one-off anecdotes.",
    ]),
  },
  {
    keywords: ["interaction", "activities", "group"],
    response: toBullets([
      "Yes, the format includes interactive sharing activities.",
      "Keep your inputs concise so more participants can contribute.",
    ]),
  },
  {
    keywords: ["exchange", "contacts", "session"],
    response: toBullets([
      "Yes, contact exchange is encouraged.",
      "Add one clear next step while exchanging details to avoid dead follow-ups.",
    ]),
  },
  {
    keywords: ["structured", "networking", "open", "discussion"],
    response: toBullets([
      "Both formats are used: structured rounds for breadth, open discussion for depth.",
      "Use whichever format to finalize one practical collaboration next step.",
    ]),
  },
  {
    keywords: ["sharing", "experiences"],
    response: toBullets([
      "Experience-sharing windows are distributed across participants.",
      "Use a short problem -> action -> result format for best clarity.",
    ]),
  },
  {
    keywords: ["role", "plays", "discussion"],
    response: toBullets([
      "Both discussion and role-play can be included.",
      "Role-play is used to practice execution, objection handling, and clarity.",
    ]),
  },
  {
    keywords: ["real", "communication", "scenarios"],
    response: toBullets([
      "Yes, real communication scenarios are welcome.",
      "Mask sensitive client details and focus on decision context and outcome.",
    ]),
  },
  {
    keywords: ["feedback", "given", "exercises"],
    response: toBullets([
      "Yes, feedback is typically structured and practical.",
      "Apply feedback immediately in the next attempt for faster improvement.",
    ]),
  },
  {
    keywords: ["communication", "templates", "shared"],
    response: toBullets([
      "Yes, concise communication templates can be shared.",
      "Use them as a base and personalize by client segment.",
    ]),
  },
  {
    keywords: ["interactive", "session"],
    response: toBullets([
      "The session is designed to be highly interactive.",
      "Participation quality directly improves the value you get.",
    ]),
  },
  {
    keywords: ["take", "notes", "reflections"],
    response: toBullets([
      "Yes, quick notes and reflections are recommended.",
      "Capture key insight + next action + owner for execution clarity.",
    ]),
  },
  {
    keywords: ["summary", "takeaway", "capture"],
    response: toBullets([
      "Yes, key takeaways can be captured and shared after the discussion.",
      "Convert each takeaway into one measurable action item.",
    ]),
  },
];

function getCuratedFaqAnswer(query: string): string | null {
  const normalized = normalizeFaqText(query);
  if (!normalized) return null;

  if (GREETINGS.some((g) => normalized === g || normalized.startsWith(g + " "))) {
    return "Hello! Welcome to Bharat Synapse@2047. How can I help you today? You can ask me about the schedule, speakers, or any event details.";
  }

  const direct = CURATED_FAQ_RULES.find((rule) =>
    rule.keywords.every((keyword) => normalized.includes(keyword))
  );
  if (direct) return direct.response;

  if (
    ["technology", "automation", "digital", "kyc", "crm"].some((keyword) =>
      normalized.includes(keyword)
    )
  ) {
    return toBullets([
      "In BFSI, start AI adoption with compliance-safe, repetitive workflows first.",
      "Prioritize one measurable use case and review impact weekly.",
    ]);
  }

  if (
    ["team", "hire", "attrition", "productivity", "ownership"].some((keyword) =>
      normalized.includes(keyword)
    )
  ) {
    return toBullets([
      "Set role clarity and outcome KPIs before scaling headcount.",
      "Run weekly execution reviews and monthly development reviews.",
    ]);
  }

  if (
    ["networking", "collaboration", "follow up", "relationships"].some((keyword) =>
      normalized.includes(keyword)
    )
  ) {
    return toBullets([
      "Use a Meet -> Nurture -> Collaborate rhythm for stronger outcomes.",
      "Focus on value-driven follow-ups and pilot collaboration opportunities.",
    ]);
  }

  if (
    ["communication", "storytelling", "value proposition", "role play"].some((keyword) =>
      normalized.includes(keyword)
    )
  ) {
    return toBullets([
      "Keep communication outcome-first, concise, and client-context driven.",
      "Use structured conversations with clear next steps and owners.",
    ]);
  }

  return null;
}

function shouldUseCuratedFallback(text: string): boolean {
  const normalized = normalizeFaqText(text);
  return (
    normalized.includes("does not contain the answer") ||
    normalized.includes("context does not contain") ||
    normalized.includes("could not find") ||
    normalized.includes("don t contain the answer")
  );
}

function formatAssistantReply(text: string): string {
  const raw = text.trim();
  if (!raw) return raw;
  if (raw.includes("\n- ") || raw.startsWith("- ")) return raw;
  if (raw.length < 260) return raw;

  const sentences = raw
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  if (sentences.length < 2) return raw;

  return toBullets(sentences.slice(0, 6));
}

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
          height: "52px", borderRadius: "26px",
          padding: "0 20px",
          background: "#FE9727",
          color: "#fff", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          boxShadow: "0 8px 24px rgba(220,20,60,0.4)",
          fontSize: "14px", fontWeight: 600,
        }}
        aria-label="Open AI assistant"
      >
        {isOpen ? <X style={{ width: "20px", height: "20px" }} /> : <Bot style={{ width: "20px", height: "20px" }} />}
        <span>{isOpen ? "Close" : "AI Assistant"}</span>
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
    const cleanedQuery = query.trim();
    if (!cleanedQuery || isLoading) return;

    addMessage({ id: Date.now().toString(), role: "user", content: cleanedQuery, timestamp: Date.now() });
    setLoading(true);

    try {
      const curatedBeforeApi = getCuratedFaqAnswer(cleanedQuery);
      if (curatedBeforeApi) {
        addMessage({
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: curatedBeforeApi,
          sources: ["curated_frontend_faq"],
          timestamp: Date.now(),
        });
        return;
      }

      // Prepare conversation history (up to last 10 messages, omitting the one just added)
      const historyPayload = messages
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await chatbotApi.query({ 
        event_id: eventId, 
        query: cleanedQuery,
        history: historyPayload.length > 0 ? historyPayload : undefined,
      }, token);
      
      const curatedAfterApi = shouldUseCuratedFallback(res.response)
        ? getCuratedFaqAnswer(cleanedQuery)
        : null;
      const responseText = curatedAfterApi ?? formatAssistantReply(res.response);
      addMessage({ id: (Date.now() + 1).toString(), role: "assistant", content: responseText, sources: res.sources, timestamp: Date.now() });
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
        background: "#FE9727", color: "#fff",
      }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bot style={{ width: "16px", height: "16px", color: "#fff" }} />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: "14px" }}>AI Event Assistant</p>
          <p style={{ fontSize: "11px", opacity: 0.8 }}>Ask about Bharat Synapse@2047</p>
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
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FE9727", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "4px" }}>
                <Bot style={{ width: "14px", height: "14px", color: "#fff" }} />
              </div>
            )}
            <div style={{
              maxWidth: "80%", padding: "12px 16px", borderRadius: "16px", fontSize: "14px", lineHeight: 1.6,
              ...(msg.role === "user"
                ? { background: "#FE9727", color: "#fff", borderBottomRightRadius: "4px" }
                : { background: "#f5f5f5", color: "#333", borderBottomLeftRadius: "4px" }),
            }}>
              {msg.content.split("\n").map((line, i) => {
                const trimmed = line.trim();
                const isListItem = trimmed.startsWith("- ") || trimmed.startsWith("* ");
                const content = isListItem ? trimmed.substring(2) : line;
                
                // Bold formatting
                const parts = content.split(/(\*\*.*?\*\*)/g);
                const formattedLine = parts.map((part, j) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                  }
                  return part;
                });
            
                if (isListItem) {
                  return (
                    <div key={i} style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                      <span style={{ color: "#000000" }}>•</span>
                      <span>{formattedLine}</span>
                    </div>
                  );
                }
                
                return <div key={i} style={{ marginTop: i > 0 && !content ? "4px" : "0", minHeight: content ? "auto" : "8px" }}>{formattedLine}</div>;
              })}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", gap: "10px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FE9727", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
              background: "#FE9727", color: "#fff",
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
