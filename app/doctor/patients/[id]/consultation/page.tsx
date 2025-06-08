import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { PatientConsultationForm } from "./patient-consultation-form"
import { fetchGraphQL } from "@/lib/graphql-client"
import { GET_PATIENT_EXTENDED } from "@/lib/graphql/queriesV2/patient"
import { PatientExtended ,adaptToPatient } from "@/lib/graphql/types/patient"

async function getPatientDetails(id: string): Promise<PatientExtended | null> {
  try {
    const response = await fetchGraphQL<{ patient: any }>(GET_PATIENT_EXTENDED, { patientId: id })
    return adaptToPatient(response.data)
  } catch (error) {
    console.error("Error fetching patient details:", error)
    return null
  }
}

export default async function PatientConsultationPage({ params }: { params: { id: string } }) {
  const patient = await getPatientDetails(params.id)

  if (!patient) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/doctor/patients/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au profil
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Nouvelle consultation - {patient.firstName} {patient.lastName}
        </h1>
        <p className="text-muted-foreground">Créez une nouvelle consultation pour ce patient</p>
      </div>

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
        <PatientConsultationForm patient={patient} />
      </Suspense>
    </div>
  )
}

