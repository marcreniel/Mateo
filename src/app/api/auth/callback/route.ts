import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type CookieOptions, createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

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
      const { provider_refresh_token } = session

      // Check if the user's UUID already exists in the database
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

        if (existingUser) {
          // User exists, update the provider_refresh_token
          const { error: updateError } = await supabase
            .from('users')
            .update({ provider_refresh_token })
            .eq('id', user.id)

          if (updateError) {
            console.error('Error updating user in database:', updateError)
          } else {
            return NextResponse.redirect(`${origin}/home/`)
          }
        } else {
          // User doesn't exist, insert a new record
          const { error: insertError } = await supabase
            .from('users')
            .insert([{ id: user.id, email: user.email, provider_refresh_token }])

          if (insertError) {
            console.error('Error creating user in database:', insertError)
          } else {
            return NextResponse.redirect(`${origin}/home/`)
          }
        }
      }
    }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login/`)
}