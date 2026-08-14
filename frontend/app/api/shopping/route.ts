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
        temperature: 0.4,
        max_tokens: 3000,
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
  const { query, city, budget } = await req.json();

  const cacheKey = `${query}-${city}-${budget}`.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ ...cached.data, fromCache: true });
  }

  const prompt = `You are BharatXplorers hyper-local shopping guide for India.

User wants to buy: "${query}"
City/Area: "${city || "anywhere in India"}"
Budget: Rs.${budget || "any"}
IMPORTANT: ${budget ? `Only return shops where items can be purchased within Rs.${budget} budget.` : "Return shops of all price ranges."}

Return ONLY raw JSON, no markdown:
{
  "famous_markets": [
    {
      "name": "exact famous market or shop name",
      "city": "city", "state": "state",
      "type": "Street Market|Mall|Handicraft|Clothing|Jewellery|Spices|Books|Electronics|Antiques|Fabric",
      "emoji": "emoji", "description": "2 sentences why this place is legendary",
      "famousFor": ["item1", "item2"], "priceRange": "Budget|Mid|Premium",
      "openTime": "9:00 AM", "closeTime": "9:00 PM", "closedOn": "Sunday or None",
      "tip": "one insider tip", "mustBuy": "most iconic thing",
      "lat": 0.0, "lng": 0.0, "rating": 4.2, "established": "year e.g. 1950s"
    }
  ],
  "hidden_gems": [
    {
      "name": "local hidden gem shop name",
      "city": "city", "state": "state",
      "type": "type", "emoji": "emoji",
      "description": "why locals love this place",
      "famousFor": ["item1", "item2"], "priceRange": "Budget|Mid|Premium",
      "openTime": "10:00 AM", "closeTime": "8:00 PM", "closedOn": "Monday or None",
      "tip": "one secret tip", "mustBuy": "best buy here",
      "lat": 0.0, "lng": 0.0, "rating": 4.0,
      "whyHidden": "one line on why tourists miss this"
    }
  ]
}
Return 4 famous markets and 4 hidden gems. Use realistic coordinates.`;

  try {
    const raw = await callGroq(prompt);
    const result = JSON.parse(raw.replace(/```json|```/g, "").trim());
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ famous_markets: [], hidden_gems: [], error: "Service busy. Try again!" });
  }
}