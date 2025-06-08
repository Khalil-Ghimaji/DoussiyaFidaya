import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PatientProfile } from "@/components/patient/profile"
import Link from "next/link"
import {fetchGraphQL} from "@/lib/graphql-client";
import {adaptToPatient, PatientExtended} from "@/lib/graphql/types/patient";
import {RdvConsultationForm} from "@/app/doctor/appointments/[id]/consultation/consultation-form";


const GET_PATIENT_EXTENDED = `
  query MyQuery($appointmentId: String!) {
    patient:findFirstPatients(where: {rdvs: {some: {id: {equals: $appointmentId}}}}) {
      id
      users {
        first_name
        last_name
        email
        phone
        address
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
`

// Get appointment details from the server
async function getAppointmentDetails(id: string) {
  try {
    const {data} = await fetchGraphQL<{ patient: any }>(
      GET_PATIENT_EXTENDED,
      { appointmentId: id },
    )
    console.log("Fetched appointment data:", data)
    const adaptedPatient = adaptToPatient(data)
    console.log("Fetched appointment details:", adaptedPatient)

    return {patient:adaptedPatient, id: id}
  } catch (error) {
    console.error("Error fetching appointment details:", error)
    return null
  }
}

export default async function AppointmentConsultationPage({ params }: { params: { id: string } }) {
  const appointment = await getAppointmentDetails(params.id)

  if (!appointment) {
    notFound()
  }

  return (
      <div className="container py-8">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/doctor/appointments">
              <ArrowLeft className="mr-2 h-4 w-4"/> Retour aux rendez-vous
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Nouvelle consultation - {appointment.patient.firstName} {appointment.patient.lastName}
          </h1>
          <p className="text-muted-foreground">Créez une nouvelle consultation pour ce patient</p>
        </div>
        <Suspense
            fallback={
              <Card>
                <CardContent className="py-10">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                    <p className="mt-2 text-sm text-muted-foreground">Chargement du formulaire de
                      consultation...</p>
                  </div>
                </CardContent>
              </Card>
            }
        >
          <RdvConsultationForm patient={appointment.patient as PatientExtended} rdvId={appointment.id}/>
        </Suspense>
      </div>
  )
}

