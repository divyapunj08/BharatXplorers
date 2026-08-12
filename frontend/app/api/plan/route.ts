import { NextRequest, NextResponse } from "next/server";

function isRouteTrip(city: string): boolean {
  return /\bto\b/i.test(city) || city.includes("→") || city.includes("->");
}

async function generateDays(
  startDay: number,
  endDay: number,
  destination: string,
  body: any
) {
  const route = isRouteTrip(body.city);
  const parts = body.city.split(/\s+to\s+/i);
  const fromCity = parts[0]?.trim();
  const toCity = parts[1]?.trim();

  const prompt = `You are BharatXplorers AI. Generate days ${startDay} to ${endDay} of a ${body.days}-day trip.

Trip type: ${route ? `ROUTE TRIP from ${fromCity} to ${toCity}` : `CITY EXPLORATION of ${destination}`}
Traveller: ${body.group}, budget Rs.${body.budget}, interests: ${body.interests}, month: ${body.month}.
Food: vegetarian friendly preferred.

${route ? `
ROUTE TRIP RULES:
- Day 1 starts in ${fromCity}
- Last day ends in ${toCity}  
- Middle days cover interesting stops ALONG the route between ${fromCity} and ${toCity}
- Each day should be in a DIFFERENT location progressing along the route
- Include highway dhabas, scenic stops, offbeat towns along the way
` : `
CITY EXPLORATION RULES:
- ALL activities must be IN ${destination} or within 50km ONLY
- Cover different neighbourhoods and areas of ${destination} each day
- Do NOT suggest places outside ${destination} region
`}

Return ONLY raw JSON array, no markdown:
[
  {
    "day": ${startDay},
    "title": "day title",
    "story": "one sentence story",
    "morning": { "activity": "name", "description": "short", "cost": 200, "emoji": "🌅" },
    "afternoon": { "activity": "name", "description": "short", "cost": 300, "emoji": "☀️" },
    "evening": { "activity": "name", "description": "short", "cost": 400, "emoji": "🌆" },
    "food": { "name": "dish", "description": "short", "cost": 200, "emoji": "🍛" },
    "imageKeyword": "place keyword for this day",
    "foodImageKeyword": "food keyword",
    "mood": "Exciting",
    "coordinates": [{ "name": "place", "lat": 0.0, "lng": 0.0 }],
    "hotels": [
      { "name": "hotel", "rating": 4.2, "price": 1200, "type": "Budget", "highlight": "good location", "lat": 0.0, "lng": 0.0 }
    ],
    "cafes": [
      { "name": "cafe", "specialty": "tea", "price": 150, "emoji": "☕", "rating": 4.1, "lat": 0.0, "lng": 0.0 }
    ],
    "restaurants": [
      { "name": "restaurant", "cuisine": "Indian", "mustTry": "dish", "price": 300, "rating": 4.2, "lat": 0.0, "lng": 0.0 }
    ],
    "shopping": [
      { "name": "market", "items": "souvenirs", "priceRange": "100-500", "emoji": "🛍️", "lat": 0.0, "lng": 0.0 }
    ]
  }
]

Generate for days ${startDay} to ${endDay} with REAL places. Use realistic coordinates.`;

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
      max_tokens: 3000,
    }),
  });

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "[]";
  const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(clean);
}

async function getDestination(body: any) {
  const route = isRouteTrip(body.city);
  const parts = body.city.split(/\s+to\s+/i);
  const fromCity = parts[0]?.trim();
  const toCity = parts[1]?.trim();

  const prompt = `Trip details: ${body.days} days, month: ${body.month}, interests: ${body.interests}, budget Rs.${body.budget}, group: ${body.group}.

Trip type: ${route
    ? `ROUTE from ${fromCity} to ${toCity}`
    : `Exploring ${body.city} and 50km around it`
  }

Return ONLY raw JSON, no markdown:
{
  "destination": "${route ? `${fromCity} to ${toCity}` : body.city}",
  "tagline": "${route ? `The road from ${fromCity} to ${toCity}` : `Exploring ${body.city}`} - one poetic line",
  "coverEmoji": "${route ? "🛣️" : "🏙️"}",
  "weather": "weather in ${body.month} in 5 words",
  "vibe": "${route ? "Adventurous" : "Exploratory"}",
  "budget_breakdown": {
    "transport": ${route ? 5000 : 2000},
    "accommodation": 4000,
    "food": 3000,
    "activities": 2000,
    "shopping": 2000
  },
  "hidden_tips": ["tip1", "tip2", "tip3"],
  "packing": ["item1", "item2", "item3"],
  "bestFor": ["Solo", "Friends"]
}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    }),
  });

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "{}";
  const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(clean);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const totalDays = Number(body.days) || 5;
  const chunkSize = 3;
  const route = isRouteTrip(body.city);
  const parts = body.city.split(/\s+to\s+/i);
  const fromCity = parts[0]?.trim();
  const toCity = parts[1]?.trim();

  // Force destination — never let AI change it
  const forcedDestination = route ? `${fromCity} to ${toCity}` : body.city;

  try {
    const baseInfo = await getDestination(body);

    // Always override whatever AI returned with user's actual input
    baseInfo.destination = forcedDestination;

    const allDays: any[] = [];
    for (let start = 1; start <= totalDays; start += chunkSize) {
      const end = Math.min(start + chunkSize - 1, totalDays);
      const chunk = await generateDays(start, end, forcedDestination, body);
      allDays.push(...chunk);
    }

    const itinerary = {
      ...baseInfo,
      destination: forcedDestination, // Force again here too
      days: allDays,
    };

    return NextResponse.json({ success: true, itinerary });

  } catch (e) {
    console.error("Generation failed:", e);
    return NextResponse.json({ success: false, error: String(e) });
  }
}