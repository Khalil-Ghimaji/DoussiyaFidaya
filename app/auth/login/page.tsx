import type { Metadata } from "next"
import LoginPage from "./LoginPage"

export const metadata: Metadata = {
  title: "Connexion | MediSystem",
  description: "Connectez-vous à votre compte MediSystem",
}

export default function Page() {
  return <LoginPage />
}

