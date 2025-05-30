import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { GET_PATIENT_APPOINTMENTS } from "@/lib/server/patient-queries"
import { AppointmentsClient } from "./appointments-client"
import {fetchGraphQL} from "@/lib/server/graphql-client";
import {auth} from "@/lib/auth";

// Revalidate this page every 5 minutes
export const revalidate = 300

export default async function PatientAppointmentsPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes rendez-vous</h1>
          <p className="text-muted-foreground">Gérez vos rendez-vous médicaux</p>
        </div>
        <Button asChild>
          <Link href="/patient/appointments/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau rendez-vous
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement de vos rendez-vous...</p>
            </div>
          </div>
        }
      >
        <AppointmentsContent />
      </Suspense>
    </div>
  )
}

async function AppointmentsContent() {
    const session = await auth()
  const appointments = await fetchGraphQL(GET_PATIENT_APPOINTMENTS,{patientId:session?.user.id})

  if (!appointments) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Erreur</p>
        <p>Une erreur est survenue lors du chargement de vos rendez-vous. Veuillez réessayer plus tard.</p>
      </div>
    )
  }

  // Group appointments by status
  const confirmedAppointments =
    appointments.filter(
      (a) => a.status === "confirmed" && new Date(a.confirmedDate || a.preferredDate) >= new Date(),
    ) || []
  const pendingAppointments = appointments.filter((a) => a.status === "pending") || []
  const completedAppointments = appointments.filter((a) => a.status === "completed") || []
  const cancelledAppointments = appointments.filter((a) => a.status === "cancelled") || []

  // Get upcoming appointments for calendar view
  const upcomingAppointments =
    appointments
      .filter((a) => a.status === "confirmed" && new Date(a.confirmedDate || a.preferredDate) >= new Date())
      .sort(
        (a, b) =>
          new Date(a.confirmedDate || a.preferredDate).getTime() -
          new Date(b.confirmedDate || b.preferredDate).getTime(),
      )
      .slice(0, 3) || []

  return (
    <AppointmentsClient
      confirmedAppointments={confirmedAppointments}
      pendingAppointments={pendingAppointments}
      completedAppointments={completedAppointments}
      cancelledAppointments={cancelledAppointments}
      upcomingAppointments={upcomingAppointments}
    />
  )
}

