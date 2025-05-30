import { redirect } from "next/navigation"

export default function DoctorPage() {
  // This page simply redirects to the dashboard
  redirect("/doctor/dashboard")
}