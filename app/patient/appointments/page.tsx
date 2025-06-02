import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { AppointmentsClient } from "./appointments-client"
import {fetchGraphQL} from "@/lib/graphql-client";
import {auth} from "@/lib/auth";
import { gql } from '@apollo/client';
import { cookies } from "next/headers"


interface Doctor {
  bio: string | null
  education: string[]
  experience: string[]
  first_name: string
  id: string
  languages: string[]
  last_name: string
  profile_image: string | null
  specialty: string
  type: string
  __typename: string
}

interface Appointment {
  Motif: string
  Status: string
  date: string
  doctor_id: string
  id: string
  patient_id: string
  rdv_id: string | null
  time: string
  doctors: Doctor
  __typename: string
}

interface AppointmentsResponse {
  data: {
    findManyRdv_requests: Appointment[]
  }
}

const GET_PATIENT_APPOINTMENTS = gql`query GetRdvs($patient_id : UuidFilter) {
  findManyRdv_requests(where: {patient_id: $patient_id}) {
    Motif
    Status
    date
    doctor_id
    id
    patient_id
    rdv_id
    time
    doctors {
      bio
      education
      experience
      first_name
      id
      languages
      last_name
      profile_image
      specialty
      type
    }
  }
}`

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
  // decode user cookie
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");

  let user = null;
  if (userCookie?.value) {
    try {
      user = JSON.parse(userCookie.value);
    
    } catch (e) {
      console.error("Failed to parse user cookie:", e);
    }
  }

  // Example usage:
  console.log("User ID:", user?.id);
  console.log("User Email:", user?.email);
  console.log("User First Name:", user?.first_name);
  console.log("associated_id:", user?.associated_id);

  // decode token 
  const token = cookieStore.get("token")?.value || "";
 

  const testId = "0c04a7d3-cfe7-4b2c-8a0f-7fe245b82230"
  const { data } = await fetchGraphQL<{  findManyRdv_requests: Appointment[] }>(GET_PATIENT_APPOINTMENTS, {
    patient_id: {
      equals: testId
    }
  })

  if (!data?.findManyRdv_requests) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Erreur</p>
        <p>Une erreur est survenue lors du chargement de vos rendez-vous. Veuillez réessayer plus tard.</p>
      </div>
    )
  }

  const appointments = data.findManyRdv_requests

  // Group appointments by status
  const confirmedAppointments =
    appointments.filter(
      (a: Appointment) => a.Status === "confirmed" && new Date(a.date) >= new Date(),
    ) || []
  const pendingAppointments = appointments.filter((a: Appointment) => a.Status === "pending") || []
  const completedAppointments = appointments.filter((a: Appointment) => a.Status === "completed") || []
  const cancelledAppointments = appointments.filter((a: Appointment) => a.Status === "cancelled") || []

  // Get upcoming appointments for calendar view
  const upcomingAppointments =
    appointments
      .filter((a: Appointment) => a.Status === "confirmed" && new Date(a.date) >= new Date())
      .sort(
        (a: Appointment, b: Appointment) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime(),
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

