import type { Metadata } from "next"
import LoginPageClient from "./login-page-client"

export const metadata: Metadata = {
  title: "Connexion | MediSystem",
  description: "Connectez-vous à votre compte MediSystem",
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; reset?: string }
}) {
  return <LoginPageClient searchParams={searchParams} />
}

