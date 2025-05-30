import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_DOCTOR_DASHBOARD_DATA } from "@/lib/graphql/doctor-queries"
import { auth } from "@/lib/auth"
import { DashboardStats } from "./dashboard-stats"
import { UpcomingAppointments } from "./upcoming-appointments"
import { RecentConsultations } from "./recent-consultations"

// Define dashboard data types
type DashboardData = {
  doctorStats: {
    totalPatients: number
    totalAppointments: number
    totalConsultations: number
    upcomingAppointments: number
    pendingRequests: number
  }
  recentAppointments: {
    _id: string
    date: string
    time: string
    status: string
    patient: {
      _id: string
      firstName: string
      lastName: string
      profileImage: string
    }
  }[]
  recentConsultations: {
    _id: string
    date: string
    patient: {
      _id: string
      firstName: string
      lastName: string
      profileImage: string
    }
    diagnosis: string
  }[]
}

// Get dashboard data from the server
async function getDashboardData() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("User not authenticated")
    }

    const data = await executeGraphQLServer<DashboardData>(
      GET_DOCTOR_DASHBOARD_DATA,
      { doctorId: session.user.id },
      {
        revalidate: 300, // Use ISR with 5 minute revalidation
        tags: ["dashboard"],
      },
    )

    return data
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return {
      doctorStats: {
        totalPatients: 0,
        totalAppointments: 0,
        totalConsultations: 0,
        upcomingAppointments: 0,
        pendingRequests: 0,
      },
      recentAppointments: [],
      recentConsultations: [],
    }
  }
}

export default async function DashboardPage() {
  const dashboardData = await getDashboardData()

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Tableau de bord</h1>

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
        <DashboardStats stats={dashboardData.doctorStats} />
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
          <UpcomingAppointments appointments={dashboardData.recentAppointments} />
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
          <RecentConsultations consultations={dashboardData.recentConsultations} />
        </Suspense>
      </div>
    </div>
  )
}

