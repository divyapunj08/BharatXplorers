"use client";
import Link from "next/link";
import { useTheme } from "../layout";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

const themes = [
  { id: "vibrant", label: "🔥", title: "Vibrant" },
  { id: "dark", label: "🌌", title: "Dark" },
  { id: "warm", label: "🪔", title: "Warm" },
] as const;

const FEATURES = [
  { label: "Ask Bharat — AI Chat", href: "/chat", emoji: "💬", keywords: ["chat", "ask", "bharat", "ai", "assistant"] },
  { label: "Discover Hidden Gems", href: "/discover", emoji: "🗺️", keywords: ["discover", "gems", "hidden", "places", "explore"] },
  { label: "AI Trip Planner", href: "/planner", emoji: "🤖", keywords: ["plan", "trip", "itinerary", "planner", "travel"] },
  { label: "Shopping", href: "/shopping", emoji: "🛍️", keywords: ["shop", "shopping", "market", "buy"] },
  { label: "Night Tourism", href: "/nightlife", emoji: "🌙", keywords: ["night", "nightlife", "tourism", "dark"] },
  { label: "Live Events", href: "/events", emoji: "🎪", keywords: ["events", "concerts", "matches", "festivals"] },
];
export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [navSearch, setNavSearch] = useState("");
  const [user, setUser] = useState<any>(null);

useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}, []);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const matchedFeatures = navSearch.trim()
    ? FEATURES.filter(f =>
        f.keywords.some(k => k.includes(navSearch.toLowerCase())) ||
        f.label.toLowerCase().includes(navSearch.toLowerCase())
      )
    : [];
  const links = [
    { href: "/discover", label: "Discover" },
    { href: "/planner", label: "Plan Trip" },
    { href: "/shopping", label: "Shopping" },
    { href: "/nightlife", label: "Night Tourism" },
    { href: "/events", label: "Events" },
    { href: "/chat", label: "Ask Bharat" },
  ];

  return (
    <nav style={{
      background: "var(--bg-secondary)",
      borderBottom: "1px solid var(--border)",
      position: "fixed", top: 0, left: 0, right: 0,
      zIndex: 50, padding: "0 40px",
      height: "64px", display: "flex",
      alignItems: "center", justifyContent: "space-between", gap: "20px"
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <span style={{ fontSize: "24px" }}>🇮🇳</span>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700, fontSize: "18px",
          color: "var(--text-primary)"
        }}>
          Bharat<span style={{
            background: "var(--gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>Xplorers</span>
        </span>
      </Link>

    {/* Compact search with suggestions */}
<div style={{ flex: 1, maxWidth: "280px", display: "flex", position: "relative" }}>
  <input
    type="text"
    value={navSearch}
    onChange={(e) => { setNavSearch(e.target.value); setShowSuggestions(true); }}
    onFocus={() => setShowSuggestions(true)}
    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && navSearch.trim()) {
        if (matchedFeatures.length > 0) {
          window.location.href = matchedFeatures[0].href;
        } else {
          window.location.href = `/discover?q=${encodeURIComponent(navSearch)}`;
        }
      }
    }}
    placeholder="Search India or features..."
    style={{
      flex: 1, padding: "8px 16px", borderRadius: "50px 0 0 50px",
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRight: "none", color: "var(--text-primary)",
      fontSize: "12px", outline: "none"
    }}
  />
  <button
    onClick={() => navSearch.trim() && (window.location.href = `/discover?q=${encodeURIComponent(navSearch)}`)}
    style={{
      padding: "8px 14px", borderRadius: "0 50px 50px 0",
      background: "var(--gradient)", color: "white",
      border: "none", fontSize: "12px", cursor: "pointer"
    }}>
    🔍
  </button>

  {/* Suggestions dropdown */}
  {showSuggestions && navSearch.trim() && matchedFeatures.length > 0 && (
    <div style={{
      position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "12px", overflow: "hidden", zIndex: 100,
      boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
    }}>
      <div style={{ padding: "8px 14px", fontSize: "10px", color: "var(--text-secondary)", fontWeight: 700, borderBottom: "1px solid var(--border)" }}>
        FEATURES
      </div>
      {matchedFeatures.map((f) => (
        <a key={f.href} href={f.href}
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 14px", textDecoration: "none",
            color: "var(--text-primary)", fontSize: "13px",
            borderBottom: "1px solid var(--border)", transition: "background 0.15s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-secondary)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <span style={{ fontSize: "16px" }}>{f.emoji}</span>
          <span>{f.label}</span>
        </a>
      ))}
      <a href={`/discover?q=${encodeURIComponent(navSearch)}`}
        style={{
          display: "block", padding: "10px 14px", textDecoration: "none",
          color: "var(--accent)", fontSize: "12px", fontWeight: 600
        }}>
        🔍 Search "{navSearch}" in Discover →
      </a>
    </div>
  )}
</div>
{/* Links - hidden on mobile */}
<div style={{ display: "flex", alignItems: "center", gap: "20px", flexShrink: 0 }}
  className="nav-links">
  {links.map((l) => (
          <Link key={l.href} href={l.href} style={{
            textDecoration: "none", fontSize: "13px", fontWeight: 500,
            color: pathname === l.href ? "var(--accent)" : "var(--text-secondary)",
            transition: "color 0.2s", whiteSpace: "nowrap"
          }}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* Theme switcher */}
      <div style={{
        display: "flex", alignItems: "center", gap: "4px",
        padding: "4px", borderRadius: "50px",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        flexShrink: 0
      }}>
        {themes.map((t) => (
          <button key={t.id} onClick={() => setTheme(t.id)} title={t.title}
            style={{
              width: "30px", height: "30px", borderRadius: "50%",
              border: "none", cursor: "pointer", fontSize: "14px",
              background: theme === t.id ? "var(--gradient)" : "transparent",
              opacity: theme === t.id ? 1 : 0.5,
              transform: theme === t.id ? "scale(1.1)" : "scale(1)",
              transition: "all 0.2s"
            }}>
            {t.label}
          </button>
        ))}
      </div>
      {/* Login / Profile button */}
{user ? (
  <a href="/profile" style={{
    display: "flex", alignItems: "center", gap: "8px",
    textDecoration: "none", flexShrink: 0
  }}>
    <div style={{
      width: "32px", height: "32px", borderRadius: "50%",
      background: "var(--gradient)", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontSize: "14px", fontWeight: 700, color: "white", flexShrink: 0
    }}>
      {(user?.user_metadata?.full_name || user?.email || "U").charAt(0).toUpperCase()}
    </div>
    <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "none" }}>
      {user?.user_metadata?.full_name || user?.email?.split("@")[0]}
    </span>
  </a>
) : (
  <a href="/login" style={{
    padding: "8px 18px", borderRadius: "50px",
    background: "var(--gradient)", color: "white",
    textDecoration: "none", fontSize: "13px",
    fontWeight: 700, flexShrink: 0
  }}>
    Login
  </a>
)}
    </nav>
  );
}