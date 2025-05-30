import type { Metadata } from "next"
import RegisterClientPage from "./RegisterClientPage"

export const metadata: Metadata = {
  title: "Inscription | MediSystem",
  description: "Créez un compte MediSystem",
}

export default function RegisterPage() {
  return <RegisterClientPage />
}

