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
        temperature: 0.5,
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
  const { city } = await req.json();

  const cacheKey = `nightlife-${city}`.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ ...cached.data, fromCache: true });
  }

  const prompt = `You are BharatXplorers night tourism expert for India.
City: "${city}"

Return ONLY raw JSON, no markdown:
{
  "illuminated": [
    { "name": "monument", "city": "city", "state": "state", "description": "2 sentences", "bestTime": "8PM-10PM", "lastEntry": "9:30 PM", "closedOn": "Monday or None", "entryFee": 50, "emoji": "🏛️", "tip": "tip", "whatToWear": "clothes", "whatToCarry": "items", "firstTimerTip": "tip", "lat": 0.0, "lng": 0.0, "rating": 4.5 }
  ],
  "night_markets": [
    { "name": "market", "city": "city", "state": "state", "description": "2 sentences", "timing": "6PM-12AM", "lastEntry": "11:30 PM", "closedOn": "None", "famousFor": ["item1"], "emoji": "🌙", "tip": "tip", "whatToWear": "clothes", "whatToCarry": "items", "firstTimerTip": "tip", "lat": 0.0, "lng": 0.0, "rating": 4.2 }
  ],
  "stargazing": [
    { "name": "spot", "city": "city", "state": "state", "description": "why great", "bestTime": "10PM-2AM", "bestMonth": "Oct-Feb", "closedOn": "None", "emoji": "⭐", "tip": "tip", "whatToWear": "clothes", "whatToCarry": "items", "firstTimerTip": "tip", "lat": 0.0, "lng": 0.0, "rating": 4.3 }
  ],
  "night_food": [
    { "name": "food spot", "city": "city", "state": "state", "description": "what makes special", "timing": "9PM-3AM", "peakTime": "11PM-1AM", "closedOn": "None", "mustTry": "dish", "emoji": "🍛", "tip": "tip", "whatToWear": "clothes", "whatToCarry": "items", "firstTimerTip": "tip", "lat": 0.0, "lng": 0.0, "rating": 4.4 }
  ],
  "night_treks": [
    { "name": "trek", "city": "city", "state": "state", "description": "what makes special", "startTime": "8PM", "endTime": "11PM", "closedOn": "None", "duration": "2-3 hours", "difficulty": "Easy|Medium|Hard", "emoji": "🥾", "tip": "tip", "whatToWear": "clothes", "whatToCarry": "items", "firstTimerTip": "tip", "lat": 0.0, "lng": 0.0, "rating": 4.1 }
  ]
}
Return 3 items per category. Use REAL specific places in ${city} or nearby. Always return something for every category. Use realistic coordinates.`;

  try {
    const raw = await callGroq(prompt);
    const result = JSON.parse(raw.replace(/```json|```/g, "").trim());
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ illuminated: [], night_markets: [], stargazing: [], night_food: [], night_treks: [], error: "Service busy. Try again!" });
  }
}