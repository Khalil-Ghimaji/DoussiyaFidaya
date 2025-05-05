import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_PATIENT_DETAILS } from "@/lib/graphql/doctor-queries"
import { PrescriptionForm } from "./prescription-form"

// Define the patient type
type Patient = {
  _id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  bloodType: string
  allergies: string[]
  medications: string[]
  profileImage: string
}

// Get patient details from the server
async function getPatientDetails(id: string) {
  try {
    const data = await executeGraphQLServer<{ patient: Patient }>(
      GET_PATIENT_DETAILS,
      { patientId: id },
      {
        cache: "no-store", // Use SSR for up-to-date data
        tags: [`patient-${id}`],
      },
    )

    return data.patient
  } catch (error) {
    console.error("Error fetching patient details:", error)
    return null
  }
}

export default async function PatientPrescriptionPage({ params }: { params: { id: string } }) {
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
          Nouvelle ordonnance - {patient.firstName} {patient.lastName}
        </h1>
        <p className="text-muted-foreground">Créez une nouvelle ordonnance pour ce patient</p>
      </div>

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
        <PrescriptionForm patient={patient} />
      </Suspense>
    </div>
  )
}

