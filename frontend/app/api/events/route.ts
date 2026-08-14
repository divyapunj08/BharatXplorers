import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30;

async function callGroq(prompt: string) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        max_tokens: 4000,
      }),
    });

    if (response.status === 429) {
      if (attempt < 3) { await new Promise(r => setTimeout(r, attempt * 2000)); continue; }
      throw new Error("Rate limited");
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "{}";
  }
  throw new Error("Failed after retries");
}

export async function POST(req: NextRequest) {
  const { city, month, year } = await req.json();

  const cacheKey = `events-${city}-${month}-${year}`.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ ...cached.data, fromCache: true });
  }

  const prompt = `You are BharatXplorers events guide for India.
City: "${city}", Month: "${month}", Year: "${year}"

Return ONLY raw JSON, no markdown:
{
  "concerts": [
    { "name": "event", "artist": "artist", "venue": "venue", "date": "15 ${month} ${year}", "time": "7:00 PM", "price": "₹999 onwards", "genre": "Bollywood", "emoji": "🎵", "description": "one line", "lat": 0.0, "lng": 0.0, "status": "Upcoming" }
  ],
  "sports": [
    { "name": "match", "teams": "Team A vs Team B", "venue": "stadium", "date": "18 ${month} ${year}", "time": "3:30 PM", "price": "₹500 onwards", "sport": "Cricket", "emoji": "🏏", "description": "one line", "lat": 0.0, "lng": 0.0, "status": "Upcoming" }
  ],
  "festivals": [
    { "name": "festival", "type": "Cultural", "venue": "location", "startDate": "1 ${month} ${year}", "endDate": "5 ${month} ${year}", "time": "All day", "price": "Free", "emoji": "🎪", "description": "2 sentences", "highlight": "what makes special", "lat": 0.0, "lng": 0.0, "status": "Upcoming" }
  ],
  "food_events": [
    { "name": "event", "type": "Food Festival", "venue": "venue", "date": "20 ${month} ${year}", "time": "12PM-10PM", "price": "₹300 onwards", "emoji": "🍛", "description": "one line", "mustTry": "dish", "lat": 0.0, "lng": 0.0, "status": "Upcoming" }
  ],
  "cultural": [
    { "name": "event", "type": "Theatre", "venue": "venue", "date": "22 ${month} ${year}", "time": "6:00 PM", "price": "₹200 onwards", "emoji": "🎭", "description": "one line", "artist": "performer", "lat": 0.0, "lng": 0.0, "status": "Upcoming" }
  ]
}
Return 3 items per category. Use REAL venue names in ${city}. Use realistic coordinates.`;

  try {
    const raw = await callGroq(prompt);
    const result = JSON.parse(raw.replace(/```json|```/g, "").trim());
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ concerts: [], sports: [], festivals: [], food_events: [], cultural: [], error: "Service busy. Try again!" });
  }
}