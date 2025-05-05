import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import {auth} from "@/lib/auth";

export async function middleware(request: NextRequest) {
  //remove this to enable middleware
  return NextResponse.next()


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

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
}

