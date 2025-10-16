import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // Handle authentication for protected routes
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/signup')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/documents') ||
                          request.nextUrl.pathname.startsWith('/onboarding') ||
                          request.nextUrl.pathname.startsWith('/profile')

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/documents', request.url))
  }

  if (isProtectedRoute && !session) {
    // If user is not signed in and tries to access protected route, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check if user has completed onboarding for profile access
  if (session && request.nextUrl.pathname.startsWith('/profile')) {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('user_id', session.user.id)
        .single()

      // If no profile exists or onboarding is not completed, redirect to onboarding
      if (!profile || !profile.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    } catch (error) {
      console.error('Error checking profile status:', error)
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 