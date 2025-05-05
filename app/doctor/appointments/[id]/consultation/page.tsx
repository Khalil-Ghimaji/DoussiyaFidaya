import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PatientProfile } from "@/components/patient/profile"
import Link from "next/link"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_APPOINTMENT_DETAILS } from "@/lib/graphql/doctor-queries"
import { ConsultationForm } from "./consultation-form"

// Define the appointment type
type Appointment = {
  _id: string
  date: string
  time: string
  duration: number
  status: string
  reason: string
  notes: string
  patient: {
    _id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    bloodType: string
    allergies: string[]
    profileImage: string
  }
  doctor: {
    _id: string
    firstName: string
    lastName: string
    speciality: string
  }
}

// Get appointment details from the server
async function getAppointmentDetails(id: string) {
  try {
    const data = await executeGraphQLServer<{ appointment: Appointment }>(
      GET_APPOINTMENT_DETAILS,
      { appointmentId: id },
      { cache: "no-store" }, // Use SSR for up-to-date data
    )

    return data.appointment
  } catch (error) {
    console.error("Error fetching appointment details:", error)
    return null
  }
}

export default async function AppointmentConsultationPage({ params }: { params: { id: string } }) {
  const appointment = await getAppointmentDetails(params.id)

  if (!appointment) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/doctor/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux rendez-vous
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <PatientProfile patient={appointment.patient} />
        </div>

        <div className="md:col-span-2">
          <Suspense
            fallback={
              <Card>
                <CardContent className="py-10">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">Chargement du formulaire de consultation...</p>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <ConsultationForm appointment={appointment} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

