"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import PexelsImage from "../components/PexelsImage";
const TripMap = dynamic(() => import("../components/Map"), { ssr: false });

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

const SECTIONS = [
  { key: "concerts", label: "Concerts & Music", emoji: "🎵", color: "#ff6b35" },
  { key: "sports", label: "Sports & Matches", emoji: "🏏", color: "#00d4ff" },
  { key: "festivals", label: "Festivals & Fairs", emoji: "🎪", color: "#f7c948" },
  { key: "food_events", label: "Food Events", emoji: "🍛", color: "#00ff88" },
  { key: "cultural", label: "Cultural & Arts", emoji: "🎭", color: "#6c63ff" },
];

const statusColors: Record<string, string> = {
  "Upcoming": "#00d4ff",
  "Selling Fast": "#ff6b35",
  "Almost Full": "#ff4d6d",
  "Ongoing": "#00ff88",
  "Free Entry": "#00ff88",
};

const POPULAR_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata",
  "Hyderabad", "Pune", "Jaipur", "Ahmedabad", "Goa"
];

function imgUrl(keyword: string) {
  const seed = keyword.replace(/\s+/g, "-").toLowerCase();
  return `https://picsum.photos/seed/${seed}-event/400/200`;
}

export default function Events() {
  const [city, setCity] = useState("");
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year] = useState(new Date().getFullYear());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("concerts");
  const [highlighted, setHighlighted] = useState<any>(null);

  const search = async (c?: string) => {
    const searchCity = c || city;
    if (!searchCity.trim()) return;
    setLoading(true); setData(null);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: searchCity, month, year }),
    });
    const result = await res.json();
    setData(result);
    setLoading(false);
    setActiveSection("concerts");
  };

  const activeItems = data?.[activeSection] || [];
  const activeColor = SECTIONS.find(s => s.key === activeSection)?.color || "var(--accent)";

  const allPlaces = data ? [
    ...(data.concerts || []),
    ...(data.sports || []),
    ...(data.festivals || []),
    ...(data.food_events || []),
    ...(data.cultural || []),
  ].filter(p => p.lat && p.lng).map(p => ({ name: p.name, lat: p.lat, lng: p.lng })) : [];

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>

      {/* Glow */}
      <div style={{
        position: "fixed", top: 0, left: "20%", width: "700px", height: "500px",
        background: "radial-gradient(circle, #ff6b35 0%, transparent 70%)",
        opacity: 0.05, filter: "blur(80px)", pointerEvents: "none", zIndex: 0
      }} />

      {/* Header */}
      <div style={{ padding: "80px 40px 0", position: "relative", zIndex: 1 }}>
        <a href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "14px" }}>← Back to Home</a>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "52px", fontWeight: 900, marginTop: "16px",
          background: "linear-gradient(135deg, #ff6b35, #f7c948)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>Live Events</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "16px" }}>
          Concerts, matches, festivals, food events — happening near you this month.
        </p>
      </div>

      {/* Search */}
      <div style={{ padding: "32px 40px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: "12px", maxWidth: "700px", flexWrap: "wrap" }}>
          <input type="text" value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Enter your city..."
            style={{
              flex: 2, minWidth: "200px", padding: "16px 24px", borderRadius: "50px",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-primary)", fontSize: "15px", outline: "none"
            }}
            onFocus={e => e.target.style.borderColor = "#ff6b35"}
            onBlur={e => e.target.style.borderColor = "var(--border)"} />

          <select value={month} onChange={(e) => setMonth(e.target.value)}
            style={{
              flex: 1, minWidth: "140px", padding: "16px 20px", borderRadius: "50px",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-primary)", fontSize: "14px", outline: "none"
            }}>
            {MONTHS.map(m => <option key={m} style={{ background: "var(--bg-card)" }}>{m}</option>)}
          </select>

          <button onClick={() => search()}
            style={{
              padding: "16px 32px", borderRadius: "50px", border: "none",
              background: "linear-gradient(135deg, #ff6b35, #f7c948)",
              color: "white", fontWeight: 700, fontSize: "15px", cursor: "pointer"
            }}>
            Find Events →
          </button>
        </div>

        {/* Popular cities */}
        {!data && !loading && (
          <div style={{ marginTop: "20px" }}>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>Popular cities:</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {POPULAR_CITIES.map((c) => (
                <button key={c} onClick={() => { setCity(c); search(c); }}
                  style={{
                    padding: "7px 16px", borderRadius: "50px", fontSize: "12px",
                    background: "var(--bg-card)", color: "var(--text-secondary)",
                    border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#ff6b35"; e.currentTarget.style.color = "#ff6b35"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                  🎪 {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "80px", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎪</div>
          <p style={{ fontSize: "20px", fontWeight: 600 }}>Finding events in {city}...</p>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>Checking concerts, matches, festivals for {month}</p>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div style={{ padding: "32px 40px 80px", position: "relative", zIndex: 1 }}>

          {/* Section tabs */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "32px" }}>
            {SECTIONS.map((s) => (
              <button key={s.key} onClick={() => setActiveSection(s.key)}
                style={{
                  padding: "10px 20px", borderRadius: "50px", fontSize: "13px", fontWeight: 700,
                  cursor: "pointer", transition: "all 0.2s",
                  background: activeSection === s.key ? s.color : "var(--bg-card)",
                  color: activeSection === s.key ? "black" : "var(--text-secondary)",
                  border: activeSection === s.key ? "none" : "1px solid var(--border)"
                }}>
                {s.emoji} {s.label} ({data[s.key]?.length || 0})
              </button>
            ))}
          </div>

          {/* 2 col layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>

            {/* Left — Event cards */}
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700,
                marginBottom: "20px", color: activeColor
              }}>
                {SECTIONS.find(s => s.key === activeSection)?.emoji}{" "}
                {SECTIONS.find(s => s.key === activeSection)?.label}
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", marginLeft: "12px", fontFamily: "DM Sans" }}>
                  {month} {year} · {city}
                </span>
              </h2>

              {activeItems.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                  <p>No {activeSection} found for {city} in {month}.</p>
                </div>
              )}

              {activeItems.map((item: any, i: number) => (
                <div key={i}
                  style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "20px", overflow: "hidden", marginBottom: "20px",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = activeColor; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {/* Image */}
                  <div style={{ position: "relative" }}>
                    <PexelsImage query={item.name + " " + city + " india event"}
                     width={400} height={160}
                     style={{ width: "100%", height: "160px", display: "block" }}
                     alt={item.name} />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)",
                      display: "flex", alignItems: "flex-end",
                      justifyContent: "space-between", padding: "14px"
                    }}>
                      <div>
                        <span style={{
                          fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "50px",
                          background: statusColors[item.status] || "var(--accent)", color: "black"
                        }}>{item.status}</span>
                        <div style={{ fontSize: "20px", marginTop: "6px" }}>{item.emoji}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "13px", color: "white", fontWeight: 700 }}>
                          📅 {item.date || `${item.startDate} - ${item.endDate}`}
                        </div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
                          ⏰ {item.time}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, lineHeight: 1.3 }}>
                        {item.name}
                      </h3>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: activeColor, flexShrink: 0, marginLeft: "8px" }}>
                        {item.price}
                      </span>
                    </div>

                    {/* Artist/Teams */}
                    {(item.artist || item.teams) && (
                      <p style={{ fontSize: "13px", color: activeColor, fontWeight: 600, marginBottom: "6px" }}>
                        {item.artist ? `🎤 ${item.artist}` : `⚔️ ${item.teams}`}
                      </p>
                    )}

                    <p style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600, marginBottom: "10px" }}>
                      📍 {item.venue}
                      {item.genre && <span style={{ marginLeft: "8px", padding: "2px 8px", borderRadius: "50px", background: "var(--bg-secondary)", fontSize: "10px", color: "var(--text-secondary)" }}>{item.genre}</span>}
                      {item.sport && <span style={{ marginLeft: "8px", padding: "2px 8px", borderRadius: "50px", background: "var(--bg-secondary)", fontSize: "10px", color: "var(--text-secondary)" }}>{item.sport}</span>}
                      {item.type && <span style={{ marginLeft: "8px", padding: "2px 8px", borderRadius: "50px", background: "var(--bg-secondary)", fontSize: "10px", color: "var(--text-secondary)" }}>{item.type}</span>}
                    </p>

                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "12px" }}>
                      {item.description}
                    </p>

                    {item.highlight && (
                      <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "10px", marginBottom: "12px", borderLeft: `3px solid ${activeColor}` }}>
                        <p style={{ fontSize: "10px", fontWeight: 700, color: activeColor, marginBottom: "2px" }}>✨ HIGHLIGHT</p>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.highlight}</p>
                      </div>
                    )}

                    {item.mustTry && (
                      <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "10px", marginBottom: "12px", borderLeft: "3px solid #00ff88" }}>
                        <p style={{ fontSize: "10px", fontWeight: 700, color: "#00ff88", marginBottom: "2px" }}>🍛 MUST TRY</p>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.mustTry}</p>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => setHighlighted({ lat: item.lat, lng: item.lng, name: item.name })}
                        style={{ fontSize: "12px", padding: "8px 16px", borderRadius: "50px", background: activeColor, color: "black", border: "none", cursor: "pointer", fontWeight: 700 }}>
                        📍 Locate
                      </button>
                      <a href={`https://in.bookmyshow.com/explore/events-${city.toLowerCase()}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "12px", padding: "8px 16px", borderRadius: "50px", background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)", cursor: "pointer", fontWeight: 700, textDecoration: "none" }}>
                        🎟️ Book Tickets →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right — Map + summary */}
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, marginBottom: "20px" }}>
                🗺️ Events Map
              </h2>
              <div style={{ position: "sticky", top: "80px" }}>
                <TripMap places={allPlaces} highlighted={highlighted} />

                {highlighted && (
                  <div style={{ marginTop: "12px", background: "var(--bg-card)", borderRadius: "12px", padding: "12px", border: `1px solid ${activeColor}`, textAlign: "center" }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: activeColor }}>📍 {highlighted.name}</p>
                    <button onClick={() => setHighlighted(null)} style={{ fontSize: "11px", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", marginTop: "4px" }}>Clear ×</button>
                  </div>
                )}

                {/* Event summary */}
                <div style={{ marginTop: "20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                  <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
                    📊 {month} Summary — {city}
                  </h4>
                  {SECTIONS.map((s) => (
                    <div key={s.key}
                      onClick={() => setActiveSection(s.key)}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "10px 0", borderBottom: "1px solid var(--border)",
                        cursor: "pointer", transition: "all 0.2s"
                      }}>
                      <span style={{ fontSize: "13px", color: activeSection === s.key ? s.color : "var(--text-secondary)" }}>
                        {s.emoji} {s.label}
                      </span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: s.color }}>
                        {data[s.key]?.length || 0} events
                      </span>
                    </div>
                  ))}
                  <div style={{ marginTop: "12px", textAlign: "center" }}>
                    <span style={{ fontSize: "20px", fontWeight: 700, background: "linear-gradient(135deg, #ff6b35, #f7c948)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {SECTIONS.reduce((acc, s) => acc + (data[s.key]?.length || 0), 0)} Total Events
                    </span>
                  </div>
                </div>

                {/* Book on BookMyShow */}
                <a href={`https://in.bookmyshow.com/explore/events-${city.toLowerCase()}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "block", marginTop: "16px", padding: "16px",
                    borderRadius: "16px", textAlign: "center", textDecoration: "none",
                    background: "linear-gradient(135deg, #ff6b35, #f7c948)",
                    color: "white", fontWeight: 700, fontSize: "15px"
                  }}>
                  🎟️ Book on BookMyShow →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initial */}
      {!data && !loading && (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--text-secondary)", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "80px", marginBottom: "16px" }}>🎪</div>
          <p style={{ fontSize: "20px" }}>Enter your city to discover events</p>
          <p style={{ fontSize: "14px", marginTop: "8px", opacity: 0.6 }}>
            Concerts, cricket matches, festivals, food events — all in one place
          </p>
        </div>
      )}
    </div>
  );
}