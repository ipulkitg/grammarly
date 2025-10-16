// /app/api/rewrite/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: Request) {
  const { sentence } = await req.json();
  if (typeof sentence !== "string" || !sentence.trim())
    return NextResponse.json({ error: "Sentence required" }, { status: 400 });

  const prompt = `
Rewrite the following sentence three different ways. 
• Keep the original meaning. 
• Vary tone & structure. 
• Return an array of strings, no commentary.

Sentence:
"""${sentence}"""
`;
  const { choices } = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 180,
    temperature: 0.7,
  });

  let rewrites: string[] = [];
  try {
    rewrites = JSON.parse(choices[0].message.content || "[]");
  } catch {
    // fallback: split by newline
    rewrites =
      choices[0].message.content
        ?.split("\n")
        .map((s) => s.replace(/^\d+[.)]\s*/, "").trim())
        .filter(Boolean) ?? [];
  }

  return NextResponse.json(rewrites.slice(0, 3));
}
