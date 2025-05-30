import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_CONSULTATION_DETAILS } from "@/lib/graphql/doctor-queries"
import { PatientProfile } from "@/components/patient/profile"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { EditConsultationForm } from "./edit-form"

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
        cache: "no-store", // Use SSR for up-to-date data
        tags: [`consultation-${id}`],
      },
    )

    return data.consultation
  } catch (error) {
    console.error("Error fetching consultation details:", error)
    return null
  }
}

export default async function EditConsultationPage({ params }: { params: { id: string } }) {
  const consultation = await getConsultationDetails(params.id)

  if (!consultation) {
    notFound()
  }

  const consultationDate = new Date(consultation.date)

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/doctor/consultations/${params.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la consultation
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <PatientProfile patient={consultation.patient} />
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Modifier la consultation</CardTitle>
              <CardDescription>
                Consultation du {format(consultationDate, "dd MMMM yyyy", { locale: fr })} à {consultation.time}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditConsultationForm consultation={consultation} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

