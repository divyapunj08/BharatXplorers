import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query } = await req.json();

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

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "[]";

  try {
    const gems = JSON.parse(raw);
    return NextResponse.json({ gems });
  } catch {
    return NextResponse.json({ gems: [], error: "Parse failed", raw });
  }
}