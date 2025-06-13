import { Suspense } from "react"
import { Loader2, Users } from "lucide-react"
import { DashboardStats } from "./dashboard-stats"
import { UpcomingAppointments } from "./upcoming-appointments"
import { RecentConsultations } from "./recent-consultations"
import { GET_DOCTOR_DASHBOARD } from "@/lib/graphql/queriesV2/doctor"
import { sendGraphQLMutation } from "@/lib/graphql-client"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Define dashboard data types based on the new GraphQL structure
type DashboardData = {
  patientData: { patient_id: string }[]
  totalAppointments: { _count: { _all: number } }
  totalConsultations: { _count: { _all: number } }
  upcomingAppointments: { _count: { _all: number } }
  pendingRequests: { _count: { _all: number } }
  recentAppointments: {
    id: string
    date: string
    time: string
    patients: {
      id: string
      users: {
        first_name: string
        last_name: string
        profile_picture: string | null
      }
    }
  }[]
  recentConsultations: {
    id: string
    date: string
    notes: string[]
    patients: {
      id: string
      users: {
        first_name: string
        last_name: string
        profile_picture: string | null
      }
    }
  }[]
}

async function getDashboardData() {
  try {
    const storedSession = await cookies()
    const doctorId = storedSession.get("associatedId")?.value
    const session = { user: { id: doctorId } }

    const { data } = await sendGraphQLMutation<DashboardData>(GET_DOCTOR_DASHBOARD, { doctorId: session.user.id })

    return data
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return {
      patientData: [],
      totalAppointments: { _count: { _all: 0 } },
      totalConsultations: { _count: { _all: 0 } },
      upcomingAppointments: { _count: { _all: 0 } },
      pendingRequests: { _count: { _all: 0 } },
      recentAppointments: [],
      recentConsultations: [],
    }
  }
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData()

  // Calculate unique patients count
  const uniquePatientIds = new Set(dashboardData.patientData.map((p) => p.patient_id))
  const totalPatients = uniquePatientIds.size

  // Transform data for components
  const stats = {
    totalPatients,
    totalAppointments: dashboardData.totalAppointments._count._all,
    totalConsultations: dashboardData.totalConsultations._count._all,
    upcomingAppointments: dashboardData.upcomingAppointments._count._all,
    pendingRequests: dashboardData.pendingRequests._count._all,
  }

  // Transform appointments data
  const appointments = dashboardData.recentAppointments.map((apt) => ({
    _id: apt.id,
    date: apt.date,
    time: apt.time,
    patient: {
      _id: apt.patients.id,
      firstName: apt.patients.users.first_name,
      lastName: apt.patients.users.last_name,
      profileImage: apt.patients.users.profile_picture || null,
    },
  }))

  // Transform consultations data
  const consultations = dashboardData.recentConsultations.map((cons) => ({
    _id: cons.id,
    date: cons.date,
    patient: {
      _id: cons.patients.id,
      firstName: cons.patients.users.first_name,
      lastName: cons.patients.users.last_name,
      profileImage: cons.patients.users.profile_picture || null,
    },
    diagnosis: cons.notes && cons.notes.length > 0 ? cons.notes[0] : "Consultation",
  }))

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href="/doctor/patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Voir tous les patients
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Chargement des statistiques...</p>
            </div>
          </div>
        }
      >
        <DashboardStats stats={stats} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Chargement des rendez-vous...</p>
              </div>
            </div>
          }
        >
          <UpcomingAppointments appointments={appointments} />
        </Suspense>

        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Chargement des consultations...</p>
              </div>
            </div>
          }
        >
          <RecentConsultations consultations={consultations} />
        </Suspense>
      </div>
    </div>
  )
}
