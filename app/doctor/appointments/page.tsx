import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Loader2 } from "lucide-react"
import Link from "next/link"
import { fetchGraphQL } from "@/lib/graphql-client"
// import { auth } from "@/lib/auth"  // Temporarily commented
import { notFound } from "next/navigation"
import { DoctorAppointmentsTable } from "@/components/doctor/appointments-table"
import { AppointmentFilters } from "@/components/doctor/appointment-filters"
import { gql } from "@apollo/client"
import { format, parseISO, isSameDay } from "date-fns"

// Using dynamic rendering for appointments page to ensure fresh data
export const dynamic = "force-dynamic"

// Types for both entities
interface Patient {
  id: string
  profile_image: string | null
  gender: string
  cin: string
  date_of_birth: string
  user_id: string
  users: {
    first_name: string
    last_name: string
  }
}

interface RdvRequest {
  id: string
  date: string
  time: string
  Motif: string
  Status: string
  doctor_id: string
  patients: Patient
}

interface Rdv {
  id: string
  date: string
  time: string
  doctor_id: string
  patient_id: string
  rdv_request_id: string | null
  consultation_id: string | null
  patients: Patient
}

interface PatientResponse {
  findManyPatients: Array<{
    id: string
    users: {
      first_name: string
      last_name: string
    }
  }>
}

// Queries
const GET_DOCTOR_RDV_REQUESTS = gql`
  query MyQuery($equals: String) {
    findManyRdv_requests(where: {doctor_id: {equals: $equals}}) {
      id
      date
      time
      Motif
      Status
      doctor_id
      patients {
        id
        profile_image
        gender
        cin
        date_of_birth
        user_id
        users {
          first_name
          last_name
        }
      }
    }
  }
`

const GET_DOCTOR_RDVS = gql`
  query MyQuery($equals: String = "") {
    findManyRdvs(where: {doctor_id: {equals: $equals}}) {
      consultation_id
      date
      doctor_id
      id
      patient_id
      rdv_request_id
      time
      patients {
        cin
        date_of_birth
        gender
        id
        profile_image
        user_id
        users {
          first_name
          last_name
        }
      }
    }
  }
`

const CREATE_RDV = gql`
  mutation MyMutation($data: RdvsCreateInput!) {
    createOneRdvs(data: $data) {
      consultation_id
      date
      doctor_id
      id
      patient_id
      time
    }
  }
`

// Query to get all patients
const GET_PATIENTS = `
  query GetPatients {
    findManyPatients {
      id
      users {
        first_name
        last_name
      }
    }
  }
`

// Transform functions
function transformRdvRequest(rdv: RdvRequest) {
  return {
    _id: rdv.id,
    date: rdv.date,
    time: rdv.time,
    status: rdv.Status.toLowerCase(),
    type: "consultation",
    reason: rdv.Motif,
    duration: "30",
    notes: "",
    createdAt: new Date().toISOString(),
    createdBy: rdv.doctor_id,
    consultation_id: null,
    patient: {
      _id: rdv.patients.id,
      firstName: rdv.patients.users.first_name,
      lastName: rdv.patients.users.last_name,
      avatar: rdv.patients.profile_image || undefined,
      initials: "P",
      age: new Date().getFullYear() - new Date(rdv.patients.date_of_birth).getFullYear(),
      gender: rdv.patients.gender
    }
  }
}

function transformRdv(rdv: Rdv) {
  return {
    _id: rdv.id,
    date: rdv.date,
    time: rdv.time,
    status: "confirmed",
    type: "consultation",
    reason: "Consultation",
    duration: "30",
    notes: "",
    createdAt: new Date().toISOString(),
    createdBy: rdv.doctor_id,
    consultation_id: rdv.consultation_id,
    patient: {
      _id: rdv.patients.id,
      firstName: rdv.patients.users.first_name,
      lastName: rdv.patients.users.last_name,
      avatar: rdv.patients.profile_image || undefined,
      initials: "P",
      age: new Date().getFullYear() - new Date(rdv.patients.date_of_birth).getFullYear(),
      gender: rdv.patients.gender
    }
  }
}

async function getPatients() {
  const { data } = await fetchGraphQL<PatientResponse>(GET_PATIENTS)
  return data.findManyPatients.map((patient) => ({
    id: patient.id,
    firstName: patient.users.first_name,
    lastName: patient.users.last_name,
  }))
}

async function DoctorAppointmentsContent({
  searchParams,
}: { searchParams: { [key: string]: string | string[] | undefined } }) {
  // Temporarily comment out session check and use a hardcoded doctor ID
  // const session = await auth()
  // if (!session?.user?.id) {
  //   notFound()
  // }

  // Temporary doctor ID for testing
  const tempDoctorId = "3665a171-9626-4ee1-a1dd-086a1e445c2d" // Replace with an actual doctor ID from your database

  // Parse filters from search params
  const searchFilter = (searchParams.search as string) || ""
  const dateFilter = searchParams.date ? new Date(searchParams.date as string) : undefined

  try {
    // Fetch both RDV requests and RDVs
    const [rdvRequestsResponse, rdvsResponse] = await Promise.all([
      fetchGraphQL<{ findManyRdv_requests: RdvRequest[] }>(
        GET_DOCTOR_RDV_REQUESTS,
        { equals: tempDoctorId }
      ),
      fetchGraphQL<{ findManyRdvs: Rdv[] }>(
        GET_DOCTOR_RDVS,
        { equals: tempDoctorId }
      )
    ])

    // Transform and filter RDV requests
    let rdvRequests = (rdvRequestsResponse.data?.findManyRdv_requests || [])
      .map(transformRdvRequest)

    // Transform and filter RDVs
    let rdvs = (rdvsResponse.data?.findManyRdvs || [])
      .map(transformRdv)

    // Apply search filter to both
    if (searchFilter) {
      const filterBySearch = (app: any) => {
        const fullName = `${app.patient.firstName} ${app.patient.lastName}`.toLowerCase()
        const searchLower = searchFilter.toLowerCase()
        return fullName.includes(searchLower) || (app.reason && app.reason.toLowerCase().includes(searchLower))
      }
      rdvRequests = rdvRequests.filter(filterBySearch)
      rdvs = rdvs.filter(filterBySearch)
    }

    // Apply date filter to both
    if (dateFilter) {
      const filterByDate = (app: any) => {
        const appDate = parseISO(app.date)
        return isSameDay(appDate, dateFilter)
      }
      rdvRequests = rdvRequests.filter(filterByDate)
      rdvs = rdvs.filter(filterByDate)
    }

    // Group appointments
    const upcoming = rdvs.filter(rdv => !rdv.consultation_id) // RDVs without consultation are upcoming
    const pending = rdvRequests.filter(req => req.status === "pending")
    const past = rdvs.filter(rdv => rdv.consultation_id) // RDVs with consultation are past
    const cancelled = rdvRequests.filter(req => req.status === "cancelled")

    // Function to handle accepting a request
    const handleAcceptRequest = async (request: RdvRequest) => {
      try {
        await fetchGraphQL(
          CREATE_RDV,
          {
            data: {
              date: request.date,
              time: request.time,
              doctor_id: request.doctor_id,
              patient_id: request.patients.id,
              rdv_request_id: request.id
            }
          }
        )
        // Refresh the page after successful creation
        window.location.reload()
      } catch (error) {
        console.error('Error accepting request:', error)
      }
    }

    const patients = await getPatients()
    const doctorId = "your-doctor-id" // Replace with actual doctor ID from your auth context

    return (
      <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rendez-vous</h1>
            <p className="text-muted-foreground">Gérez vos rendez-vous et consultations</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/doctor/appointments/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Nouveau rendez-vous
              </Link>
            </Button>
          </div>
        </div>

        <AppointmentFilters />

        <Tabs defaultValue="upcoming" className="space-y-4 mt-8">
          <TabsList>
            <TabsTrigger value="upcoming">À venir ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="pending">En attente ({pending.length})</TabsTrigger>
            <TabsTrigger value="past">Passés ({past.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Annulés ({cancelled.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rendez-vous à venir</CardTitle>
                <CardDescription>
                  {upcoming.length > 0
                    ? `Vous avez ${upcoming.length} rendez-vous confirmés`
                    : "Vous n'avez pas de rendez-vous confirmés"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DoctorAppointmentsTable appointments={upcoming} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Demandes en attente</CardTitle>
                <CardDescription>
                  {pending.length > 0
                    ? `Vous avez ${pending.length} demandes de rendez-vous en attente`
                    : "Vous n'avez pas de demandes en attente"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DoctorAppointmentsTable appointments={pending} isPending />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="past" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rendez-vous passés</CardTitle>
                <CardDescription>
                  {past.length > 0
                    ? `Vous avez ${past.length} rendez-vous passés ou annulés`
                    : "Vous n'avez pas de rendez-vous passés"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DoctorAppointmentsTable appointments={past} isPast />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="cancelled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rendez-vous annulés</CardTitle>
                <CardDescription>
                  {cancelled.length > 0
                    ? `Vous avez ${cancelled.length} rendez-vous annulés`
                    : "Vous n'avez pas de rendez-vous annulés"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DoctorAppointmentsTable appointments={cancelled} isPast />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </>
    )
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Erreur</p>
        <p>Une erreur est survenue lors du chargement de vos rendez-vous. Veuillez réessayer plus tard.</p>
      </div>
    )
  }
}

export default function DoctorAppointmentsPage({
  searchParams,
}: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement des rendez-vous...</p>
            </div>
          </div>
        }
      >
        <DoctorAppointmentsContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

