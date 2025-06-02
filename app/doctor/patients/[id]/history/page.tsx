import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GET_PATIENT_INFO, GET_PATIENT_HISTORY } from "@/lib/graphql/queriesV2/patient"
import { PatientHistoryTabs } from "./patient-history-tabs"
import { adaptToPatient, Patient, PatientHistory } from "@/lib/graphql/types/patient"
import { fetchGraphQL } from "@/lib/graphql-client"

// Raw data shape returned by GET_PATIENT_HISTORY
type RawData = {
  consultations?: Array<{
    id: string
    date: string
    notes: string[] | null
    doctors: {
      id: string
      users: {
        first_name: string
        last_name: string
      }
      specialty: string
    }
  }>
  prescriptions?: Array<{
    id: string
    date: string
    medications: {
      name: string
      dosage: string
      frequency: string
      duration: string
    }[]
    doctors: {
      users: {
        first_name: string
        last_name: string
      }
    }
  }>
  labResults?: Array<{
    id: string
    date: string
    type: {
      name: string
    }
    status: string
    resultSummary: string | null
  }>
}

function adaptToPatientHistory(data?: RawData): PatientHistory {
  return {
    patientLabResults: data?.labResults?.map(lab => ({
      id: lab.id,
      date: lab.date,
      type: lab.type?.name ?? "",
      status: lab.status,
      resultSummary: lab.resultSummary ?? "",
    })) ?? [],

    patientPrescriptions: data?.prescriptions?.map(prescription => ({
      id: prescription.id,
      date: prescription.date,
      medications: prescription.medications,
      doctor: {
        firstName: prescription.doctors?.users?.first_name ?? "",
        lastName: prescription.doctors?.users?.last_name ?? "",
      },
    })) ?? [],

    patientConsultations: data?.consultations?.map(consultation => ({
      id: consultation.id,
      date: consultation.date,
      notes: Array.isArray(consultation.notes)
        ? consultation.notes.join("\n")
        : consultation.notes ?? "",
      doctor: {
        id: consultation.doctors?.id ?? "",
        firstName: consultation.doctors?.users?.first_name ?? "",
        lastName: consultation.doctors?.users?.last_name ?? "",
        speciality: consultation.doctors?.specialty ?? "",
      },
    })) ?? [],
  }
}



async function getPatientDetails(id: string): Promise<Patient | null> {
  try {
    const response = await fetchGraphQL<{ patient: any }>(GET_PATIENT_INFO, { patientId: id })
    return adaptToPatient(response.data)
  } catch (error) {
    console.error("Error fetching patient details:", error)
    return null
  }
}

async function getPatientHistory(id: string): Promise<PatientHistory> {
  try {
    const response = await fetchGraphQL<RawData>(GET_PATIENT_HISTORY, { patientId: id, take: 5, skip: 0 })

    if (!response.data) {
      console.warn("No patient history found for patient ID:", id)
      return {
        patientConsultations: [],
        patientPrescriptions: [],
        patientLabResults: [],
      }
    }

    return adaptToPatientHistory(response.data)
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
  if (!patient) notFound()

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

      {/* Suspense is unnecessary here since data is already loaded */}
      <PatientHistoryTabs history={history} patientId={params.id} />
    </div>
  )
}
