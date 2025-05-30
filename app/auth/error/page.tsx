import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Erreur d'Authentification | MediSystem",
  description: "Une erreur s'est produite lors de l'authentification",
}

// This page uses Static Site Generation (SSG) since it's static content
export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams.error || "unknown"

  const errorMessages: Record<string, string> = {
    default: "Une erreur s'est produite lors de l'authentification.",
    accessdenied: "Vous n'avez pas l'autorisation d'accéder à cette ressource.",
    verification: "La vérification de votre compte a échoué.",
    sessionrequired: "Vous devez être connecté pour accéder à cette page.",
    accountlocked: "Votre compte a été temporairement verrouillé pour des raisons de sécurité.",
    unknown: "Une erreur inconnue s'est produite. Veuillez réessayer plus tard.",
  }

  const errorMessage = errorMessages[error] || errorMessages.default

  return (
    <div className="container flex flex-col items-center justify-center max-w-md py-20">
      <div className="w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <h1 className="text-2xl font-bold">Erreur d'Authentification</h1>

        <p className="text-muted-foreground">{errorMessage}</p>

        <div className="flex flex-col space-y-4 pt-4">
          <Button asChild>
            <Link href="/auth/login">Retour à la connexion</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

