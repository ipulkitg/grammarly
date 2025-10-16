export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          document_id: string
          user_id: string
          title: string | null
          content: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          document_id: string
          user_id: string
          title?: string | null
          content?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          document_id?: string
          user_id?: string
          title?: string | null
          content?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          user_id: string
          onboarding_completed: boolean
          personal_details: Json
          academic_info: Json
          experience: Json
          achievements: Json
          extracurriculars: Json
          qualities: Json
          tone_preference: Json
          supporting_docs: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          onboarding_completed?: boolean
          personal_details?: Json
          academic_info?: Json
          experience?: Json
          achievements?: Json
          extracurriculars?: Json
          qualities?: Json
          tone_preference?: Json
          supporting_docs?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          onboarding_completed?: boolean
          personal_details?: Json
          academic_info?: Json
          experience?: Json
          achievements?: Json
          extracurriculars?: Json
          qualities?: Json
          tone_preference?: Json
          supporting_docs?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          user_id: string
          email: string
          preferences: Json
          improvement_stats: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          email: string
          preferences?: Json
          improvement_stats?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          email?: string
          preferences?: Json
          improvement_stats?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 