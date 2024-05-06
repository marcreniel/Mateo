import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type CookieOptions, createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  try {
    // Extract the callback code from the URL
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    // If the code is present, exchange it for a session, and store it in a cookie
    if (code) {
      const cookieStore = cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.delete({ name, ...options })
            },
          },
        }
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // Store user information in the database
        const { user, session } = data
        const { provider_token, provider_refresh_token } = session

        // Check if the user's UUID already exists in the database
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

          if (existingUser) {
            // User exists, update the provider_refresh_token and cur_session
            const { error: updateError } = await supabase
              .from('users')
              .update({ provider_refresh_token, cur_session: provider_token })
              .eq('id', user.id)

            if (updateError) {
              // Log an error if the db update fails
              console.error('Error updating user in database:', updateError)
            } else {
              return NextResponse.redirect(`${origin}/home/`)
            }
          } else {
            // User doesn't exist, insert a new record
            const { error: insertError } = await supabase
              .from('users')
              .insert([{ id: user.id, email: user.email, provider_refresh_token, cur_session: provider_token }])

            if (insertError) {
              // Log an error if the db insert fails
              console.error('Error creating user in database:', insertError)
            } else {
              return NextResponse.redirect(`${origin}/home/`)
            }
          }
        }
      }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login/`)
  } catch (error) {
    // Generic error handling
    return NextResponse.json({ error: error }, { status: 500 })
  }
}