import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default function LaboratoryPage() {
  // Redirect to dashboard
  redirect("/laboratory/dashboard")
}

