import { NextResponse } from "next/server"
import OpenAI from "openai"
// We define a lightweight version of the onboarding data shape locally to avoid importing client code.
type PartialStepData = Record<string, unknown>

export async function POST(req: Request) {
  try {
    const { resume, transcripts } = await req.json() as { resume?: string | null; transcripts?: string[] }

    if (!resume && (!transcripts || transcripts.length === 0)) {
      return NextResponse.json({ error: "No documents provided" }, { status: 400 })
    }

    const openai = new OpenAI()

    const urls: string[] = []
    if (resume) urls.push(resume as string)
    if (transcripts && transcripts.length) urls.push(...transcripts)

    // Detailed prompt with an explicit JSON template. All keys MUST be present; unknown values should be null or an empty array.
    const jsonTemplate = {
      personal_details: {
        name: null,
        pronouns: null,
        cultural_background: null,
        first_gen_status: null
      },
      academics: [
        {
          degree: null,
          gpa: null,
          major: null,
          coursework: [],
          research: null
        }
      ],
      experience: [
        {
          title: null,
          company: null,
          start_date: null,
          end_date: null,
          description: null
        }
      ],
      extracurriculars: [
        {
          activity: null,
          role: null,
          duration: null,
          description: null
        }
      ],
      achievements: [
        {
          title: null,
          date: null,
          description: null,
          category: null
        }
      ],
      qualities: [],
      tone_preference: {
        tone: null,
        description: null
      }
    }

    const messages = [
      {
        role: "system" as const,
        content: [
          "You are a helpful assistant that extracts structured profile data from résumés and academic transcripts.",
          "Return ONLY a minified JSON object that strictly matches the following template.",
          "  • All top-level keys must exist.",
          "  • Use null for any unknown scalar field.",
          "  • Use an empty array [] where no list items are found.",
          "  • Do not add or remove keys.",
          "Here is the template:",
          JSON.stringify(jsonTemplate)
        ].join("\n")
      },
      {
        role: "user" as const,
        content: `Here are the document URLs: ${urls.join(" , ")}. Extract as much information as possible and fill the template.`
      }
    ]

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" }
    })

    let parsed: PartialStepData = {}
    try {
      const raw = completion.choices[0].message.content ?? "{}"
      parsed = JSON.parse(raw) as PartialStepData
    } catch (e) {
      console.error("Failed to parse JSON from OpenAI", e)
    }

    return NextResponse.json({ data: parsed })
  } catch (error) {
    console.error("Error parsing supporting docs", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 