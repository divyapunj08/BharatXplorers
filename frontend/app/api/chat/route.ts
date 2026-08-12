import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

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
Keep answers concise, warm, and practical. Use ₹ for prices.`,
        },
        ...messages,
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't answer that.";
  return NextResponse.json({ reply });
}