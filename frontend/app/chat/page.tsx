"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Best offbeat places in October? 🍂",
  "5 day trip under ₹8000 from Delhi 🎒",
  "Hidden beaches near Goa? 🏖️",
  "Best food cities in India? 🍛",
  "Budget hill stations for couples 💑",
  "Northeast India travel guide 🌿",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Namaste! 🙏 I'm Bharat, your AI travel guide for hidden India.\n\nAsk me anything — offbeat destinations, budget tips, local food, best trains to book, or a full trip plan. I know every corner of India! 🗺️",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });
    const data = await res.json();
    setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    setLoading(false);
  };

  return (
    <div style={{
      background: "var(--bg-primary)", minHeight: "100vh",
      color: "var(--text-primary)", display: "flex", flexDirection: "column"
    }}>

      {/* Glow */}
      <div style={{
        position: "fixed", top: 0, left: "30%", width: "600px", height: "400px",
        background: "var(--gradient)", opacity: 0.05, filter: "blur(100px)",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* Header */}
      <div style={{
        position: "fixed", top: "64px", left: 0, right: 0, zIndex: 49,
        background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)",
        padding: "0 40px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/" style={{
            color: "var(--text-secondary)", textDecoration: "none",
            fontSize: "13px", marginRight: "8px"
          }}>← Home</a>
          <div style={{
            width: "40px", height: "40px", borderRadius: "50%",
            background: "var(--gradient)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", boxShadow: "0 0 20px rgba(255,107,53,0.4)"
          }}>🤖</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "18px" }}>
              Bharat
            </div>
            <div style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 600 }}>
              ● Online · AI Travel Guide
            </div>
          </div>
        </div>

        <div style={{
          fontSize: "12px", color: "var(--text-secondary)",
          background: "var(--bg-card)", padding: "6px 14px",
          borderRadius: "50px", border: "1px solid var(--border)"
        }}>
          ✦ Expert in all 28 states
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "120px 0 160px",
        maxWidth: "800px", margin: "0 auto", width: "100%",
        position: "relative", zIndex: 1
      }}>

        {/* Bharat avatar intro */}
        <div style={{ textAlign: "center", padding: "40px 24px 20px" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "var(--gradient)", margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "40px", boxShadow: "0 0 40px rgba(255,107,53,0.3)"
          }}>🤖</div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "28px", fontWeight: 700, marginBottom: "8px"
          }}>Ask Bharat</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Your AI travel companion for hidden India
          </p>
        </div>

        <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              gap: "10px", alignItems: "flex-end"
            }}>
              {/* Bharat avatar */}
              {m.role === "assistant" && (
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                  background: "var(--gradient)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px"
                }}>🤖</div>
              )}

              <div style={{
                maxWidth: "75%", padding: "14px 18px", borderRadius: "20px",
                fontSize: "14px", lineHeight: 1.7, whiteSpace: "pre-wrap",
                ...(m.role === "user" ? {
                  background: "var(--gradient)", color: "white",
                  borderBottomRightRadius: "4px"
                } : {
                  background: "var(--bg-card)", color: "var(--text-primary)",
                  border: "1px solid var(--border)", borderBottomLeftRadius: "4px"
                })
              }}>
                {m.content}
              </div>

              {/* User avatar */}
              {m.role === "user" && (
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px"
                }}>👤</div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "var(--gradient)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "16px"
              }}>🤖</div>
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "20px", borderBottomLeftRadius: "4px",
                padding: "14px 18px", display: "flex", gap: "6px", alignItems: "center"
              }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: "var(--accent)",
                    animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggestion chips */}
      {messages.length === 1 && (
        <div style={{
          position: "fixed", bottom: "80px", left: 0, right: 0, zIndex: 10,
          padding: "0 24px 12px", maxWidth: "800px", margin: "0 auto",
          display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center"
        }}>
          {STARTERS.map((s) => (
            <button key={s} onClick={() => send(s)}
              style={{
                padding: "8px 16px", borderRadius: "50px", fontSize: "12px",
                background: "var(--bg-card)", color: "var(--text-secondary)",
                border: "1px solid var(--border)", cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "var(--bg-secondary)", borderTop: "1px solid var(--border)",
        padding: "16px 24px"
      }}>
        <div style={{
          maxWidth: "800px", margin: "0 auto",
          display: "flex", gap: "12px", alignItems: "center"
        }}>
          <input
            type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask anything about India travel..."
            style={{
              flex: 1, padding: "14px 20px", borderRadius: "50px",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-primary)", fontSize: "14px", outline: "none"
            }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: input.trim() ? "var(--gradient)" : "var(--bg-card)",
              border: "none", cursor: input.trim() ? "pointer" : "not-allowed",
              fontSize: "20px", display: "flex", alignItems: "center",
              justifyContent: "center", transition: "all 0.2s",
              opacity: loading ? 0.5 : 1
            }}>
            →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}