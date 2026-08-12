"use client";
import { useEffect, useRef } from "react";

type Place = { name: string; lat: number; lng: number; type?: string };

type Props = {
  places: Place[];
  highlighted?: { lat: number; lng: number; name: string } | null;
};

export default function TripMap({ places, highlighted }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      import("leaflet").then((L) => {
        if (!containerRef.current || mapRef.current) return;

        try {
          const map = L.map(containerRef.current, {
            zoomControl: true,
            scrollWheelZoom: false,
          });
          mapRef.current = map;

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap",
          }).addTo(map);

          const validPlaces = places.filter(p => p.lat && p.lng);
          if (validPlaces.length === 0) return;

          const latlngs: [number, number][] = [];

          validPlaces.forEach((p, i) => {
            latlngs.push([p.lat, p.lng]);
            const icon = L.divIcon({
              className: "",
              html: `<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#ff6b35,#f7c948);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;">${i + 1}</div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });
            L.marker([p.lat, p.lng], { icon })
              .addTo(map)
              .bindPopup(`<b>${p.name}</b>`);
          });

          if (highlighted?.lat && highlighted?.lng) {
            const hlIcon = L.divIcon({
              className: "",
              html: `<div style="width:40px;height:40px;border-radius:50%;background:#f7c948;border:3px solid white;box-shadow:0 2px 12px rgba(247,201,72,0.6);display:flex;align-items:center;justify-content:center;font-size:18px;">📍</div>`,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            });
            L.marker([highlighted.lat, highlighted.lng], { icon: hlIcon })
              .addTo(map)
              .bindPopup(`<b>${highlighted.name}</b>`)
              .openPopup();
            latlngs.push([highlighted.lat, highlighted.lng]);
          }

          if (latlngs.length > 1) {
            L.polyline(latlngs.slice(0, validPlaces.length), {
              color: "#ff6b35", weight: 3,
              dashArray: "8 6", opacity: 0.8,
            }).addTo(map);
          }

          const bounds = L.latLngBounds(latlngs);
          map.fitBounds(bounds, { padding: [40, 40] });

         if (highlighted?.lat && highlighted?.lng) {
            try { map.setView([highlighted.lat, highlighted.lng], 15); } catch {}
        }
        } catch (e) {
          console.error("Map error:", e);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [places, highlighted]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={containerRef}
        style={{
          height: "300px", width: "100%",
          borderRadius: "16px", overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      />
    </>
  );
}