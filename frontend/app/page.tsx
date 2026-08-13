"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "./components/Navbar";

const SLIDES = [
  { keyword: "taj mahal agra india", place: "Taj Mahal, Agra" },
  { keyword: "varanasi ghats india", place: "Varanasi Ghats" },
  { keyword: "ladakh mountains india", place: "Ladakh" },
  { keyword: "rajasthan palace india", place: "Rajasthan" },
  { keyword: "kerala backwaters india", place: "Kerala Backwaters" },
  { keyword: "hampi ruins india", place: "Hampi" },
];

const features = [
  { icon: "🗺️", title: "Hidden Gems", desc: "Places MakeMyTrip will never show you.", href: "/discover" },
  { icon: "🤖", title: "AI Trip Planner", desc: "Full itinerary with budget breakdown.", href: "/planner" },
  { icon: "🛍️", title: "Shopping", desc: "Best markets across all of India.", href: "/shopping" },
  { icon: "🌙", title: "Night Tourism", desc: "India after dark — curated.", href: "/nightlife" },
  { icon: "🎵", title: "Live Events", desc: "Concerts, matches, festivals nearby.", href: "/events" },
  { icon: "💬", title: "Ask Bharat", desc: "Your AI guide for offbeat India.", href: "/chat" },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const router = useRouter();

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/discover?q=${encodeURIComponent(searchQuery)}`);
  };

  // Fetch Pexels images for slides
  useEffect(() => {
    const fetchImages = async () => {
      const key = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
      if (!key) return;
      const imgs: string[] = [];
      for (const slide of SLIDES) {
        try {
          const res = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(slide.keyword)}&per_page=1&orientation=landscape`,
            { headers: { Authorization: key } }
          );
          const data = await res.json();
          if (data.photos?.[0]?.src?.landscape) {
            imgs.push(data.photos[0].src.landscape);
          } else {
            imgs.push(`https://picsum.photos/seed/${slide.keyword.replace(/\s/g, "-")}/1600/900`);
          }
        } catch {
          imgs.push(`https://picsum.photos/seed/${slide.keyword.replace(/\s/g, "-")}/1600/900`);
        }
      }
      setSlideImages(imgs);
    };
    fetchImages();
  }, []);

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Navbar />

      {/* Hero with slideshow */}
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>

        {/* Slideshow background */}
        {slideImages.map((img, i) => (
          <div key={i} style={{
            position: "absolute", inset: 0, zIndex: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: "cover", backgroundPosition: "center",
            opacity: i === currentSlide ? 1 : 0,
            transition: "opacity 1.5s ease-in-out"
          }} />
        ))}

        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 100%)"
        }} />

        {/* Slide indicator dots */}
        <div style={{
          position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: "8px", zIndex: 3
        }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)}
              style={{
                width: i === currentSlide ? "24px" : "8px", height: "8px",
                borderRadius: "50px", border: "none", cursor: "pointer",
                background: i === currentSlide ? "var(--accent)" : "rgba(255,255,255,0.4)",
                transition: "all 0.3s", padding: 0
              }} />
          ))}
        </div>

        {/* Place name */}
        <div style={{
          position: "absolute", bottom: "56px", right: "24px", zIndex: 3,
          fontSize: "12px", color: "rgba(255,255,255,0.6)", fontStyle: "italic"
        }}>
          📍 {SLIDES[currentSlide]?.place}
        </div>

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "80px 24px 60px", maxWidth: "800px", width: "100%" }}>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(36px, 8vw, 88px)",
            fontWeight: 900, lineHeight: 1.1, marginBottom: "24px",
            color: "white", textShadow: "0 2px 20px rgba(0,0,0,0.5)"
          }}>
            Discover India<br />
            <span style={{
              background: "var(--gradient)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>
              beyond the obvious
            </span>
          </h1>

          <p style={{
            fontSize: "clamp(14px, 2vw, 18px)", color: "rgba(255,255,255,0.8)",
            maxWidth: "580px", margin: "0 auto 32px", lineHeight: 1.7
          }}>
            AI-powered travel curator for hidden gems, personalised itineraries,
            and real local experiences across India.
          </p>

          {/* Search bar */}
          <div style={{ display: "flex", gap: "0", maxWidth: "560px", margin: "0 auto 24px" }}>
            <input type="text" value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search places, experiences, food..."
              style={{
                flex: 1, padding: "16px 20px",
                borderRadius: "50px 0 0 50px",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRight: "none", color: "white",
                fontSize: "14px", outline: "none"
              }} />
            <button onClick={handleSearch}
              style={{
                padding: "16px 24px", borderRadius: "0 50px 50px 0",
                background: "var(--gradient)", color: "white",
                border: "none", fontWeight: 700, fontSize: "14px", cursor: "pointer",
                whiteSpace: "nowrap"
              }}>
              Search →
            </button>
          </div>

          {/* Quick searches */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap", marginBottom: "32px" }}>
            {["hidden beaches", "mountain villages", "street food", "heritage forts", "night markets"].map((q) => (
              <button key={q} onClick={() => router.push(`/discover?q=${encodeURIComponent(q)}`)}
                style={{
                  padding: "6px 14px", borderRadius: "50px", fontSize: "12px",
                  background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
                  color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.3)",
                  cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
                {q}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/discover" style={{
              background: "var(--gradient)", color: "white",
              padding: "14px 32px", borderRadius: "50px",
              fontWeight: 700, textDecoration: "none", fontSize: "15px"
            }}>
              Explore Hidden Gems →
            </Link>
            <Link href="/planner" style={{
              background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
              color: "white", padding: "14px 32px", borderRadius: "50px",
              fontWeight: 700, textDecoration: "none", fontSize: "15px",
              border: "1px solid rgba(255,255,255,0.3)"
            }}>
              Plan My Trip
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "40px 24px", display: "flex", justifyContent: "center", gap: "clamp(24px, 8vw, 64px)", flexWrap: "wrap" }}>
        {[
          { value: "28+", label: "States covered" },
          { value: "100+", label: "Hidden gems" },
          { value: "₹0", label: "Cost to use" },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 900,
              background: "var(--gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>{s.value}</div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: "20px 24px 80px", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 4vw, 36px)",
          fontWeight: 700, textAlign: "center", marginBottom: "32px"
        }}>Everything in one place</h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px"
        }}>
          {features.map((f) => (
            <Link key={f.href} href={f.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "20px", padding: "24px", cursor: "pointer", transition: "all 0.2s"
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{ fontSize: "36px" }}>{f.icon}</div>
                <div style={{
                  fontFamily: "'Playfair Display', serif", fontSize: "20px",
                  fontWeight: 700, margin: "12px 0 6px", color: "var(--text-primary)"
                }}>{f.title}</div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</div>
                <div style={{ marginTop: "12px", fontSize: "13px", fontWeight: 600, color: "var(--accent)" }}>
                  Explore →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bharat CTA */}
      <div style={{ padding: "0 24px 80px", maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "24px", padding: "clamp(24px, 5vw, 48px)"
        }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🤖</div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 700, marginBottom: "12px"
          }}>Meet Bharat</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "28px", lineHeight: 1.7, fontSize: "14px" }}>
            Your AI travel companion who knows every hidden corner of India.
          </p>
          <Link href="/chat" style={{
            background: "var(--gradient)", color: "white",
            padding: "14px 36px", borderRadius: "50px",
            fontWeight: 700, textDecoration: "none", fontSize: "15px", display: "inline-block"
          }}>
            Chat with Bharat →
          </Link>
        </div>
      </div>

      <footer style={{
        textAlign: "center", padding: "24px", fontSize: "13px",
        color: "var(--text-secondary)", opacity: 0.5,
        borderTop: "1px solid var(--border)"
      }}>
        Built with ❤️ by Team BharatXplorers
      </footer>
    </div>
  );
}