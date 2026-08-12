import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { city } = await req.json();

 const prompt = `You are BharatXplorers night tourism expert for India.

City: "${city}"

Return ONLY raw JSON, no markdown:
{
  "illuminated": [
    {
      "name": "monument or place name",
      "city": "city",
      "state": "state",
      "description": "2 sentences why it's magical at night",
      "bestTime": "8PM-10PM",
      "lastEntry": "9:30 PM",
      "closedOn": "Monday or None",
      "entryFee": 50,
      "emoji": "🏛️",
      "tip": "one night photography tip",
      "whatToWear": "light jacket, comfortable shoes",
      "whatToCarry": "camera, water bottle, ID proof",
      "firstTimerTip": "one essential tip for first time visitors",
      "lat": 0.0,
      "lng": 0.0,
      "rating": 4.5
    }
  ],
  "night_markets": [
    {
      "name": "market name",
      "city": "city",
      "state": "state",
      "description": "2 sentences about the vibe",
      "timing": "6PM-12AM",
      "lastEntry": "11:30 PM",
      "closedOn": "Tuesday or None",
      "famousFor": ["item1", "item2"],
      "emoji": "🌙",
      "tip": "one tip",
      "whatToWear": "casual comfortable clothes",
      "whatToCarry": "cash, tote bag, phone",
      "firstTimerTip": "one essential tip",
      "lat": 0.0,
      "lng": 0.0,
      "rating": 4.2
    }
  ],
  "stargazing": [
    {
      "name": "spot name",
      "city": "city",
      "state": "state",
      "description": "why this is great for stargazing",
      "bestTime": "10PM-2AM",
      "bestMonth": "Oct-Feb",
      "closedOn": "None",
      "emoji": "⭐",
      "tip": "one astronomy tip",
      "whatToWear": "warm layers, windproof jacket",
      "whatToCarry": "binoculars, blanket, torch, snacks",
      "firstTimerTip": "one essential tip",
      "lat": 0.0,
      "lng": 0.0,
      "rating": 4.3
    }
  ],
  "night_food": [
    {
      "name": "food spot or street name",
      "city": "city",
      "state": "state",
      "description": "what makes this special at night",
      "timing": "9PM-3AM",
      "peakTime": "11PM-1AM",
      "closedOn": "None",
      "mustTry": "dish name",
      "emoji": "🍛",
      "tip": "one food tip",
      "whatToWear": "casual clothes, comfortable footwear",
      "whatToCarry": "cash, hand sanitizer, wet wipes",
      "firstTimerTip": "one essential tip",
      "lat": 0.0,
      "lng": 0.0,
      "rating": 4.4
    }
  ],
  "night_treks": [
    {
      "name": "trek or walk name",
      "city": "city",
      "state": "state",
      "description": "what makes this special at night",
      "startTime": "8PM",
      "endTime": "11PM",
      "closedOn": "None",
      "duration": "2-3 hours",
      "difficulty": "Easy|Medium|Hard",
      "emoji": "🥾",
      "tip": "one safety tip",
      "whatToWear": "sturdy shoes, full sleeves, dark clothes",
      "whatToCarry": "torch, water, first aid, fully charged phone",
      "firstTimerTip": "one essential tip for first timers",
      "lat": 0.0,
      "lng": 0.0,
      "rating": 4.1
    }
  ]
}

Return 3 items per category. Use REAL specific places in ${city} or nearby areas in the same state/region if ${city} is small. 
For smaller cities/states, suggest nearby known spots too.
If no night markets exist, suggest evening markets or local bazaars.
If no illuminated monuments, suggest lit temples or riverside ghats.
Always return something for every category — never return empty arrays.
Use realistic GPS coordinates.`;

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

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "{}";
  const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    const result = JSON.parse(clean);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ illuminated: [], night_markets: [], stargazing: [], night_food: [], night_treks: [] });
  }
}