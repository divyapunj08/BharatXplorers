"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
      });
      if (error) { setError(error.message); setLoading(false); return; }
      router.push("/profile");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      router.push("/profile");
    }
    setLoading(false);
  };

  return (
    <div style={{
      background: "var(--bg-primary)", minHeight: "100vh",
      color: "var(--text-primary)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: "24px"
    }}>
      <div style={{
        position: "fixed", top: 0, left: "30%", width: "600px", height: "400px",
        background: "var(--gradient)", opacity: 0.06, filter: "blur(100px)",
        pointerEvents: "none", zIndex: 0
      }} />

      <div style={{
        width: "100%", maxWidth: "420px", position: "relative", zIndex: 1
      }}>
        <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "14px", display: "block", marginBottom: "24px" }}>
          ← Back to Home
        </Link>

        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span style={{ fontSize: "40px" }}>🇮🇳</span>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "28px",
            fontWeight: 900, marginTop: "8px",
            background: "var(--gradient)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>BharatXplorers</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
            {mode === "login" ? "Welcome back, explorer" : "Start your journey across India"}
          </p>
        </div>

        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "20px", padding: "32px"
        }}>
          {/* Toggle */}
          <div style={{
            display: "flex", background: "var(--bg-secondary)",
            borderRadius: "50px", padding: "4px", marginBottom: "24px"
          }}>
            <button onClick={() => setMode("login")}
              style={{
                flex: 1, padding: "10px", borderRadius: "50px", border: "none",
                fontWeight: 700, fontSize: "13px", cursor: "pointer",
                background: mode === "login" ? "var(--gradient)" : "transparent",
                color: mode === "login" ? "white" : "var(--text-secondary)"
              }}>
              Login
            </button>
            <button onClick={() => setMode("signup")}
              style={{
                flex: 1, padding: "10px", borderRadius: "50px", border: "none",
                fontWeight: 700, fontSize: "13px", cursor: "pointer",
                background: mode === "signup" ? "var(--gradient)" : "transparent",
                color: mode === "signup" ? "white" : "var(--text-secondary)"
              }}>
              Sign Up
            </button>
          </div>

          {mode === "signup" && (
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
                Full Name
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: "10px", boxSizing: "border-box",
                  background: "var(--bg-secondary)", border: "1px solid var(--border)",
                  color: "var(--text-primary)", fontSize: "14px", outline: "none"
                }} />
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Email
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "10px", boxSizing: "border-box",
                background: "var(--bg-secondary)", border: "1px solid var(--border)",
                color: "var(--text-primary)", fontSize: "14px", outline: "none"
              }} />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "6px" }}>
              Password
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              style={{
                width: "100%", padding: "12px 16px", borderRadius: "10px", boxSizing: "border-box",
                background: "var(--bg-secondary)", border: "1px solid var(--border)",
                color: "var(--text-primary)", fontSize: "14px", outline: "none"
              }} />
          </div>

          {error && (
            <p style={{ color: "#ff4d6d", fontSize: "12px", marginBottom: "16px" }}>{error}</p>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{
              width: "100%", padding: "14px", borderRadius: "10px",
              background: "var(--gradient)", color: "white",
              border: "none", fontWeight: 700, fontSize: "14px",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1
            }}>
            {loading ? "Please wait..." : mode === "login" ? "Login →" : "Create Account →"}
          </button>

          <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-secondary)", marginTop: "20px" }}>
            {mode === "login" ? "New here? " : "Already have an account? "}
            <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
              style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "12px" }}>
              {mode === "login" ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}