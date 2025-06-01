import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_PATIENT_EXTENDED } from "@/lib/graphql/queriesV2/patient"
import { PatientDetails } from "./patient-details"
import { fetchGraphQL } from "@/lib/graphql-client"
import { adaptToPatient, Patient } from "@/lib/graphql/types/patient"
import { get } from "http"


// Get patient details from the server
async function getPatientDetails(id: string) {
  try {
    const data = await fetchGraphQL<any>(
      GET_PATIENT_EXTENDED,
      { patientId: id },
     
    )

    return adaptToPatient(data.data)
  } catch (error) {
    console.error("Error fetching patient details:", error)
    return null
  }
}

export default async function PatientDetailsPage({ params }: { params: { id: string } }) {
  const patient = await getPatientDetails(params.id)

  if (!patient) {
    notFound()
  }

  //

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/doctor/patients">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux patients
          </Link>
        </Button>
      </div>

      <PatientDetails patient={patient} />
    </div>
  )
}

