import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/documents"
  const type = requestUrl.searchParams.get("type")

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
      
      // If this was an email verification
      if (type === "email_verification") {
        return NextResponse.redirect(new URL("/login?verified=true", requestUrl.origin))
      }
      
      // For other auth operations (OAuth, magic link, etc.)
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } catch (error) {
      console.error("Auth callback error:", error)
      return NextResponse.redirect(
        new URL(`/login?error=Could not authenticate user`, requestUrl.origin)
      )
    }
  }

  // Return to login if no code present
  return NextResponse.redirect(new URL("/login", requestUrl.origin))
} 