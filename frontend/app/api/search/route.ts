import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  // Check cache first
  const cacheKey = query.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ gems: cached.data, fromCache: true });
  }

  const prompt = `You are BharatXplorers' travel database for ALL of India.

The user is searching for: "${query}"

CRITICAL LOCATION RULES:
- If user searches for a specific place like "Ladakh", return places IN LADAKH ONLY — not Jammu & Kashmir
- If user searches for "Spiti", return Spiti Valley places only — not all of Himachal Pradesh  
- If user searches for "Coorg", return Coorg only — not all of Karnataka
- Be hyper specific to the EXACT location searched, never substitute with parent state
- "mountain villages in Ladakh" = villages inside Ladakh region only

Return EXACTLY 6 travel destinations matching this search from the SPECIFIC location mentioned.

Respond ONLY in this exact JSON format, no markdown, no explanation:
[
  {
    "name": "Place name",
    "state": "Exact state or UT name",
    "type": "Heritage|Nature|Beach|Mountains|Cultural|Food|Adventure|Spiritual",
    "budget": 800,
    "crowd": "Very Low|Low|Medium|High",
    "emoji": "single relevant emoji",
    "description": "2 sentence description of why this place is special",
    "tip": "One specific local tip a tourist wouldn't know",
    "tags": ["tag1", "tag2", "tag3"],
    "bestMonth": "Mon-Mon format"
  }
]`;

  // Retry up to 3 times on rate limit
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });

      // Rate limited — wait and retry
      if (response.status === 429) {
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, attempt * 2000));
          continue;
        }
        return NextResponse.json({ 
          gems: [], 
          error: "Too many requests. Please wait a moment and try again!" 
        });
      }

      const data = await response.json();
      const raw = data.choices?.[0]?.message?.content || "[]";

      try {
        const gems = JSON.parse(raw.replace(/```json|```/g, "").trim());
        // Save to cache
        cache.set(cacheKey, { data: gems, timestamp: Date.now() });
        return NextResponse.json({ gems });
      } catch {
        return NextResponse.json({ gems: [], error: "Parse failed" });
      }

    } catch (e) {
      if (attempt === 3) {
        return NextResponse.json({ 
          gems: [], 
          error: "Service temporarily unavailable. Please try again!" 
        });
      }
      await new Promise(r => setTimeout(r, attempt * 1000));
    }
  }

  return NextResponse.json({ gems: [], error: "Failed after retries" });
}