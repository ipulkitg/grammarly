import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
export const runtime = "edge"; // fast edge deploy

export async function POST(req: Request) {
  const { combinedData } = await req.json();

  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    "messages": [
      {
        role: "system",
        content: "You are an expert admissions consultant."
      },
      {
        role: "user",
        content:
          "Your task is to generate a structured, persuasive, and well-formatted Statement of Purpose (SOP) using the JSON data provided below. The data contains all the user-specific context you need: goals, program, academic record, personal background, tone preference, and more."
      },
      {
        role: "user",
        content:
          "✦ STRUCTURE:\n\nWrite 4-5 paragraphs, formatted in HTML as follows:\n- The **first paragraph** must be wrapped in <p>…</p>\n- All **subsequent paragraphs** must be wrapped in <p class=\"my-2\">…</p>\n\nEach paragraph should follow this arc:\n1. Hook: Use a motivator, anecdote, or moment of inspiration\n2. Goals: Describe short- and long-term goals and how the program supports them\n3. Academics: GPA, coursework, research, and skills gained\n4. Experience: Work/internship achievements and leadership roles\n5. Obstacles: If provided, summarize and reflect on personal growth\n6. Program Fit: Use program name and programFitReasons to justify alignment\n7. Conclusion: Vision for the future and contribution to the field/community"
      },
      {
        role: "user",
        content:
          "✦ STYLE & CONSTRAINTS:\n- Obey the tone preference given in the data\n- Avoid clichés and filler; be specific and vivid\n- Use examples from achievements, experience, and extracurriculars when relevant\n- Use cultural background or first-gen status only where it enriches the story\n- Do not fabricate content — rely only on what is provided\n- Respect the word limit defined in the JSON\n- Do not include bullet points, markdown, or JSON explanation — just the formatted SOP"
      },
      {
        role: "user",
        content: `✦ INPUT DATA (called combinedData):\n\n${JSON.stringify(combinedData)}`
      }
    ],
  });

  const content = chat.choices[0].message?.content?.trim() || "";
  
  return NextResponse.json({ content });
} 