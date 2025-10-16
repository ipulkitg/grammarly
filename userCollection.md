# Two-Tier Data Capture: **Onboarding Profile** + **Per-Draft Details**

> Collect the **unchanging stuff once** → store it as a “writer profile.”  
> Then ask only the delta for each new SOP.

---

## 1. Persistent **Onboarding Profile**  *(saved in Supabase or Firestore)*

| Field | Why it belongs here |
|-------|--------------------|
| **personalDetails**  | Name, pronouns, cultural background, first-gen status. |
| **academics[]**      | Degrees, GPA, major, coursework, research. Rarely changes. |
| **experience[]**     | Employment & internships list. Append as user gains new roles. |
| **extracurriculars** | Clubs, volunteering, hobbies. |
| **achievements**     | Awards, publications, competition wins. |
| **qualities**        | The virtues they want to highlight (leadership, resilience…). |
| **tone / toneDescription** | Default writing voice preference. |
| **supportingDocs**   | Resume, transcripts — parse once, reuse. |

> **Storage:** `profiles/{userId}`  
> Autoload into React context (`ProfileContext`) so every wizard step can access defaults.

---

## 2. Lightweight **Per-Draft Payload**

| Field | Prompt in the mini form | Default (prefill from profile) |
|-------|-------------------------|--------------------------------|
| `program`           | Combobox “Target program + school” | — |
| `wordLimit`         | Number input | 750 |
| `deadline`          | Date picker | none |
| `goals.short`       | “Immediate goal after graduation” | last used |
| `goals.long`        | “10-year vision” | last used |
| `motivator`         | “What sparked your interest in this field?” | — |
| `programFitReasons` | Repeatable rows (aspect + reason) | — |
| `anecdotes[]`       | Optional story cards | empty |
| `keywords`          | Tag input (institution buzz-words) | empty |
| `obstacles[]`       | Toggle ➜ structured fields | empty |

<details>
<summary><b>Per-draft JSON shape</b></summary>

```jsonc
{
  "program"      : "MS CS · Stanford",
  "wordLimit"    : 750,
  "deadline"     : "2025-12-01",
  "goals"        : { "short":"Join AI startup", "long":"Lead ethical-AI lab" },
  "motivator"    : "Robotics club win in HS sparked my love for AI.",
  "programFitReasons": [
    { "aspect":"Prof. Smith’s Vision Lab", "reason":"Focus on responsible AI" }
  ],
  "anecdotes": [
    { "story":"Debugged drone at 3 AM", "purpose":"Show resilience" }
  ],
  "keywords": ["interdisciplinary", "impact-driven"],
  "obstacles": [
    { "description":"Semester break due to illness", "resolution":"Returned & topped cohort" }
  ]
}