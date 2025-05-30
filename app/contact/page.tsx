import type { Metadata } from "next"
import ContactPageClient from "./ContactPageClient"

export const metadata: Metadata = {
  title: "Contact | MediSystem",
  description: "Contactez-nous pour toute question ou assistance",
}

export default function ContactPage() {
  return <ContactPageClient />
}

