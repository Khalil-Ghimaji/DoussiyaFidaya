import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { getAppointmentDetails } from "@/lib/server/patient-queries"
import { CancelAppointmentForm } from "./cancel-form"

export default async function CancelAppointmentPage({ params }: { params: { id: string } }) {
  const appointmentId = params.id

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/patient/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à mes rendez-vous
          </Link>
        </Button>
      </div>

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
        <CancelAppointmentContent appointmentId={appointmentId} />
      </Suspense>
    </div>
  )
}

async function CancelAppointmentContent({ appointmentId }: { appointmentId: string }) {
  const appointment = await getAppointmentDetails(appointmentId)

  if (!appointment) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Erreur</p>
          <p>Une erreur est survenue lors du chargement des détails du rendez-vous. Veuillez réessayer plus tard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Annuler un rendez-vous</CardTitle>
          <CardDescription>
            Veuillez confirmer l'annulation de votre rendez-vous. Cette action ne peut pas être annulée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-md space-y-2">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {new Date(appointment.confirmedDate || appointment.preferredDate).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{appointment.confirmedTimeStart || appointment.preferredTimeStart}</span>
              </div>
              <p className="font-medium">{`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}</p>
              <p className="text-muted-foreground">{appointment.doctor.specialty}</p>
              <p className="text-muted-foreground">{appointment.location}</p>
            </div>

            <CancelAppointmentForm appointmentId={appointmentId} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

