import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const user = request.cookies.get('user')

  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/register', '/auth/verify-code', '/auth/forgot-password']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Skip middleware for email verification API endpoints
  if (request.nextUrl.pathname.startsWith('/api/email-verification')) {
    return NextResponse.next()
  }

  // If trying to access a public path while logged in, redirect to dashboard
  if (isPublicPath && token && user) {
    try {
      const userData = JSON.parse(user.value)
      const dashboardPath = getDashboardPath(userData.role)
      return NextResponse.redirect(new URL(dashboardPath, request.url))
    } catch (error) {
      // If there's an error parsing the user data, clear the cookies and continue
      const response = NextResponse.next()
      response.cookies.delete('token')
      response.cookies.delete('user')
      return response
    }
  }

  // If trying to access a protected path without being logged in
  if (!isPublicPath && (!token || !user)) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For protected routes, verify the user's role
  if (!isPublicPath && user) {
    try {
      const userData = JSON.parse(user.value)
      const { pathname } = request.nextUrl

      // Check role-specific paths
      if (pathname.startsWith("/patient") && userData.role.toLowerCase() !== "patient") {
        return NextResponse.redirect(new URL('/auth/login?message=Accès+réservé+aux+patients', request.url))
      }

      if (pathname.startsWith("/doctor") && userData.role.toLowerCase() !== "doctor") {
        return NextResponse.redirect(new URL('/auth/login?message=Accès+réservé+aux+médecins', request.url))
      }

      if (pathname.startsWith("/laboratory") && userData.role.toLowerCase() !== "laboratory") {
        return NextResponse.redirect(new URL('/auth/login?message=Accès+réservé+aux+laboratoires', request.url))
      }

      if (pathname.startsWith("/pharmacy") && userData.role.toLowerCase() !== "pharmacy") {
        return NextResponse.redirect(new URL('/auth/login?message=Accès+réservé+aux+pharmacies', request.url))
      }

      if (pathname.startsWith("/assistant") && userData.role.toLowerCase() !== "assistant") {
        return NextResponse.redirect(new URL('/auth/login?message=Accès+réservé+aux+assistants', request.url))
      }
    } catch (error) {
      // If there's an error parsing the user data, clear the cookies and redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url))
      response.cookies.delete('token')
      response.cookies.delete('user')
      return response
    }
  }

  return NextResponse.next()
}

function getDashboardPath(role: string): string {
  switch (role.toLowerCase()) {
    case 'doctor':
      return '/doctor/dashboard'
    case 'patient':
      return '/patient/dashboard'
    case 'laboratory':
      return '/laboratory/dashboard'
    case 'pharmacy':
      return '/pharmacy/dashboard'
    case 'assistant':
      return '/assistant/dashboard'
    default:
      return '/dashboard'
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/email-verification (email verification endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/email-verification).*)',
  ],
}

