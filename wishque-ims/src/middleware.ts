import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("sb-session")?.value

  let hasSession = false
  if (sessionCookie) {
    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie))
      // Verify if the session has an access_token
      if (session?.access_token) {
        // Safe check for JWT expiration using base64 decoding on the payload segment
        const parts = session.access_token.split(".")
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          const isExpired = payload.exp * 1000 < Date.now()
          if (!isExpired) {
            hasSession = true
          }
        }
      }
    } catch (e) {
      // Fail-safe: if cookie is corrupted, treat as unauthenticated
    }
  }

  const { pathname } = request.nextUrl

  // Redirect to login if unauthorized and trying to access private routes
  if (!hasSession && pathname !== "/login") {
    const loginUrl = new URL("/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to home if authorized but visiting login page
  if (hasSession && pathname === "/login") {
    const homeUrl = new URL("/", request.url)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (Supabase OAuth callback)
     * - Excludes image/asset files (.svg, .png, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
