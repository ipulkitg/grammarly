import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Singleton pattern for client-side Supabase client
let supabase: ReturnType<typeof createClientComponentClient<Database>> | undefined

export function getSupabaseClient() {
  if (!supabase) {
    supabase = createClientComponentClient<Database>()
  }
  return supabase
}
