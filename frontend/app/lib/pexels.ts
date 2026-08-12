export async function getPexelsImage(query: string, width = 800, height = 500): Promise<string> {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + " india travel")}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || "",
        },
      }
    );
    const data = await res.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large;
    }
  } catch (e) {
    console.error("Pexels error:", e);
  }
  // Fallback to picsum if Pexels fails
  const seed = query.replace(/\s+/g, "-").toLowerCase();
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}