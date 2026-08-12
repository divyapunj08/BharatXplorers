"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: tripsData } = await supabase
        .from("saved_trips")
        .select("*")
        .order("created_at", { ascending: false });
      setTrips(tripsData || []);

      const { data: favData } = await supabase
        .from("favorite_places")
        .select("*")
        .order("created_at", { ascending: false });
      setFavorites(favData || []);

      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const deleteTrip = async (id: string) => {
    await supabase.from("saved_trips").delete().eq("id", id);
    setTrips(trips.filter(t => t.id !== id));
  };

  const deleteFavorite = async (id: string) => {
    await supabase.from("favorite_places").delete().eq("id", id);
    setFavorites(favorites.filter(f => f.id !== id));
  };

  if (loading) {
    return (
      <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>
        <Navbar />
        <div style={{ textAlign: "center", padding: "120px" }}>Loading profile...</div>
      </div>
    );
  }

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Explorer";

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Navbar />

      <div style={{
        position: "fixed", top: 0, left: "30%", width: "600px", height: "400px",
        background: "var(--gradient)", opacity: 0.06, filter: "blur(100px)",
        pointerEvents: "none", zIndex: 0
      }} />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "100px 24px 80px", position: "relative", zIndex: 1 }}>

        {/* Profile header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "24px", padding: "32px", marginBottom: "32px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "var(--gradient)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "28px", fontWeight: 700, color: "white"
            }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700 }}>
                {name}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "4px" }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{
              padding: "10px 20px", borderRadius: "50px",
              background: "var(--bg-secondary)", border: "1px solid var(--border)",
              color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600, cursor: "pointer"
            }}>
            Logout
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "20px", textAlign: "center"
          }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--accent)" }}>{trips.length}</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Saved Trips</div>
          </div>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "20px", textAlign: "center"
          }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--accent2)" }}>{favorites.length}</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>Favorite Places</div>
          </div>
        </div>

        {/* Saved Trips */}
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>
          📋 Saved Trips
        </h2>
        {trips.length === 0 ? (
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "32px", textAlign: "center",
            color: "var(--text-secondary)", marginBottom: "32px"
          }}>
            No saved trips yet. <a href="/planner" style={{ color: "var(--accent)" }}>Plan your first trip →</a>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
            {trips.map((trip) => (
              <div key={trip.id} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "16px", padding: "20px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", fontWeight: 700 }}>
                    {trip.destination}
                  </h3>
                  <button onClick={() => deleteTrip(trip.id)}
                    style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "16px" }}>
                    ×
                  </button>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "8px" }}>
                  {new Date(trip.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Favorite Places */}
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>
          ❤️ Favorite Places
        </h2>
        {favorites.length === 0 ? (
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "16px", padding: "32px", textAlign: "center",
            color: "var(--text-secondary)"
          }}>
            No favorites yet. <a href="/discover" style={{ color: "var(--accent)" }}>Explore hidden gems →</a>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            {favorites.map((fav) => (
              <div key={fav.id} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "16px", padding: "16px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontWeight: 700, fontSize: "14px" }}>{fav.place_name}</span>
                  <button onClick={() => deleteFavorite(fav.id)}
                    style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                    ×
                  </button>
                </div>
                <span style={{ fontSize: "11px", color: "var(--accent)" }}>{fav.place_type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}