"use client";
import { useState, useEffect, Suspense } from "react";
import PexelsImage from "../components/PexelsImage";
import { supabase } from "../lib/supabase";
const POPULAR = [
  "hidden beaches", "mountain villages", "heritage forts",
  "tribal culture", "budget backpacking", "spiritual temples",
  "northeast India", "desert Rajasthan", "offbeat Karnataka",
  "jungle treks", "ancient ruins", "food destinations"
];

const crowdColor: Record<string, string> = {
  "Very Low": "#00ff88",
  "Low": "#00d4ff",
  "Medium": "#f7c948",
  "High": "#ff4d6d",
};

import { useSearchParams } from "next/navigation";

function DiscoverPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [gems, setGems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      search(q);
    }
  }, []);

  const search = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    setGems([]);

    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: searchQuery }),
    });
    const data = await res.json();
    setGems(data.gems || []);
    setLoading(false);
  };

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>

      {/* Glow */}
      <div style={{
        position: "fixed", top: 0, left: "30%", width: "500px", height: "300px",
        background: "var(--gradient)", opacity: 0.05, filter: "blur(80px)",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* Header */}
      <div style={{ padding: "40px 40px 0", position: "relative", zIndex: 1 }}>
        <a href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "14px" }}>
          ← Back to Home
        </a>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "52px", fontWeight: 900, marginTop: "16px",
          background: "var(--gradient)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>
          Discover India
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "16px" }}>
          Search any place, vibe, or experience across all of India — powered by AI.
        </p>
      </div>

      {/* Search bar */}
      <div style={{ padding: "32px 40px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: "12px", maxWidth: "700px" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value === "") {
                setSearched(false);
                setGems([]);
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search any place, state, vibe... e.g. 'hidden beaches Kerala' or 'budget Rajasthan'"
            style={{
              flex: 1, padding: "16px 24px", borderRadius: "50px",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-primary)", fontSize: "15px",
              outline: "none"
            }}
            onFocus={e => (e.target.style.borderColor = "var(--accent)")}
            onBlur={e => (e.target.style.borderColor = "var(--border)")}
          />
          <button onClick={() => search()}
            style={{
              padding: "16px 32px", borderRadius: "50px",
              background: "var(--gradient)", color: "white",
              border: "none", fontWeight: 700, fontSize: "15px",
              cursor: "pointer"
            }}>
            Search →
          </button>
        </div>

        {/* Popular searches */}
        {!searched && (
          <div style={{ marginTop: "20px" }}>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
              Popular searches:
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {POPULAR.map((p) => (
                <button key={p} onClick={() => { setQuery(p); search(p); }}
                  style={{
                    padding: "7px 16px", borderRadius: "50px", fontSize: "12px",
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
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "80px", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
            Searching all of India for you...
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && gems.length > 0 && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px", padding: "32px 40px 80px",
          position: "relative", zIndex: 1
        }}>
          {gems.map((gem, i) => (
            <div key={i}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "20px", overflow: "hidden", transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Banner */}
             
             <div style={{ position: "relative", height: "160px" }}>
              <PexelsImage
               query={gem.name + " " + gem.state}
               width={400}
               height={160}
               style={{ width: "100%", height: "160px" }}
               alt={gem.name}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                padding: "12px"
              }}>
                  <span style={{ fontSize: "32px" }}>{gem.emoji}</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "50px", background: "rgba(0,0,0,0.5)", color: crowdColor[gem.crowd] || "#fff" }}>
                      {gem.crowd} crowd
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "6px" }}>
                        📅 {gem.bestMonth}
                      </div>
                    </div>
                  </div>
                </div>

              {/* Body */}
              <div style={{ padding: "20px" }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "22px", fontWeight: 700, marginBottom: "4px"
                }}>{gem.name}</h3>
                <p style={{ fontSize: "12px", color: "var(--accent)", marginBottom: "12px", fontWeight: 600 }}>
                  📍 {gem.state} · {gem.type}
                </p>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "16px" }}>
                  {gem.description}
                </p>

                {/* Tip */}
                <div style={{
                  background: "var(--bg-secondary)", borderRadius: "12px",
                  padding: "12px", marginBottom: "16px",
                  borderLeft: "3px solid var(--accent2)"
                }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent2)", marginBottom: "4px" }}>
                    💡 LOCAL TIP
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {gem.tip}
                  </p>
                </div>

{/* Footer */}
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <button onClick={async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Login to save favorites!"); window.location.href = "/login"; return; }
    await supabase.from("favorite_places").insert({
      user_id: user.id, place_name: gem.name, place_type: gem.type, place_data: gem
    });
    alert(`${gem.name} added to favorites!`);
  }}
    style={{
      background: "none", border: "1px solid var(--border)", borderRadius: "50%",
      width: "28px", height: "28px", cursor: "pointer", fontSize: "14px",
      flexShrink: 0, marginRight: "8px"
    }}>
    ❤️
  </button>
  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {gem.tags?.map((tag: string) => (
                      <span key={tag} style={{
                        fontSize: "11px", padding: "3px 10px", borderRadius: "50px",
                        background: "var(--bg-secondary)", color: "var(--text-secondary)",
                        border: "1px solid var(--border)"
                      }}>{tag}</span>
                    ))}
                  </div>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent)" }}>
                    ₹{gem.budget}/day
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && searched && gems.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>😕</div>
          <p>No results found. Try a different search!</p>
        </div>
      )}

      {/* Initial state */}
      {!searched && !loading && (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🗺️</div>
          <p style={{ fontSize: "18px" }}>Search anything above to discover India</p>
          <p style={{ fontSize: "14px", marginTop: "8px", opacity: 0.6 }}>
            Try "hidden waterfalls", "ancient temples Odisha", or "budget hill stations"
          </p>
        </div>
      )}
    </div>
  );
}
export default function Discover() {
  return (
    <Suspense fallback={<div style={{ background: "var(--bg-primary)", minHeight: "100vh" }} />}>
      <DiscoverPage />
    </Suspense>
  );
}