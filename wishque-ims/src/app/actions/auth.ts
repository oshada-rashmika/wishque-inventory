'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
})

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.session) {
      return { error: "Invalid login credentials." }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('department, role')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile?.department || !profile?.role) {
      console.error(`[AUTH_FAILURE] Profile missing/malformed for user ID: ${authData.user.id}. Error: ${profileError?.message || 'Null fields'}`)
      return { error: "Your profile has not been configured by an administrator." }
    }

    const cookieStore = await cookies()
    cookieStore.set('sb-access-token', authData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: authData.session.expires_in
    })
    cookieStore.set('sb-refresh-token', authData.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    return {
      success: true,
      department: profile.department.toLowerCase().replace(/\s+/g, '-')
    }
  } catch (err: any) {
    console.error(`[AUTH_EXCEPTION] Unexpected error during login: ${err.message}`)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('sb-access-token')
  cookieStore.delete('sb-refresh-token')
  return { success: true }
}
