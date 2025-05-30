import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { AppointmentRequestDetails } from "@/components/doctor/appointment-request-details"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_APPOINTMENT_DETAILS } from "@/lib/graphql/doctor-queries"
import { DeclineAppointmentForm } from "./decline-form"

// Define the appointment request type
type AppointmentRequest = {
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
    const data = await executeGraphQLServer<{ appointment: AppointmentRequest }>(
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

export default async function DeclineAppointmentRequestPage({ params }: { params: { id: string } }) {
  const appointment = await getAppointmentDetails(params.id)

  if (!appointment) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/doctor/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Link>
        </Button>

        <AppointmentRequestDetails request={appointment} className="mb-6" />

        <Suspense
          fallback={
            <Card>
              <CardContent className="py-10">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">Chargement du formulaire...</p>
                </div>
              </CardContent>
            </Card>
          }
        >
          <DeclineAppointmentForm appointmentId={params.id} />
        </Suspense>
      </div>
    </div>
  )
}

