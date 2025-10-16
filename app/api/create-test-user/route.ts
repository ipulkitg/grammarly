import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Missing required environment variables')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create a Supabase admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // First try to get the user
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers()
    
    if (getUserError) {
      console.error('Error getting users:', getUserError)
      return NextResponse.json(
        { error: getUserError.message },
        { status: 500 }
      )
    }

    const existingUser = users?.find(user => user.email === email)

    if (existingUser) {
      // If user exists but not confirmed, confirm their email
      if (!existingUser.email_confirmed_at) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { email_confirm: true }
        )

        if (updateError) {
          console.error('Error confirming email:', updateError)
          return NextResponse.json(
            { error: updateError.message },
            { status: 500 }
          )
        }
      }
      return NextResponse.json({ success: true, user: existingUser })
    }

    // If user doesn't exist, create new one with confirmed email
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: email.split('@')[0]
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, user: data.user })
  } catch (err) {
    console.error('Error in create-test-user:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 