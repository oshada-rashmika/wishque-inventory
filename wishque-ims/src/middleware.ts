import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get('sb-access-token')?.value
  const url = req.nextUrl.clone()

  if (!accessToken) {
    url.pathname = '/login'
    const response = NextResponse.redirect(url)
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    return response
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseKey,
      },
    })

    if (!userRes.ok) throw new Error('Invalid token')
    const user = await userRes.json()

    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=department`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseKey,
      },
    })

    if (!profileRes.ok) throw new Error('Profile fetch failed')
    const profiles = await profileRes.json()
    const profile = profiles[0]

    if (!profile || !profile.department) {
      throw new Error('Profile unconfigured')
    }

    const DEPARTMENT_SLUGS = [
      'hr',
      'accounts',
      'operations',
      'product-development',
      'bakery',
      'floral',
      'stores'
    ]

    const normalizedUserDept = profile.department.toLowerCase().replace(/\s+/g, '-')
    const pathSegments = req.nextUrl.pathname.split('/').filter(Boolean)
    const attemptedDept = pathSegments[1]

    const isDepartmentRoute = DEPARTMENT_SLUGS.includes(attemptedDept)

    if (isDepartmentRoute && attemptedDept !== normalizedUserDept) {
      url.pathname = `/dashboard/${normalizedUserDept}`
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  } catch (error) {
    console.error(`[MIDDLEWARE_ERROR] Auth verification failed:`, error)
    url.pathname = '/login'
    const response = NextResponse.redirect(url)
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    return response
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
