import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PatientProfile } from "@/components/patient/profile"
import Link from "next/link"
import { fetchGraphQL } from "@/lib/graphql-client"
import { ConsultationForm } from "./consultation-form"
import { gql } from "@apollo/client"

const GET_APPOINTMENT_DETAILS = gql`
  query MyQuery($id: UuidFilter = {}) {
    findFirstRdvs(where: {id: $id}) {
      consultation_id
      date
      doctor_id
      id
      patient_id
      time
      doctors {
        id
        first_name
        last_name
        specialty
      }
      patients {
        users {
          first_name
          last_name
          profile_picture
        }
        date_of_birth
        gender
        GeneralMedicalRecords_GeneralMedicalRecords_patient_idTopatients {
          bloodType
          allergies
        }
      }
    }
  }
`

// Define the GraphQL response type
type AppointmentResponse = {
  id: string
  date: string
  time: string
  consultation_id: string | null
  doctor_id: string
  patient_id: string
  doctors: {
    id: string
    first_name: string
    last_name: string
    specialty: string
  }
  patients: {
    users: {
      first_name: string
      last_name: string
      profile_picture: string | null
    }
    date_of_birth: string
    gender: string
    GeneralMedicalRecords_GeneralMedicalRecords_patient_idTopatients: {
      bloodType: string | null
      allergies: string[] | null
    } | null
  }
}

// Define the type expected by the components
type Appointment = {
  _id: string
  date: string
  time: string
  duration: number
  status: string
  reason: string
  notes: string
  patient: {
    _id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    bloodType: string
    allergies: string[]
    profileImage: string
  }
  doctor: {
    _id: string
    firstName: string
    lastName: string
    speciality: string
  }
}

// Get appointment details from the server
async function getAppointmentDetails(id: string) {
  try {
    const response = await fetchGraphQL<{ findFirstRdvs: AppointmentResponse }>(
      GET_APPOINTMENT_DETAILS,
      { id: { equals: id } }
    )

    return response.data.findFirstRdvs
  } catch (error) {
    console.error("Error fetching appointment details:", error)
    return null
  }
}

export default async function AppointmentConsultationPage({ params }: { params: { id: string } }) {
  const appointmentData = await getAppointmentDetails(params.id)

  if (!appointmentData) {
    notFound()
  }

  // Transform the appointment data to match the expected format for the components
  const appointment: Appointment = {
    _id: appointmentData.id,
    date: appointmentData.date,
    time: appointmentData.time,
    duration: 30, // Default duration in minutes
    status: "scheduled",
    reason: "", // Will be filled in the consultation form
    notes: "", // Will be filled in the consultation form
    patient: {
      _id: appointmentData.patient_id,
      firstName: appointmentData.patients.users.first_name,
      lastName: appointmentData.patients.users.last_name,
      dateOfBirth: appointmentData.patients.date_of_birth,
      gender: appointmentData.patients.gender,
      bloodType: appointmentData.patients.GeneralMedicalRecords_GeneralMedicalRecords_patient_idTopatients?.bloodType || "",
      allergies: appointmentData.patients.GeneralMedicalRecords_GeneralMedicalRecords_patient_idTopatients?.allergies || [],
      profileImage: appointmentData.patients.users.profile_picture || ""
    },
    doctor: {
      _id: appointmentData.doctor_id,
      firstName: appointmentData.doctors.first_name,
      lastName: appointmentData.doctors.last_name,
      speciality: appointmentData.doctors.specialty
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/doctor/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux rendez-vous
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <PatientProfile patient={appointment.patient} />
        </div>

        <div className="md:col-span-2">
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
            <ConsultationForm appointment={appointment} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

