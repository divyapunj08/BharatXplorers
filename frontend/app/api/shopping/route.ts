import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query, city, budget } = await req.json();

  const prompt = `You are BharatXplorers hyper-local shopping guide for India.

User wants to buy: "${query}"
City/Area: "${city || "anywhere in India"}"
Budget: Rs.${budget || "any"}
IMPORTANT: ${budget ? `Only return shops where items can be purchased within Rs.${budget} budget. Filter out shops that are too expensive for this budget.` : "Return shops of all price ranges."}

Return ONLY raw JSON, no markdown:
{
  "famous_markets": [
    {
      "name": "exact famous market or shop name",
      "city": "city",
      "state": "state",
      "type": "Street Market|Mall|Handicraft|Clothing|Jewellery|Spices|Books|Electronics|Antiques|Fabric",
      "emoji": "emoji",
      "description": "2 sentences why this place is legendary",
      "famousFor": ["item1", "item2"],
      "priceRange": "Budget|Mid|Premium",
      "openTime": "9:00 AM",
      "closeTime": "9:00 PM",
      "closedOn": "Sunday or None",
      "tip": "one insider tip",
      "mustBuy": "most iconic thing",
      "lat": 0.0000,
      "lng": 0.0000,
      "rating": 4.2,
      "established": "year or era e.g. 1950s"
    }
  ],
  "hidden_gems": [
    {
      "name": "local hidden gem shop name",
      "city": "city",
      "state": "state",
      "type": "type",
      "emoji": "emoji",
      "description": "why locals love this place",
      "famousFor": ["item1", "item2"],
      "priceRange": "Budget|Mid|Premium",
      "openTime": "10:00 AM",
      "closeTime": "8:00 PM",
      "closedOn": "Monday or None",
      "tip": "one secret tip only locals know",
      "mustBuy": "best buy here",
      "lat": 0.0000,
      "lng": 0.0000,
      "rating": 4.0,
      "whyHidden": "one line on why tourists miss this"
    }
  ]
}

Be HYPER SPECIFIC. Use REAL shop names locals know. For Delhi books: Fakir Chand, Bahrisons etc.
For Mumbai antiques: Chor Bazaar etc. Think like a local who lives there.
Return 4 famous markets and 4 hidden gems. Use realistic coordinates.`;

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

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "{}";
  const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    const result = JSON.parse(clean);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ famous_markets: [], hidden_gems: [], error: "Parse failed" });
  }
}