import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { fetchGraphQL } from "@/lib/server/graphql-client"
import { GET_APPOINTMENT_DETAILS } from "@/lib/server/doctor-queries"
import { redirect } from "next/navigation"
import { AcceptAppointmentForm } from "./accept-form"

// Using dynamic rendering for accept appointment page to ensure fresh data
export const dynamic = "force-dynamic"

async function AcceptAppointmentContent({ appointmentId }: { appointmentId: string }) {
  try {
    const data = await fetchGraphQL<{
      appointment: {
        _id: string
        date: string
        time: string
        duration: string
        patient: {
          _id: string
          firstName: string
          lastName: string
          avatar: string
          initials: string
          age: number
          gender: string
          bloodType: string
          allergies: string[]
          medicalHistory: Array<{
            condition: string
            since: string
          }>
          currentTreatments: Array<{
            name: string
            dosage: string
            frequency: string
            prescribedBy: string
          }>
        }
        doctor: {
          _id: string
          firstName: string
          lastName: string
          specialty: string
          hospital: string
        }
        status: string
        type: string
        reason: string
        notes: string
        createdAt: string
        createdBy: string
      }
    }>(GET_APPOINTMENT_DETAILS, { appointmentId }, "no-store")

    const appointment = data.appointment

    // If the appointment is not pending, redirect to the appointments page
    if (appointment.status !== "pending") {
      redirect("/doctor/appointments")
    }

    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/doctor/appointments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux rendez-vous
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Accepter la demande de rendez-vous</h1>
            <p className="text-muted-foreground">
              Demande de {appointment.patient.firstName} {appointment.patient.lastName} pour le{" "}
              {new Date(appointment.date).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Détails de la demande</CardTitle>
              <CardDescription>Informations sur la demande de rendez-vous</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Patient</p>
                    <p className="font-medium">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Âge / Genre</p>
                    <p>
                      {appointment.patient.age} ans / {appointment.patient.gender === "male" ? "Homme" : "Femme"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date demandée</p>
                    <p>{new Date(appointment.date).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Heure demandée</p>
                    <p>{appointment.time}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type de rendez-vous</p>
                    <p>
                      {appointment.type === "consultation"
                        ? "Consultation"
                        : appointment.type === "followup"
                          ? "Suivi"
                          : appointment.type === "emergency"
                            ? "Urgence"
                            : "Procédure médicale"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Durée</p>
                    <p>{appointment.duration} minutes</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Motif</p>
                  <p>{appointment.reason}</p>
                </div>
                {appointment.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                    <p>{appointment.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations du patient</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Groupe sanguin</p>
                  <p>{appointment.patient.bloodType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                  <p>{appointment.patient.allergies.join(", ") || "Aucune"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Antécédents médicaux</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {appointment.patient.medicalHistory.map((item, index) => (
                      <li key={index}>
                        {item.condition} (depuis {item.since})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Accepter la demande</CardTitle>
            <CardDescription>Confirmez ou modifiez les détails du rendez-vous</CardDescription>
          </CardHeader>
          <CardContent>
            <AcceptAppointmentForm appointment={appointment} />
          </CardContent>
        </Card>
      </>
    )
  } catch (error) {
    console.error("Error fetching appointment details:", error)
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/doctor/appointments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux rendez-vous
            </Link>
          </Button>
        </div>

        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erreur</p>
          <p>Une erreur est survenue lors du chargement des détails du rendez-vous. Veuillez réessayer plus tard.</p>
        </div>
      </>
    )
  }
}

export default function AcceptAppointmentPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement des détails du rendez-vous...</p>
            </div>
          </div>
        }
      >
        <AcceptAppointmentContent appointmentId={params.id} />
      </Suspense>
    </div>
  )
}

