"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect } from "react"
import { useUserStore } from "@/store/user-store"
import type { User } from "@/types/data-models"
import type { User as SupabaseUser } from "@supabase/auth-helpers-nextjs"

// Helper function to map Supabase user to our User type
function mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null

  return {
    user_id: supabaseUser.id,
    email: supabaseUser.email || "",
    preferences: {
      tone: undefined,
      language: undefined,
      accessibility: {
        textToSpeech: false,
        highContrastMode: false
      },
      dismissedOnboardingReminder: false
    },
    improvement_stats: {
      accepted_suggestions: 0,
      progress: "beginner"
    },
    created_at: supabaseUser.created_at,
    updated_at: new Date().toISOString()
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const setUser = useUserStore((state) => state.setUser)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(mapSupabaseUser(session?.user ?? null))
    })

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapSupabaseUser(session?.user ?? null))
    })

    return () => subscription.unsubscribe()
  }, [supabase, setUser])

  return children
} 