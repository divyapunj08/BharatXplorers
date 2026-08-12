"use client";
import { useState, useEffect } from "react";

type Props = {
  query: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  alt?: string;
};

export default function PexelsImage({ query, width = 800, height = 400, style, alt }: Props) {
  const [src, setSrc] = useState(`https://picsum.photos/seed/${query.replace(/\s+/g, "-")}/${width}/${height}`);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PEXELS_API_KEY;
    if (!key) return;

    fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + " india travel")}&per_page=1&orientation=landscape`,
      { headers: { Authorization: key } }
    )
      .then(r => r.json())
      .then(data => {
        if (data.photos?.[0]?.src?.large) {
          setSrc(data.photos[0].src.large);
        }
      })
      .catch(() => {});
  }, [query]);

  return (
    <img
      src={src}
      alt={alt || query}
      style={{ objectFit: "cover", ...style }}
    />
  );
}