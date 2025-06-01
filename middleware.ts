import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {auth} from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  const user = request.cookies.get('user')

  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/register', '/auth/verify-code', '/auth/forgot-password']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

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

  const session = await auth()
  const isAuthenticated = !!session?.user
  const role = session?.user?.role as string | undefined

  const { pathname } = request.nextUrl

  // Routes publiques accessibles à tous
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/studio")
  ) {
    return NextResponse.next()
  }
  // Redirection si non authentifié
  // if (!isAuthenticated) {
  //   const url = new URL("/auth/login", request.url)
  //   url.searchParams.set("callbackUrl", encodeURI(pathname))
  //   return NextResponse.redirect(url)
  // }

  // Vérification des accès selon le rôle
  if (pathname.startsWith("/patient") && role !== "patient" && role !== "admin") {
    return NextResponse.redirect(new URL("/auth/login?message=Accès+réservé+aux+patients&role=patient", request.url))
  }

  if (pathname.startsWith("/doctor") && role !== "doctor" && role !== "admin") {
    return NextResponse.redirect(new URL("/auth/login?message=Accès+réservé+aux+médecins&role=doctor", request.url))
  }

  if (pathname.startsWith("/laboratory") && role !== "laboratory" && role !== "admin") {
    return NextResponse.redirect(
      new URL("/auth/login?message=Accès+réservé+aux+laboratoires&role=laboratory", request.url),
    )
  }

  if (pathname.startsWith("/pharmacy") && role !== "pharmacy" && role !== "admin") {
    return NextResponse.redirect(new URL("/auth/login?message=Accès+réservé+aux+pharmacies&role=pharmacy", request.url))
  }

  // Ajouter la vérification pour les assistants
  if (pathname.startsWith("/assistant") && role !== "assistant" && role !== "admin") {
    return NextResponse.redirect(
      new URL("/auth/login?message=Accès+réservé+aux+assistants&role=assistant", request.url),
    )
  }

  return NextResponse.next()
}

function getDashboardPath(role: string): string {
  switch (role.toUpperCase()) {
    case 'DOCTOR':
      return '/doctor/dashboard'
    case 'PATIENT':
      return '/patient/dashboard'
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
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

