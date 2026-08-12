"use client";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    router.push(`/discover?q=${encodeURIComponent(searchQuery)}`);
  };
  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Navbar />

      {/* Glow blob */}
      <div style={{
        position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "400px", borderRadius: "50%",
        background: "var(--gradient)", opacity: 0.07, filter: "blur(80px)",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "120px 24px 60px", position: "relative", zIndex: 1 }}>
        <span style={{
          display: "inline-block", fontSize: "13px", fontWeight: 600,
          padding: "8px 20px", borderRadius: "50px", marginBottom: "24px",
          background: "var(--bg-card)", border: "1px solid var(--border)",
          color: "var(--accent)"
        }}>
          🏆 Smart India Hackathon 2025
        </span>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(48px, 8vw, 88px)",
          fontWeight: 900, lineHeight: 1.1, marginBottom: "24px"
        }}>
          Discover India<br />
          <span style={{
            background: "var(--gradient)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Beyond The Obvious
          </span>
        </h1>

        <p style={{
          fontSize: "18px", color: "var(--text-secondary)",
          maxWidth: "580px", margin: "0 auto 40px", lineHeight: 1.7
        }}>
          AI-powered travel curator for hidden gems, personalised itineraries,
          and real local experiences across India.
        </p>
        

<div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
  <Link href="/discover" style={{
    background: "var(--gradient)", color: "white",
    padding: "14px 32px", borderRadius: "50px",
    fontWeight: 700, textDecoration: "none", fontSize: "15px"
  }}>
    Explore Hidden Gems →
  </Link>
  <Link href="/planner" style={{
    background: "transparent", color: "var(--text-primary)",
    padding: "14px 32px", borderRadius: "50px",
    fontWeight: 700, textDecoration: "none", fontSize: "15px",
    border: "1px solid var(--border)"
  }}>
    Plan My Trip
  </Link>
</div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: "64px", marginTop: "64px" }}>
          {[
            { value: "28+", label: "States covered" },
            { value: "100+", label: "Hidden gems" },
            { value: "₹0", label: "Cost to use" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "40px", fontWeight: 900,
                background: "var(--gradient)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>{s.value}</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "40px 40px 80px", maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "36px", fontWeight: 700,
          textAlign: "center", marginBottom: "40px"
        }}>EVERYTHING IN ONE PLACE</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {features.map((f) => (
            <Link key={f.href} href={f.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: "20px", padding: "28px", cursor: "pointer",
                  transition: "all 0.2s", height: "100%"
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div style={{ fontSize: "40px" }}>{f.icon}</div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "22px", fontWeight: 700,
                  margin: "16px 0 8px", color: "var(--text-primary)"
                }}>{f.title}</div>
                <div style={{
                  fontSize: "14px", color: "var(--text-secondary)",
                  lineHeight: 1.6
                }}>{f.desc}</div>
                <div style={{
                  marginTop: "16px", fontSize: "14px",
                  fontWeight: 600, color: "var(--accent)"
                }}>Explore →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bharat CTA */}
      <div style={{ padding: "0 40px 80px", maxWidth: "700px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "24px", padding: "48px",
          boxShadow: "0 0 60px rgba(0,0,0,0.3)"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🤖</div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "32px", fontWeight: 700, marginBottom: "12px"
          }}>Meet Bharat</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "28px", lineHeight: 1.7 }}>
            Your AI travel companion who knows every hidden corner of India.
          </p>
          <Link href="/chat" style={{
            background: "var(--gradient)", color: "white",
            padding: "14px 36px", borderRadius: "50px",
            fontWeight: 700, textDecoration: "none",
            fontSize: "15px", display: "inline-block"
          }}>
            Chat with Bharat →
          </Link>
        </div>
      </div>

      <footer style={{
        textAlign: "center", padding: "24px", fontSize: "13px",
        color: "var(--text-secondary)", opacity: 0.5,
        borderTop: "1px solid var(--border)", position: "relative", zIndex: 1
      }}>
        Built with ❤️ by Team BharatXplorers · SIH 2025
      </footer>
    </div>
  );
}