import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { city, month, year } = await req.json();

  const prompt = `You are BharatXplorers events guide for India.

City: "${city}"
Month: "${month}"
Year: "${year}"

Generate a comprehensive events guide for ${city} in ${month} ${year}.

Return ONLY raw JSON, no markdown:
{
  "concerts": [
    {
      "name": "event name",
      "artist": "artist or band name",
      "venue": "venue name",
      "date": "15 ${month} ${year}",
      "time": "7:00 PM",
      "price": "₹999 onwards",
      "genre": "Rock|Pop|Classical|Folk|Electronic|Jazz|Bollywood",
      "emoji": "🎵",
      "description": "one line about the event",
      "bookingUrl": "bookmyshow.com",
      "lat": 0.0,
      "lng": 0.0,
      "status": "Upcoming|Selling Fast|Almost Full"
    }
  ],
  "sports": [
    {
      "name": "match or tournament name",
      "teams": "Team A vs Team B",
      "venue": "stadium name",
      "date": "18 ${month} ${year}",
      "time": "3:30 PM",
      "price": "₹500 onwards",
      "sport": "Cricket|Football|Kabaddi|Tennis|Badminton|Hockey",
      "emoji": "🏏",
      "description": "one line about the match",
      "bookingUrl": "bookmyshow.com",
      "lat": 0.0,
      "lng": 0.0,
      "status": "Upcoming|Selling Fast|Almost Full"
    }
  ],
  "festivals": [
    {
      "name": "festival name",
      "type": "Cultural|Religious|Music|Food|Art|Regional",
      "venue": "location or area",
      "startDate": "1 ${month} ${year}",
      "endDate": "5 ${month} ${year}",
      "time": "All day or specific time",
      "price": "Free or ₹amount",
      "emoji": "🎪",
      "description": "2 sentences about the festival",
      "highlight": "what makes it special",
      "lat": 0.0,
      "lng": 0.0,
      "status": "Upcoming|Ongoing|Free Entry"
    }
  ],
  "food_events": [
    {
      "name": "event name",
      "type": "Food Festival|Chef's Table|Street Food|Wine & Dine|Cooking Class",
      "venue": "venue name",
      "date": "20 ${month} ${year}",
      "time": "12PM-10PM",
      "price": "₹300 onwards",
      "emoji": "🍛",
      "description": "one line about the event",
      "mustTry": "dish or highlight",
      "lat": 0.0,
      "lng": 0.0,
      "status": "Upcoming|Selling Fast|Free Entry"
    }
  ],
  "cultural": [
    {
      "name": "event name",
      "type": "Exhibition|Theatre|Dance|Comedy|Literary|Art Show",
      "venue": "venue name",
      "date": "22 ${month} ${year}",
      "time": "6:00 PM",
      "price": "₹200 onwards",
      "emoji": "🎭",
      "description": "one line about the event",
      "artist": "performer or organizer",
      "lat": 0.0,
      "lng": 0.0,
      "status": "Upcoming|Selling Fast|Almost Full"
    }
  ]
}

Return 3 items per category. Use REAL venue names in ${city}.
Base events on what typically happens in ${city} during ${month}.
Use realistic coordinates for ${city}.
Make dates realistic for ${month} ${year}.`;

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

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "{}";
  const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    const result = JSON.parse(clean);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ concerts: [], sports: [], festivals: [], food_events: [], cultural: [] });
  }
}