import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_PATIENT_DETAILS, GET_PATIENT_HISTORY } from "@/lib/graphql/doctor-queries"
import { PatientHistoryTabs } from "./patient-history-tabs"

// Define the patient type
type Patient = {
  _id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  profileImage: string
}

// Define the patient history type
type PatientHistory = {
  patientConsultations: {
    _id: string
    date: string
    time: string
    reason: string
    diagnosis: string
    doctor: {
      _id: string
      firstName: string
      lastName: string
      speciality: string
    }
  }[]
  patientPrescriptions: {
    _id: string
    date: string
    medications: {
      name: string
      dosage: string
      frequency: string
      duration: string
    }[]
    doctor: {
      firstName: string
      lastName: string
    }
  }[]
  patientLabResults: {
    _id: string
    date: string
    type: string
    status: string
    resultSummary: string
  }[]
}

// Get patient details from the server
async function getPatientDetails(id: string) {
  try {
    const data = await executeGraphQLServer<{ patient: Patient }>(
      GET_PATIENT_DETAILS,
      { patientId: id },
      {
        revalidate: 60, // Use ISR with 1 minute revalidation
        tags: [`patient-${id}`],
      },
    )

    return data.patient
  } catch (error) {
    console.error("Error fetching patient details:", error)
    return null
  }
}

// Get patient history from the server
async function getPatientHistory(id: string) {
  try {
    const data = await executeGraphQLServer<PatientHistory>(
      GET_PATIENT_HISTORY,
      { patientId: id },
      {
        revalidate: 60, // Use ISR with 1 minute revalidation
        tags: [`patient-history-${id}`],
      },
    )

    return data
  } catch (error) {
    console.error("Error fetching patient history:", error)
    return {
      patientConsultations: [],
      patientPrescriptions: [],
      patientLabResults: [],
    }
  }
}

export default async function PatientHistoryPage({ params }: { params: { id: string } }) {
  const patient = await getPatientDetails(params.id)

  if (!patient) {
    notFound()
  }

  const history = await getPatientHistory(params.id)

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
          Historique médical - {patient.firstName} {patient.lastName}
        </h1>
        <p className="text-muted-foreground">
          Consultez l'historique complet des consultations, ordonnances et analyses
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Chargement de l'historique...</p>
            </div>
          </div>
        }
      >
        <PatientHistoryTabs history={history} patientId={params.id} />
      </Suspense>
    </div>
  )
}

