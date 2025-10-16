export interface User {
  user_id: string
  email: string
  preferences: {
    tone?: string
    language?: string
    accessibility?: {
      textToSpeech: boolean
      highContrastMode: boolean
    }
    dismissedOnboardingReminder?: boolean
  }
  improvement_stats: {
    accepted_suggestions?: number
    progress?: string // e.g., "beginner", "intermediate"
  }
  created_at: string
  updated_at: string
}

export interface Document {
  document_id: string
  user_id: string
  title: string
  content: string
  metadata: {
    university?: string
    program?: string
    word_count?: number
  }
  created_at: string
  updated_at: string
}

export interface Suggestion {
  suggestion_id: string
  document_id: string
  type: "grammar" | "tone" | "coherence" | string
  position: number[] // [start_char_index, end_char_index]
  alternatives: string[]
  explanation: string
  confidence_score: number
  created_at: string
}

export interface Analytics {
  analytics_id: string
  user_id: string
  suggestion_id?: string | null
  action: "accept" | "reject" | "view" | "edit" | string
  usage_pattern: {
    session_duration?: number
    edits?: number
    [key: string]: any
  }
  timestamp: string
}
