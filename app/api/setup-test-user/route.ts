import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { userProfileSchema } from '@/types/user-profile'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const { user_id, profile_data } = await request.json()

    if (!user_id || !profile_data) {
      return NextResponse.json(
        { error: 'User ID and profile data are required' },
        { status: 400 }
      )
    }

    // Validate the profile data
    const validationResult = userProfileSchema.safeParse(profile_data)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: validationResult.error },
        { status: 400 }
      )
    }

    // Update the user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        ...profile_data,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id)
      .select()
      .single()

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile data updated successfully'
    })
  } catch (err) {
    console.error('Error in setup-test-user:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 