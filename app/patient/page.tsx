import { redirect } from "next/navigation"

export default function PatientPage() {
  // This page simply redirects to the dashboard
  redirect("/patient/dashboard")
}

