"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import PexelsImage from "../components/PexelsImage";
import SlideshowBg from "../components/SlideshowBg";
const TripMap = dynamic(() => import("../components/Map"), { ssr: false });

const CATEGORIES = [
  { label: "Sarees & Fabric", emoji: "🥻", defaultBudget: "5000" },
  { label: "Jewellery", emoji: "💎", defaultBudget: "10000" },
  { label: "Books", emoji: "📚", defaultBudget: "1000" },
  { label: "Spices", emoji: "🌶️", defaultBudget: "500" },
  { label: "Handicrafts", emoji: "🎨", defaultBudget: "3000" },
  { label: "Electronics", emoji: "📱", defaultBudget: "20000" },
  { label: "Antiques", emoji: "🏺", defaultBudget: "15000" },
  { label: "Clothing", emoji: "👗", defaultBudget: "2000" },
  { label: "Leather", emoji: "👜", defaultBudget: "4000" },
  { label: "Tea & Coffee", emoji: "☕", defaultBudget: "800" },
];

const priceColors: Record<string, string> = {
  Budget: "#00ff88", Mid: "#f7c948", Premium: "#ff6b35",
};

function isOpenNow(openTime: string, closeTime: string, closedOn: string): boolean {
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  if (closedOn && closedOn !== "None" && closedOn.includes(day.slice(0, 3))) return false;

  const parseTime = (t: string) => {
    const [time, period] = t.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return h * 60 + m;
  };

  try {
    const current = now.getHours() * 60 + now.getMinutes();
    return current >= parseTime(openTime) && current <= parseTime(closeTime);
  } catch { return true; }
}

function imgUrl(keyword: string) {
  const seed = keyword.replace(/\s+/g, "-").toLowerCase();
  return `https://picsum.photos/seed/${seed}/400/200`;
}

function ShopCard({ shop, isHidden = false, onLocate }: { shop: any; isHidden?: boolean; onLocate: (shop: any) => void }) {
  const open = isOpenNow(shop.openTime, shop.closeTime, shop.closedOn);

  return (
    <div
      style={{
        background: "var(--bg-card)", border: `1px solid ${isHidden ? "var(--accent2)" : "var(--border)"}`,
        borderRadius: "16px", overflow: "hidden", transition: "all 0.2s", marginBottom: "16px"
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}

    >
      <SlideshowBg opacity={0.12} />
      {/* Image */}
      <div style={{ position: "relative" }}>
        <PexelsImage query={shop.name + " " + shop.city + " market india"}
  width={400} height={140}
  style={{ width: "100%", height: "140px", display: "block" }}
  alt={shop.name} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)",
          display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "12px"
        }}>
          <span style={{
            fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "50px",
            background: open ? "#00ff88" : "#ff4d6d", color: "black"
          }}>{open ? "● Open Now" : "● Closed"}</span>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)" }}>
            {shop.openTime} - {shop.closeTime}
          </span>
        </div>
        {shop.established && (
          <div style={{
            position: "absolute", top: "10px", right: "10px",
            background: "rgba(0,0,0,0.7)", borderRadius: "50px",
            padding: "3px 10px", fontSize: "10px", color: "var(--accent2)"
          }}>Est. {shop.established}</div>
        )}
      </div>

      <div style={{ padding: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700, lineHeight: 1.3 }}>
            {shop.emoji} {shop.name}
          </h3>
          <span style={{ fontSize: "11px", color: "#f7c948", flexShrink: 0, marginLeft: "6px" }}>★ {shop.rating}</span>
        </div>

        <p style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 600, marginBottom: "8px" }}>
          📍 {shop.city}, {shop.state}
        </p>

        <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "10px" }}>
          {shop.description}
        </p>

        {isHidden && shop.whyHidden && (
          <div style={{ background: "var(--bg-secondary)", borderRadius: "8px", padding: "8px", marginBottom: "10px", borderLeft: "3px solid var(--accent2)" }}>
            <p style={{ fontSize: "10px", color: "var(--accent2)", fontWeight: 700, marginBottom: "2px" }}>🤫 WHY LOCALS LOVE IT</p>
            <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{shop.whyHidden}</p>
          </div>
        )}

        <div style={{ background: "var(--bg-secondary)", borderRadius: "8px", padding: "8px", marginBottom: "10px", borderLeft: "3px solid var(--accent)" }}>
          <p style={{ fontSize: "10px", color: "var(--accent)", fontWeight: 700, marginBottom: "2px" }}>🛍️ MUST BUY</p>
          <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{shop.mustBuy}</p>
        </div>

        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
          {shop.famousFor?.map((item: string) => (
            <span key={item} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "50px", background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              {item}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "50px", background: priceColors[shop.priceRange] + "30", color: priceColors[shop.priceRange], border: `1px solid ${priceColors[shop.priceRange]}` }}>
            {shop.priceRange}
          </span>
          {shop.closedOn && shop.closedOn !== "None" && (
            <span style={{ fontSize: "10px", color: "var(--text-secondary)" }}>Closed: {shop.closedOn}</span>
          )}
          <button
            onClick={() => onLocate(shop)}
            style={{ fontSize: "11px", padding: "4px 12px", borderRadius: "50px", background: "var(--gradient)", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>
            📍 Locate
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Shopping() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const handleBudgetChange = (val: string) => {
  setBudget(val);
};
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [famousMarkets, setFamousMarkets] = useState<any[]>([]);
  const [hiddenGems, setHiddenGems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [highlighted, setHighlighted] = useState<any>(null);
  const [allPlaces, setAllPlaces] = useState<any[]>([]);

const search = async (q?: string, b?: string) => {
  const searchQuery = q || query;
  if (!searchQuery.trim()) return;
  setLoading(true); setSearched(true);
  setFamousMarkets([]); setHiddenGems([]);

  const res = await fetch("/api/shopping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: searchQuery, city, budget: b || budget }),
  });
    const data = await res.json();
    
    // Filter by budget on frontend too
if (budget && Number(budget) > 0) {
  const budgetNum = Number(budget);
  const filterByBudget = (shops: any[]) => shops.filter(s => {
    if (s.priceRange === "Budget") return budgetNum >= 500;
    if (s.priceRange === "Mid") return budgetNum >= 2000;
    if (s.priceRange === "Premium") return budgetNum >= 10000;
    return true;
  });
  setFamousMarkets(filterByBudget(data.famous_markets || []));
  setHiddenGems(filterByBudget(data.hidden_gems || []));
} else {
  setFamousMarkets(data.famous_markets || []);
  setHiddenGems(data.hidden_gems || []);
}
    

    const places = [
      ...(data.famous_markets || []).map((s: any) => ({ name: s.name, lat: s.lat, lng: s.lng })),
      ...(data.hidden_gems || []).map((s: any) => ({ name: s.name, lat: s.lat, lng: s.lng })),
    ].filter(p => p.lat && p.lng);
    setAllPlaces(places);
    setLoading(false);
  };

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>

      {/* Glow */}
      <div style={{
        position: "fixed", top: 0, left: "20%", width: "600px", height: "400px",
        background: "var(--gradient)", opacity: 0.05, filter: "blur(100px)",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* Header */}
      <div style={{ padding: "80px 40px 0", position: "relative", zIndex: 1 }}>
        <a href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "14px" }}>← Back to Home</a>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "52px", fontWeight: 900, marginTop: "16px",
          background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>Shop India</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "16px" }}>
          From legendary bazaars to hidden local gems — find the best shopping across all of India.
        </p>
      </div>

      {/* Category chips */}
      <div style={{ padding: "24px 40px 0", position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>What are you shopping for?</p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button key={cat.label}
              onClick={() => {
                setSelectedCategory(cat);
                setQuery(cat.label);
                setBudget(cat.defaultBudget);
              }}
              style={{
                padding: "10px 18px", borderRadius: "50px", fontSize: "13px", fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s",
                background: selectedCategory?.label === cat.label ? "var(--gradient)" : "var(--bg-card)",
                color: selectedCategory?.label === cat.label ? "white" : "var(--text-secondary)",
                border: selectedCategory?.label === cat.label ? "none" : "1px solid var(--border)"
              }}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding: "20px 40px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", gap: "12px", maxWidth: "900px", flexWrap: "wrap" }}>
          <input type="text" value={query}
            onChange={(e) => { setQuery(e.target.value); if (!e.target.value) { setSearched(false); setFamousMarkets([]); setHiddenGems([]); } }}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="What do you want to buy? e.g. silk sarees, antiques..."
            style={{ flex: 2, minWidth: "220px", padding: "14px 20px", borderRadius: "50px", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"} />

          <input type="text" value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (optional)"
            style={{ flex: 1, minWidth: "140px", padding: "14px 20px", borderRadius: "50px", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
            onFocus={e => e.target.style.borderColor = "var(--accent)"}
            onBlur={e => e.target.style.borderColor = "var(--border)"} />

          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "50px", padding: "0 16px", minWidth: "160px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>₹</span>
            <input type="number" value={budget}
              onChange={(e) => handleBudgetChange(e.target.value)}
              onBlur={() => searched && search()}
              placeholder="Max budget"
              style={{ flex: 1, background: "transparent", border: "none", color: "var(--text-primary)", fontSize: "14px", outline: "none", width: "100px" }} />
          </div>

          <button onClick={() => search()}
            style={{ padding: "14px 28px", borderRadius: "50px", background: "var(--gradient)", color: "white", border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
            Search →
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "80px", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🛍️</div>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>Finding the best shopping spots...</p>
        </div>
      )}

      {/* Results — 3 column layout */}
      {!loading && searched && (famousMarkets.length > 0 || hiddenGems.length > 0) && (
        <div style={{ padding: "32px 40px 80px", position: "relative", zIndex: 1 }}>
          <div className="shopping-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "24px" }}>

            {/* LEFT — Famous Markets */}
            <div>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "32px" }}>🏛️</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, marginTop: "8px" }}>
                  Famous Markets
                </h2>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Legendary, iconic, must-visit
                </p>
              </div>
              {famousMarkets.map((shop, i) => (
                <ShopCard key={i} shop={shop} onLocate={(s) => setHighlighted({ lat: s.lat, lng: s.lng, name: s.name })} />
              ))}
            </div>

            {/* CENTER — Map */}
            <div>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "32px" }}>🗺️</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, marginTop: "8px" }}>
                  Shopping Map
                </h2>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Click any shop to locate it
                </p>
              </div>
              <div style={{ position: "sticky", top: "80px" }}>
                <TripMap places={allPlaces} highlighted={highlighted} />
                {highlighted && (
                  <div style={{ marginTop: "12px", background: "var(--bg-card)", borderRadius: "12px", padding: "12px", border: "1px solid var(--accent)", textAlign: "center" }}>
                    <p style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 700 }}>📍 Viewing: {highlighted.name}</p>
                    <button onClick={() => setHighlighted(null)} style={{ fontSize: "11px", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", marginTop: "4px" }}>
                      Clear ×
                    </button>
                  </div>
                )}

                {/* Budget tip */}
                {budget && (
                  <div style={{ marginTop: "16px", background: "var(--bg-card)", borderRadius: "16px", padding: "16px", border: "1px solid var(--border)" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px" }}>💰 Budget Guide</h4>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      Your budget: <span style={{ color: "var(--accent)", fontWeight: 700 }}>₹{Number(budget).toLocaleString()}</span>
                    </p>
                    <div style={{ marginTop: "8px" }}>
                      {famousMarkets.filter(s => {
                        const ranges: Record<string, number> = { Budget: 1000, Mid: 5000, Premium: 999999 };
                        return ranges[s.priceRange] <= Number(budget);
                      }).length > 0 && (
                        <p style={{ fontSize: "11px", color: "#00ff88" }}>
                          ✓ {famousMarkets.filter(s => {
                            const ranges: Record<string, number> = { Budget: 1000, Mid: 5000, Premium: 999999 };
                            return ranges[s.priceRange] <= Number(budget);
                          }).length} famous markets within budget
                        </p>
                      )}
                      {hiddenGems.filter(s => s.priceRange === "Budget").length > 0 && (
                        <p style={{ fontSize: "11px", color: "#00ff88", marginTop: "4px" }}>
                          ✓ {hiddenGems.filter(s => s.priceRange === "Budget").length} hidden gems are budget friendly
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Hidden Gems */}
            <div>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ fontSize: "32px" }}>💎</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, marginTop: "8px" }}>
                  Local Gems
                </h2>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Hidden spots only locals know
                </p>
              </div>
              {hiddenGems.map((shop, i) => (
                <ShopCard key={i} shop={shop} isHidden onLocate={(s) => setHighlighted({ lat: s.lat, lng: s.lng, name: s.name })} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Initial state */}
      {!searched && !loading && (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🛍️</div>
          <p style={{ fontSize: "18px" }}>Select a category or search above</p>
          <p style={{ fontSize: "14px", marginTop: "8px", opacity: 0.6 }}>
            We'll show you famous markets AND hidden local gems side by side
          </p>
        </div>
      )}
    </div>
  );
}