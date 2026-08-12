"use client";
import { useState } from "react";
import PexelsImage from "../components/PexelsImage";
import DownloadPDF from "../components/ItineraryPDF";
import dynamic from "next/dynamic";
import { supabase } from "../lib/supabase";
const TripMap = dynamic(() => import("../components/Map"), { ssr: false });

const moodColors: Record<string, string> = {
  Exciting: "#ff6b35", Peaceful: "#00d4ff", Adventurous: "#f7c948",
  Cultural: "#6c63ff", Relaxing: "#00ff88", Romantic: "#ff4d6d",
};
function imgUrl(keyword: string, w = 800, h = 500) {
  const seed = keyword.replace(/\s+/g, "-").toLowerCase();
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#f7c948", fontSize: "12px" }}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
      <span style={{ color: "var(--text-secondary)", marginLeft: "4px" }}>{rating}</span>
    </span>
  );
}

// Doodle decorations
function Doodles() {
  return (
    <>
      {/* Top left doodles */}
      <div style={{ position: "fixed", top: "80px", left: "10px", opacity: 0.15, pointerEvents: "none", zIndex: 0, fontSize: "24px", transform: "rotate(-20deg)" }}>✈️</div>
      <div style={{ position: "fixed", top: "160px", left: "30px", opacity: 0.1, pointerEvents: "none", zIndex: 0, fontSize: "18px", transform: "rotate(15deg)" }}>🗺️</div>
      <div style={{ position: "fixed", top: "240px", left: "15px", opacity: 0.12, pointerEvents: "none", zIndex: 0, fontSize: "22px" }}>⭐</div>
      <div style={{ position: "fixed", top: "320px", left: "40px", opacity: 0.1, pointerEvents: "none", zIndex: 0, fontSize: "16px", transform: "rotate(-10deg)" }}>📸</div>
      <div style={{ position: "fixed", top: "400px", left: "20px", opacity: 0.12, pointerEvents: "none", zIndex: 0, fontSize: "20px", transform: "rotate(25deg)" }}>🌸</div>
      <div style={{ position: "fixed", top: "480px", left: "35px", opacity: 0.1, pointerEvents: "none", zIndex: 0, fontSize: "18px" }}>🎒</div>
      <div style={{ position: "fixed", top: "560px", left: "10px", opacity: 0.12, pointerEvents: "none", zIndex: 0, fontSize: "24px", transform: "rotate(-15deg)" }}>🏔️</div>

      {/* Top right doodles */}
      <div style={{ position: "fixed", top: "80px", right: "10px", opacity: 0.15, pointerEvents: "none", zIndex: 0, fontSize: "24px", transform: "rotate(20deg)" }}>🌴</div>
      <div style={{ position: "fixed", top: "160px", right: "30px", opacity: 0.1, pointerEvents: "none", zIndex: 0, fontSize: "18px", transform: "rotate(-15deg)" }}>☀️</div>
      <div style={{ position: "fixed", top: "240px", right: "15px", opacity: 0.12, pointerEvents: "none", zIndex: 0, fontSize: "22px" }}>🍜</div>
      <div style={{ position: "fixed", top: "320px", right: "40px", opacity: 0.1, pointerEvents: "none", zIndex: 0, fontSize: "16px", transform: "rotate(10deg)" }}>🛺</div>
      <div style={{ position: "fixed", top: "400px", right: "20px", opacity: 0.12, pointerEvents: "none", zIndex: 0, fontSize: "20px", transform: "rotate(-25deg)" }}>🎨</div>
      <div style={{ position: "fixed", top: "480px", right: "35px", opacity: 0.1, pointerEvents: "none", zIndex: 0, fontSize: "18px" }}>🌺</div>
      <div style={{ position: "fixed", top: "560px", right: "10px", opacity: 0.12, pointerEvents: "none", zIndex: 0, fontSize: "24px", transform: "rotate(15deg)" }}>🏛️</div>
    </>
  );
}

export default function Planner() {
  const [form, setForm] = useState({
    city: "", days: "5", budget: "15000",
    group: "solo", interests: "", month: "October",
  });
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [highlightedPlace, setHighlightedPlace] = useState<{lat: number; lng: number; name: string} | null>(null);
  const saveTrip = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please login to save trips!");
      window.location.href = "/login";
      return;
    }
    const { error } = await supabase.from("saved_trips").insert({
      user_id: user.id,
      destination: itinerary.destination,
      itinerary: itinerary,
    });
    if (error) {
      alert("Could not save trip. Try again!");
    } else {
      alert("Trip saved! View it in your profile.");
    }
  };

  const handleSubmit = async () => {
    if (!form.city || !form.interests) { alert("Please fill city and interests!"); return; }
    setLoading(true); setItinerary(null); setActiveDay(0);
    const res = await fetch("/api/plan", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) setItinerary(data.itinerary);
    else alert("Could not generate. Try again!");
    setLoading(false);
  };

  const totalBudget = itinerary?.budget_breakdown
    ? Object.values(itinerary.budget_breakdown).reduce((a: any, b: any) => a + b, 0) : 0;

  const day = itinerary?.days?.[activeDay];
  const moodColor = day ? (moodColors[day.mood] || "var(--accent)") : "var(--accent)";

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", position: "relative" }}>
      <Doodles />

      {/* Glow */}
      <div style={{
        position: "fixed", top: 0, left: "30%", width: "600px", height: "400px",
        background: "var(--gradient)", opacity: 0.06, filter: "blur(100px)",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* FORM PAGE */}
      {!itinerary && !loading && (
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 24px 100px", position: "relative", zIndex: 1 }}>
          <a href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "14px" }}>← Back to Home</a>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "52px", fontWeight: 900, marginTop: "16px",
            background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>AI Trip Planner</h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: "40px" }}>Your story begins here. Fill in the details.</p>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "40px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Starting City</label>
              <input type="text" placeholder="e.g. Delhi  OR  Jaipur to Delhi"
                value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", boxSizing: "border-box", background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Duration (days)</label>
                <input type="number" min={1} max={15} value={form.days}
                  onChange={(e) => setForm({ ...form, days: e.target.value })}
                  style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", boxSizing: "border-box", background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "14px", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Total Budget (₹)</label>
                <input type="number" value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", boxSizing: "border-box", background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "14px", outline: "none" }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Travelling As</label>
              <div style={{ display: "flex", gap: "10px" }}>
                {["solo", "couple", "family", "friends"].map((g) => (
                  <button key={g} onClick={() => setForm({ ...form, group: g })}
                    style={{ padding: "10px 20px", borderRadius: "50px", fontSize: "13px", fontWeight: 600, cursor: "pointer", background: form.group === g ? "var(--gradient)" : "var(--bg-secondary)", color: form.group === g ? "white" : "var(--text-secondary)", border: form.group === g ? "none" : "1px solid var(--border)" }}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Travel Month</label>
              <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}
                style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}>
                {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => (
                  <option key={m} style={{ background: "var(--bg-card)" }}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>Interests</label>
              <input type="text" placeholder="e.g. history, street food, photography, trekking..."
                value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })}
                style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", boxSizing: "border-box", background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"} />
            </div>

            <button onClick={handleSubmit}
              style={{ background: "var(--gradient)", color: "white", padding: "18px", borderRadius: "12px", border: "none", fontWeight: 700, fontSize: "16px", cursor: "pointer" }}>
              Generate My Storybook Itinerary →
            </button>
          </div>
        </div>
      )}

    {/* LOADING */}
{loading && (
  <div style={{ textAlign: "center", padding: "120px 24px", position: "relative", zIndex: 1 }}>
    <button
      onClick={() => { setLoading(false); setItinerary(null); }}
      style={{
        position: "absolute", top: "20px", left: "24px",
        background: "var(--bg-card)", border: "1px solid var(--border)",
        color: "var(--text-secondary)", padding: "8px 16px",
        borderRadius: "50px", fontSize: "13px", cursor: "pointer",
        fontWeight: 600
      }}>
      ← Cancel
    </button>
    <div style={{ fontSize: "80px", marginBottom: "24px" }}>✨</div>
    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 700, marginBottom: "12px" }}>
      Crafting your travel story...
    </h2>
    <p style={{ color: "var(--text-secondary)" }}>Finding hotels, cafes, restaurants, shopping spots just for you</p>
    <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "13px", opacity: 0.6 }}>
      This takes 15-20 seconds for longer trips
    </p>
  </div>
)}

      {/* ITINERARY — 3 COLUMN LAYOUT */}
      {itinerary && !loading && (
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* Cover */}
          <div style={{ position: "relative", height: "450px", marginBottom: "0" }}>
            <PexelsImage query={itinerary.destination} width={1400} height={450}
            style={{ width: "100%", height: "450px", display: "block" }} alt={itinerary.destination} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)",
              display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "40px 60px"
            }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <span style={{ background: "var(--gradient)", padding: "4px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: 700, color: "white" }}>{itinerary.vibe}</span>
                <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 14px", borderRadius: "50px", fontSize: "12px", color: "white" }}>🌤 {itinerary.weather}</span>
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "56px", fontWeight: 900, color: "white", marginBottom: "8px" }}>
                {itinerary.coverEmoji} {itinerary.destination}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "20px", fontStyle: "italic" }}>"{itinerary.tagline}"</p>
            </div>
          </div>

          {/* Budget bar */}
          <div style={{ background: "var(--bg-secondary)", padding: "20px 60px", display: "flex", alignItems: "center", gap: "24px", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "16px" }}>💰 Budget:</span>
            {itinerary.budget_breakdown && Object.entries(itinerary.budget_breakdown).map(([key, val]: any) => {
              const colors: Record<string, string> = { transport: "#ff6b35", accommodation: "#6c63ff", food: "#f7c948", activities: "#00d4ff", shopping: "#00ff88" };
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: colors[key] || "var(--accent)" }} />
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "capitalize" }}>{key}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: colors[key] || "var(--accent)" }}>₹{val.toLocaleString()}</span>
                </div>
              );
            })}
            <span style={{ marginLeft: "auto", fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700 }}>
              Total: <span style={{ background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>₹{(totalBudget as number).toLocaleString()}</span>
            </span>
          </div>

          {/* Day tabs */}
          <div style={{ background: "var(--bg-secondary)", padding: "16px 60px", display: "flex", gap: "8px", borderBottom: "1px solid var(--border)" }}>
            {itinerary.days?.map((d: any, i: number) => (
              <button key={i} onClick={() => setActiveDay(i)}
                style={{ padding: "8px 20px", borderRadius: "50px", fontSize: "13px", fontWeight: 700, cursor: "pointer", transition: "all 0.2s", background: activeDay === i ? "var(--gradient)" : "var(--bg-card)", color: activeDay === i ? "white" : "var(--text-secondary)", border: activeDay === i ? "none" : "1px solid var(--border)" }}>
                Day {d.day}
              </button>
            ))}
            <button onClick={saveTrip}
              style={{ padding: "8px 20px", borderRadius: "50px", fontSize: "12px", fontWeight: 700, cursor: "pointer", background: "var(--bg-card)", color: "var(--accent)", border: "1px solid var(--accent)" }}>
              ❤️ Save
            </button>
            <DownloadPDF itinerary={itinerary} />
            <button onClick={() => { setItinerary(null); setActiveDay(0); }}
              style={{ marginLeft: "auto", padding: "8px 20px", borderRadius: "50px", fontSize: "12px", fontWeight: 600, cursor: "pointer", background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              ← New Trip
            </button>
          </div>

          {/* 3 COLUMN LAYOUT */}
          {day && (
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 280px", gap: "0", minHeight: "100vh" }}>

              {/* LEFT SIDEBAR — Hotels */}
              <div style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", padding: "24px 20px", overflowY: "auto" }}>

                {/* Doodle header */}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <div style={{ fontSize: "32px" }}>🏨</div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, marginTop: "8px" }}>Where to Stay</h3>
                  <div style={{ fontSize: "20px", marginTop: "4px" }}>✦ ✦ ✦</div>
                </div>

                {day.hotels?.map((hotel: any, i: number) => (
                  <div key={i}
                  onClick={() => setHighlightedPlace({ lat: day.coordinates?.[0]?.lat || 0, lng: day.coordinates?.[0]?.lng || 0, name: hotel.name })}
                  style={{
                    background: "var(--bg-card)", borderRadius: "16px", padding: "16px",
                    marginBottom: "12px", border: "1px solid var(--border)",
                    borderTop: `3px solid ${i === 0 ? "#f7c948" : i === 1 ? "#00d4ff" : "#00ff88"}`,
                    cursor: "pointer"
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, lineHeight: 1.3 }}>{hotel.name}</span>
                      <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "50px", background: "var(--bg-secondary)", color: "var(--text-secondary)", whiteSpace: "nowrap", marginLeft: "6px" }}>{hotel.type}</span>
                    </div>
                    <StarRating rating={hotel.rating} />
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "6px", lineHeight: 1.5 }}>{hotel.highlight}</p>
                    <div style={{ marginTop: "8px", fontWeight: 700, color: "var(--accent)", fontSize: "14px" }}>₹{hotel.price}<span style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: 400 }}>/night</span></div>
                  </div>
                ))}

                {/* Doodle separator */}
                <div style={{ textAlign: "center", margin: "20px 0", fontSize: "18px", opacity: 0.4 }}>~ ~ ~ ~ ~</div>

                {/* Shopping */}
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <div style={{ fontSize: "28px" }}>🛍️</div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700, marginTop: "6px" }}>Shop Here</h3>
                </div>

                {day.shopping?.map((shop: any, i: number) => (
                  <div key={i}
                  onClick={() => shop.lat && shop.lng && setHighlightedPlace({ lat: shop.lat, lng: shop.lng, name: shop.name })}
                  style={{
                    background: "var(--bg-card)", borderRadius: "12px", padding: "12px",
                    marginBottom: "10px", border: "1px solid var(--border)",
                    cursor: "pointer"
                    }}>
                    <div style={{ fontSize: "18px", marginBottom: "4px" }}>{shop.emoji}</div>
                    <div style={{ fontSize: "12px", fontWeight: 700 }}>{shop.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "3px" }}>{shop.items}</div>
                    <div style={{ fontSize: "11px", color: "var(--accent2)", marginTop: "4px", fontWeight: 600 }}>{shop.priceRange}</div>
                  </div>
                ))}
              </div>

              {/* CENTER — Main storybook */}
              <div style={{ padding: "0", overflowY: "auto" }}>

                {/* Day image */}
                <div style={{ position: "relative" }}>
                  <PexelsImage query={day.imageKeyword} width={800} height={320}
                  style={{ width: "100%", height: "320px", display: "block" }} alt={day.title} />
                    <div style={{ position: "absolute", top: "80px", left: "20px", zIndex: 10 }}>
                      <a href="/" style={{
                        background: "rgba(0,0,0,0.6)", color: "white",
                        padding: "8px 16px", borderRadius: "50px",
                        textDecoration: "none", fontSize: "13px", fontWeight: 600,
                        backdropFilter: "blur(10px)"
                        }}>← Home</a>
                    </div>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)",
                    display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "24px"
                  }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ padding: "4px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: 700, background: moodColor, color: "white" }}>{day.mood}</span>
                      <span style={{ padding: "4px 14px", borderRadius: "50px", fontSize: "12px", background: "rgba(255,255,255,0.2)", color: "white" }}>Day {day.day}</span>
                    </div>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 900, color: "white" }}>{day.title}</h3>
                  </div>
                </div>

                <div style={{ padding: "24px" }}>
                  {/* Story */}
                  <p style={{ fontSize: "15px", lineHeight: 1.9, color: "var(--text-secondary)", fontStyle: "italic", marginBottom: "24px", borderLeft: `3px solid ${moodColor}`, paddingLeft: "16px" }}>
                    {day.story}
                  </p>

                  {/* Timeline */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
                    {[
                      { time: "Morning", data: day.morning, emoji: "🌅" },
                      { time: "Afternoon", data: day.afternoon, emoji: "☀️" },
                      { time: "Evening", data: day.evening, emoji: "🌆" },
                    ].map(({ time, data, emoji }) => data && (
                      <div key={time} style={{ display: "flex", gap: "14px", alignItems: "flex-start", background: "var(--bg-secondary)", borderRadius: "14px", padding: "14px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0, background: "var(--bg-card)", border: `2px solid ${moodColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                          {data.emoji || emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "11px", color: moodColor, fontWeight: 700 }}>{time}</span>
                            <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>₹{data.cost}</span>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: "14px", marginTop: "2px" }}>{data.activity}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{data.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Food card */}
                  {day.food && (
                    <div style={{ display: "flex", gap: "14px", alignItems: "center", background: "var(--bg-secondary)", borderRadius: "16px", padding: "14px", border: "1px solid var(--border)", marginBottom: "24px" }}>
                      <PexelsImage query={day.foodImageKeyword} width={120} height={120}
                      style={{ width: "80px", height: "80px", borderRadius: "12px", flexShrink: 0 }} alt={day.food.name} />
                      <div>
                        <div style={{ fontSize: "10px", color: "var(--accent2)", fontWeight: 700, marginBottom: "3px" }}>🍛 TODAY'S MUST-EAT</div>
                        <div style={{ fontWeight: 700, fontSize: "15px" }}>{day.food.name} {day.food.emoji}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>{day.food.description}</div>
                        <div style={{ fontSize: "12px", color: "var(--accent)", marginTop: "4px", fontWeight: 600 }}>~₹{day.food.cost}</div>
                      </div>
                    </div>
                  )}

                  {/* Map */}
                  {day.coordinates && day.coordinates.length > 0 && (
                    <div style={{ marginBottom: "24px" }}>
                      <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "10px" }}>🗺️ Today's Route</h4>
                      <TripMap places={day.coordinates} highlighted={highlightedPlace} />
                    </div>
                  )}

                  {/* Hidden tips */}
                  {itinerary.hidden_tips && (
                    <div style={{ background: "var(--bg-secondary)", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
                      <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>🤫 Hidden Tips</h4>
                      {itinerary.hidden_tips.map((tip: string, i: number) => (
                        <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                          <span style={{ color: "var(--accent2)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                          <span style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT SIDEBAR — Cafes & Restaurants */}
              <div style={{ background: "var(--bg-secondary)", borderLeft: "1px solid var(--border)", padding: "24px 20px", overflowY: "auto" }}>

                {/* Cafes */}
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <div style={{ fontSize: "32px" }}>☕</div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700, marginTop: "8px" }}>Cafes</h3>
                  <div style={{ fontSize: "20px", marginTop: "4px" }}>✦ ✦ ✦</div>
                </div>
                
                {day.cafes?.map((cafe: any, i: number) => (
                  <div key={i}
                  onClick={() => cafe.lat && cafe.lng && setHighlightedPlace({ lat: cafe.lat, lng: cafe.lng, name: cafe.name })}
                  style={{
                    background: "var(--bg-card)", borderRadius: "14px", padding: "14px",
                    marginBottom: "12px", border: "1px solid var(--border)",
                    cursor: "pointer"
                    }}>
                    <div style={{ fontSize: "20px", marginBottom: "6px" }}>{cafe.emoji}</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>{cafe.name}</div>
                    <StarRating rating={cafe.rating} />
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "6px" }}>{cafe.specialty}</div>
                    <div style={{ fontSize: "12px", color: "var(--accent)", marginTop: "6px", fontWeight: 600 }}>~₹{cafe.price}</div>
                  </div>
                ))}

                {/* Doodle separator */}
                <div style={{ textAlign: "center", margin: "20px 0", fontSize: "18px", opacity: 0.4 }}>~ ~ ~ ~ ~</div>

                {/* Restaurants */}
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <div style={{ fontSize: "28px" }}>🍽️</div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700, marginTop: "6px" }}>Restaurants</h3>
                </div>

                {day.restaurants?.map((rest: any, i: number) => (
                  <div key={i}
                  onClick={() => rest.lat && rest.lng && setHighlightedPlace({ lat: rest.lat, lng: rest.lng, name: rest.name })}
                  style={{
                    background: "var(--bg-card)", borderRadius: "14px", padding: "14px",
                    marginBottom: "12px", border: "1px solid var(--border)",
                    cursor: "pointer"
                    }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>{rest.name}</div>
                    <StarRating rating={rest.rating} />
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "6px" }}>
                      {rest.cuisine} cuisine
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--accent2)", marginTop: "4px" }}>
                      Must try: <span style={{ fontWeight: 700 }}>{rest.mustTry}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--accent)", marginTop: "6px", fontWeight: 600 }}>~₹{rest.price}/person</div>
                  </div>
                ))}

                {/* Packing */}
                <div style={{ textAlign: "center", margin: "20px 0 16px" }}>
                  <div style={{ fontSize: "28px" }}>🎒</div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700, marginTop: "6px" }}>Pack This</h3>
                </div>
                {itinerary.packing?.map((item: string, i: number) => (
                  <div key={i} style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "6px 0", borderBottom: "1px solid var(--border)", display: "flex", gap: "8px" }}>
                    <span style={{ color: "var(--accent)" }}>✓</span> {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}