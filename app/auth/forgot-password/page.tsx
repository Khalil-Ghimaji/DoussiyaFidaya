import type { Metadata } from "next"
import ForgotPasswordClientPage from "./ForgotPasswordClientPage"

export const metadata: Metadata = {
  title: "Mot de passe oublié | MediSystem",
  description: "Réinitialisez votre mot de passe",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClientPage />
}

