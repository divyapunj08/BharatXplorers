import { NextRequest, NextResponse } from "next/server";

async function callGroq(messages: any[]) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are Bharat, a friendly AI travel guide specialising in hidden and offbeat India. 
You know every state, every hidden gem, local food, budget hacks, and train routes.
Keep answers concise, warm, and practical. Use Rs. for prices.`,
          },
          ...messages,
        ],
        temperature: 0.7,
      }),
    });

    if (response.status === 429) {
      if (attempt < 3) { await new Promise(r => setTimeout(r, attempt * 2000)); continue; }
      return "I'm getting too many requests right now. Please wait a moment and try again!";
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Sorry, I couldn't answer that.";
  }
  return "Service temporarily busy. Please try again in a moment!";
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();
  const reply = await callGroq(messages);
  return NextResponse.json({ reply });
}