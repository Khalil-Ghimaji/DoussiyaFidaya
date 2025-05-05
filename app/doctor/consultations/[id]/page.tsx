import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_CONSULTATION_DETAILS } from "@/lib/graphql/doctor-queries"
import { ConsultationDetails } from "./consultation-details"

// Define the consultation type
type Consultation = {
  _id: string
  date: string
  time: string
  duration: number
  reason: string
  notes: string
  diagnosis: string
  createdBy: string
  createdAt: string
  updatedAt: string
  vitalSigns: {
    bloodPressure: string
    heartRate: string
    temperature: string
    respiratoryRate: string
    oxygenSaturation: string
    weight: string
  }
  prescriptions: {
    _id: string
    name: string
    dosage: string
    frequency: string
    duration: string
    quantity: string
  }[]
  labRequests: {
    _id: string
    type: string
    priority: string
    laboratory: string
    status: string
    resultId: string
  }[]
  patient: {
    _id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    bloodType: string
    profileImage: string
  }
  doctor: {
    _id: string
    firstName: string
    lastName: string
    speciality: string
  }
}

// Get consultation details from the server
async function getConsultationDetails(id: string) {
  try {
    const data = await executeGraphQLServer<{ consultation: Consultation }>(
      GET_CONSULTATION_DETAILS,
      { consultationId: id },
      {
        revalidate: 60, // Use ISR with 1 minute revalidation
        tags: [`consultation-${id}`],
      },
    )

    return data.consultation
  } catch (error) {
    console.error("Error fetching consultation details:", error)
    return null
  }
}

export default async function ConsultationDetailsPage({ params }: { params: { id: string } }) {
  const consultation = await getConsultationDetails(params.id)

  if (!consultation) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/doctor/consultations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux consultations
          </Link>
        </Button>
      </div>

      <ConsultationDetails consultation={consultation} />
    </div>
  )
}

