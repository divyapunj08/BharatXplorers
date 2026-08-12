"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import PexelsImage from "../components/PexelsImage";
const TripMap = dynamic(() => import("../components/Map"), { ssr: false });

function imgUrl(keyword: string, w = 400, h = 200) {
  const seed = keyword.replace(/\s+/g, "-").toLowerCase();
  return `https://picsum.photos/seed/${seed}-night/${w}/${h}`;
}

const SECTIONS = [
  { key: "illuminated", label: "Illuminated Monuments", emoji: "🏛️", color: "#f7c948" },
  { key: "night_markets", label: "Night Markets", emoji: "🌙", color: "#ff6b35" },
  { key: "stargazing", label: "Stargazing Spots", emoji: "⭐", color: "#6c63ff" },
  { key: "night_food", label: "Night Food Streets", emoji: "🍛", color: "#00ff88" },
  { key: "night_treks", label: "Night Treks & Walks", emoji: "🥾", color: "#00d4ff" },
];

const POPULAR_CITIES = [
  "Delhi", "Mumbai", "Jaipur", "Varanasi", "Bangalore",
  "Kolkata", "Chennai", "Udaipur", "Rishikesh", "Goa"
];

export default function Nightlife() {
  const [city, setCity] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("illuminated");
  const [highlighted, setHighlighted] = useState<any>(null);

  const search = async (c?: string) => {
    const searchCity = c || city;
    if (!searchCity.trim()) return;
    setLoading(true); setData(null);

    const res = await fetch("/api/nightlife", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: searchCity }),
    });
    const result = await res.json();
    setData(result);
    setLoading(false);
    setActiveSection("illuminated");
  };

  const activeItems = data?.[activeSection] || [];
  const activeColor = SECTIONS.find(s => s.key === activeSection)?.color || "var(--accent)";

  const allPlaces = data ? [
    ...(data.illuminated || []),
    ...(data.night_markets || []),
    ...(data.stargazing || []),
    ...(data.night_food || []),
    ...(data.night_treks || []),
  ].filter(p => p.lat && p.lng).map(p => ({ name: p.name, lat: p.lat, lng: p.lng })) : [];

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>

      {/* Night glow */}
      <div style={{
        position: "fixed", top: 0, left: "20%", width: "700px", height: "500px",
        background: "radial-gradient(circle, #6c63ff 0%, transparent 70%)",
        opacity: 0.06, filter: "blur(80px)", pointerEvents: "none", zIndex: 0
      }} />
      <div style={{
        position: "fixed", bottom: 0, right: "10%", width: "500px", height: "400px",
        background: "radial-gradient(circle, #f7c948 0%, transparent 70%)",
        opacity: 0.04, filter: "blur(80px)", pointerEvents: "none", zIndex: 0
      }} />

      {/* Header */}
      <div style={{ padding: "80px 40px 0", position: "relative", zIndex: 1 }}>
        <a href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "14px" }}>← Back to Home</a>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "52px", fontWeight: 900, marginTop: "16px",
          background: "linear-gradient(135deg, #6c63ff, #f7c948)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>Night Tourism</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "16px" }}>
          India after dark — illuminated monuments, night markets, stargazing, midnight food streets.
        </p>
      </div>

      {/* City search */}
      <div style={{ padding: "32px 40px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: "12px", maxWidth: "600px" }}>
          <input type="text" value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Enter a city e.g. Delhi, Varanasi, Jaipur..."
            style={{
              flex: 1, padding: "16px 24px", borderRadius: "50px",
              background: "var(--bg-card)", border: "1px solid var(--border)",
              color: "var(--text-primary)", fontSize: "15px", outline: "none"
            }}
            onFocus={e => e.target.style.borderColor = "#6c63ff"}
            onBlur={e => e.target.style.borderColor = "var(--border)"} />
          <button onClick={() => search()}
            style={{
              padding: "16px 32px", borderRadius: "50px", border: "none",
              background: "linear-gradient(135deg, #6c63ff, #f7c948)",
              color: "white", fontWeight: 700, fontSize: "15px", cursor: "pointer"
            }}>
            Explore Night →
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
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#6c63ff"; e.currentTarget.style.color = "#6c63ff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
                  🌙 {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "80px", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🌙</div>
          <p style={{ fontSize: "20px", fontWeight: 600 }}>Exploring the night...</p>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>Finding hidden night spots in {city}</p>
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

          {/* 2 column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>

            {/* Left — Cards */}
            <div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700,
                marginBottom: "20px", color: activeColor
              }}>
                {SECTIONS.find(s => s.key === activeSection)?.emoji}{" "}
                {SECTIONS.find(s => s.key === activeSection)?.label}
              </h2>

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
<PexelsImage query={item.name + " " + item.city + " india night"}
  width={400} height={180}
  style={{ width: "100%", height: "180px", display: "block" }}
  alt={item.name} />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)",
                      display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "16px"
                    }}>
                      <div>
                        <span style={{ fontSize: "32px" }}>{item.emoji}</span>
                        {item.timing && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>⏰ {item.timing}</div>}
                        {item.bestTime && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>⏰ {item.bestTime}</div>}
                        {item.bestMonth && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>📅 {item.bestMonth}</div>}
                        {item.duration && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>⏱ {item.duration}</div>}
                      </div>
                      <span style={{ fontSize: "12px", color: "#f7c948" }}>★ {item.rating}</span>
                    </div>
                  </div>

                  <div style={{ padding: "18px" }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>
                      {item.name}
                    </h3>
                    <p style={{ fontSize: "12px", color: activeColor, fontWeight: 600, marginBottom: "10px" }}>
                      📍 {item.city}, {item.state}
                      {item.difficulty && <span style={{ marginLeft: "8px", padding: "2px 8px", borderRadius: "50px", background: "var(--bg-secondary)", fontSize: "10px" }}>{item.difficulty}</span>}
                      {item.entryFee !== undefined && <span style={{ marginLeft: "8px" }}>· Entry ₹{item.entryFee}</span>}
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "12px" }}>
                      {item.description}
                    </p>

                    {item.famousFor && (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                        {item.famousFor.map((f: string) => (
                          <span key={f} style={{ fontSize: "11px", padding: "3px 10px", borderRadius: "50px", background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>{f}</span>
                        ))}
                      </div>
                    )}

                    {item.mustTry && (
                      <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "10px", marginBottom: "10px", borderLeft: `3px solid ${activeColor}` }}>
                        <p style={{ fontSize: "10px", fontWeight: 700, color: activeColor, marginBottom: "2px" }}>MUST TRY</p>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.mustTry}</p>
                      </div>
                    )}

                    <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "10px", marginBottom: "12px", borderLeft: "3px solid var(--accent2)" }}>
                      <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--accent2)", marginBottom: "2px" }}>💡 TIP</p>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.tip}</p>
                    </div>
                    {/* Open/Close info */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                      {(item.timing || item.bestTime) && (
                        <span style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "50px", background: "var(--bg-secondary)", color: "#00ff88", border: "1px solid #00ff88" }}>
                          ⏰ {item.timing || item.bestTime}
                        </span>
                      )}
                      {item.lastEntry && (
                        <span style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "50px", background: "var(--bg-secondary)", color: "#ff4d6d", border: "1px solid #ff4d6d" }}>
                          🚪 Last entry: {item.lastEntry}
                        </span>
                      )}
                      {item.peakTime && (
                        <span style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "50px", background: "var(--bg-secondary)", color: "#f7c948", border: "1px solid #f7c948" }}>
                          🔥 Peak: {item.peakTime}
                        </span>
                      )}
                      {item.closedOn && item.closedOn !== "None" && (
                        <span style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "50px", background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                          Closed: {item.closedOn}
                        </span>
                      )}
                    </div>

                    {/* What to wear */}
                    {item.whatToWear && (
                      <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "10px", marginBottom: "8px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "16px", flexShrink: 0 }}>👗</span>
                        <div>
                          <p style={{ fontSize: "10px", fontWeight: 700, color: "#6c63ff", marginBottom: "2px" }}>WHAT TO WEAR</p>
                          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.whatToWear}</p>
                        </div>
                      </div>
                    )}

                    {/* What to carry */}
                    {item.whatToCarry && (
                      <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "10px", marginBottom: "8px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "16px", flexShrink: 0 }}>🎒</span>
                        <div>
                          <p style={{ fontSize: "10px", fontWeight: 700, color: "#00d4ff", marginBottom: "2px" }}>WHAT TO CARRY</p>
                          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.whatToCarry}</p>
                        </div>
                      </div>
                    )}

                    {/* First timer tip */}
                    {item.firstTimerTip && (
                      <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "10px", marginBottom: "12px", display: "flex", gap: "10px", alignItems: "flex-start", border: `1px solid ${activeColor}` }}>
                        <span style={{ fontSize: "16px", flexShrink: 0 }}>⭐</span>
                        <div>
                          <p style={{ fontSize: "10px", fontWeight: 700, color: activeColor, marginBottom: "2px" }}>FIRST TIMER TIP</p>
                          <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{item.firstTimerTip}</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setHighlighted({ lat: item.lat, lng: item.lng, name: item.name })}
                      style={{ fontSize: "12px", padding: "6px 16px", borderRadius: "50px", background: activeColor, color: "black", border: "none", cursor: "pointer", fontWeight: 700 }}>
                      📍 Show on Map
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right — Map + stats */}
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, marginBottom: "20px" }}>
                🗺️ Night Map
              </h2>
              <div style={{ position: "sticky", top: "80px" }}>
                <TripMap places={allPlaces} highlighted={highlighted} />

                {highlighted && (
                  <div style={{ marginTop: "12px", background: "var(--bg-card)", borderRadius: "12px", padding: "12px", border: `1px solid ${activeColor}`, textAlign: "center" }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: activeColor }}>📍 {highlighted.name}</p>
                    <button onClick={() => setHighlighted(null)} style={{ fontSize: "11px", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", marginTop: "4px" }}>Clear ×</button>
                  </div>
                )}

                {/* Night stats */}
                <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  {SECTIONS.map((s) => (
                    <div key={s.key}
                      onClick={() => setActiveSection(s.key)}
                      style={{
                        background: "var(--bg-card)", border: `1px solid ${activeSection === s.key ? s.color : "var(--border)"}`,
                        borderRadius: "14px", padding: "14px", cursor: "pointer", transition: "all 0.2s", textAlign: "center"
                      }}>
                      <div style={{ fontSize: "24px" }}>{s.emoji}</div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: s.color, marginTop: "4px" }}>{data[s.key]?.length || 0} spots</div>
                      <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Initial */}
      {!data && !loading && (
        <div style={{ textAlign: "center", padding: "80px", color: "var(--text-secondary)", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "80px", marginBottom: "16px" }}>🌙</div>
          <p style={{ fontSize: "20px" }}>Enter a city to explore its night life</p>
          <p style={{ fontSize: "14px", marginTop: "8px", opacity: 0.6 }}>
            Monuments, markets, stargazing, food streets, night treks
          </p>
        </div>
      )}
    </div>
  );
}