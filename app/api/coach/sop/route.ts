import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
export const runtime = "edge"  // fast edge deploy

export async function POST(req: Request) {
  const { content, collegeInfo } = await req.json()

  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
    You are an **admissions-essay document coach**.
    
    ✦ Return ONLY a JSON object with exactly these keys  
      (use empty arrays / null / false where nothing applies):
    
      • tone              : string                    // e.g. "professional yet personal"
      • outline           : string[]                  // ["hook", "background", …]
      • repetition        : [ { word, count, suggestions[] }, … ]
      • clarityPrompts    : string[]                  // ideas to sharpen or expand the essay
      • trimSuggestions   : string[]                  // what to cut or condense
      • coachPerspective  : string[]                  // feedback as if you're coaching the writer
      • checklist         : { goalsClear: boolean, collegeFit: boolean, personalVoice: boolean }
    
    Rules
    1. Analyze the entire SOP HTML. Use '</p><p class="my-2">' as paragraph boundary.
    2. Build *outline* by mapping each paragraph to its rhetorical role:  
       "hook" | "academic background" | "skills" | "research fit" | "goals" | "closing";  
       Add any missing or muddled sections.
    3. Detect ≥3× repeated words (excluding function words). For each, offer alternatives.
    4. Give *clarityPrompts* for vague or bloated paragraphs.
    5. Offer *trimSuggestions* for overlong, redundant, or low-value sections.
    6. *coachPerspective* should simulate a coach’s honest thoughts—highlighting strengths and risks.
    7. Populate *checklist* to confirm if essay clearly covers goals, fit, and personal voice.
    8. Maintain an encouraging and constructive tone in all feedback.
    9. Output **nothing** except the JSON object.
    `
      },
      {
        role: "user",
        content: `SOP_HTML:\n${content}\n\nCOLLEGE_INFO:\n${collegeInfo || "Not provided"}`
      }
    ]
  })

  return NextResponse.json(JSON.parse(chat.choices[0].message!.content!))
} 