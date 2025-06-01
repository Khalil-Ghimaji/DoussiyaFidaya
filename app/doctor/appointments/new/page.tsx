import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { GET_DOCTOR_PATIENTS } from "@/lib/server/doctor-queries"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { NewAppointmentForm } from "./new-appointment-form"
import {fetchGraphQL} from "@/lib/graphql-client";

// Using dynamic rendering for new appointment page to ensure fresh data
export const dynamic = "force-dynamic"

async function NewAppointmentContent() {
  const session = await auth()
  if (!session?.user?.id) {
    notFound()
  }

  try {
    const data = await fetchGraphQL()

    const patients = data.doctorPatients

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
            <h1 className="text-3xl font-bold tracking-tight">Nouveau rendez-vous</h1>
            <p className="text-muted-foreground">Créez un nouveau rendez-vous pour un patient</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations du rendez-vous</CardTitle>
            <CardDescription>Remplissez les informations pour créer un nouveau rendez-vous</CardDescription>
          </CardHeader>
          <CardContent>
            <NewAppointmentForm patients={patients} />
          </CardContent>
        </Card>
      </>
    )
  } catch (error) {
    console.error("Error fetching doctor patients:", error)
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
          <p>Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard.</p>
        </div>
      </>
    )
  }
}

export default function NewAppointmentPage() {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement du formulaire...</p>
            </div>
          </div>
        }
      >
        <NewAppointmentContent />
      </Suspense>
    </div>
  )
}

