"use client";
import { useState, useEffect } from "react";

const SLIDES = [
  "taj mahal agra india",
  "varanasi ghats india",
  "ladakh mountains india",
  "rajasthan palace india",
  "kerala backwaters india",
  "hampi ruins india",
  "jaipur fort india",
  "goa beach india",
  "darjeeling tea garden india",
  "mysore palace india",
];

export default function SlideshowBg({ opacity = 0.15 }: { opacity?: number }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchImages = async () => {
      const key = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
      if (!key) return;
      const imgs: string[] = [];
      for (const keyword of SLIDES) {
        try {
          const res = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`,
            { headers: { Authorization: key } }
          );
          const data = await res.json();
          if (data.photos?.[0]?.src?.landscape) {
            imgs.push(data.photos[0].src.landscape);
          } else {
            imgs.push(`https://picsum.photos/seed/${keyword.replace(/\s/g, "-")}/1600/900`);
          }
        } catch {
          imgs.push(`https://picsum.photos/seed/${keyword.replace(/\s/g, "-")}/1600/900`);
        }
      }
      setImages(imgs);
    };
    fetchImages();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  if (images.length === 0) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      {images.map((img, i) => (
        <div key={i} style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${img})`,
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: i === currentSlide ? opacity : 0,
          transition: "opacity 2s ease-in-out"
        }} />
      ))}
      {/* Dark overlay to keep content readable */}
      <div style={{
        position: "absolute", inset: 0,
        background: "var(--bg-primary)",
        opacity: 0.65
      }} />
    </div>
  );
}