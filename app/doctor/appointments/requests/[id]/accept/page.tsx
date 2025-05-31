import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { fetchGraphQL } from "@/lib/graphql-client"
import { redirect } from "next/navigation"
import { AcceptAppointmentForm } from "./accept-form"

const GET_RDV_REQUEST = `
  query GetRdvRequest($id: String!) {
    findUniqueRdv_requests(where: {id: $id}) {
      Motif
      Status
      date
      doctor_id
      id
      patient_id
      patients {
        gender
        date_of_birth
        cin
        id
        profile_image
        user_id
        users {
          first_name
          last_name
        }
      }
      time
    }
  }
`

// Using dynamic rendering for accept appointment page to ensure fresh data
export const dynamic = "force-dynamic"

async function AcceptAppointmentContent({ appointmentId }: { appointmentId: string }) {
  try {
    const { data } = await fetchGraphQL<{
      findUniqueRdv_requests: {
        Motif: string
        Status: string
        date: string
        doctor_id: string
        id: string
        patient_id: string
        patients: {
          gender: string
          date_of_birth: string
          cin: string
          id: string
          profile_image: string
          user_id: string
          users: {
            first_name: string
            last_name: string
          }
        }
        time: string
      }
    }>(GET_RDV_REQUEST, { id: appointmentId })

    const request = data.findUniqueRdv_requests

    // If the appointment is not pending, redirect to the appointments page
    if (request.Status !== "pending") {
      redirect("/doctor/appointments")
    }

    const appointment = {
      id: request.id,
      date: request.date,
      time: request.time,
      duration: "30",
      patient: {
        id: request.patients.id,
        firstName: request.patients.users.first_name,
        lastName: request.patients.users.last_name
      },
      doctor: {
        id: request.doctor_id
      },
      reason: request.Motif
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
              Demande de {request.patients.users.first_name} {request.patients.users.last_name} pour le{" "}
              {new Date(request.date).toLocaleDateString("fr-FR")}
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
                      {request.patients.users.first_name} {request.patients.users.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Genre</p>
                    <p>{request.patients.gender === "Male" ? "Homme" : "Femme"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date demandée</p>
                    <p>{new Date(request.date).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Heure demandée</p>
                    <p>{request.time}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Motif</p>
                  <p>{request.Motif}</p>
                </div>
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
                  <p className="text-sm font-medium text-muted-foreground">CIN</p>
                  <p>{request.patients.cin}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de naissance</p>
                  <p>{new Date(request.patients.date_of_birth).toLocaleDateString("fr-FR")}</p>
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

