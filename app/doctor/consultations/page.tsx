import { Suspense } from "react"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_DOCTOR_CONSULTATIONS } from "@/lib/graphql/doctor-queries"
import { auth } from "@/lib/auth"
import { ConsultationsFilters } from "./consultations-filters"

// Define the consultation type
export type Consultation = {
  _id: string
  date: string
  time: string
  reason: string
  diagnosis: string
  hasPrescription: boolean
  hasLabRequest: boolean
  patient: {
    _id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    profileImage: string
  }
}

// Get consultations from the server
async function getDoctorConsultations() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("User not authenticated")
    }

    // Default to fetching consultations for the last 30 days
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const startDate = thirtyDaysAgo.toISOString().split("T")[0]
    const endDate = today.toISOString().split("T")[0]

    const data = await executeGraphQLServer<{ doctorConsultations: Consultation[] }>(
      GET_DOCTOR_CONSULTATIONS,
      {
        doctorId: session.user.id,
        startDate,
        endDate,
      },
      {
        cache: "no-store", // Use SSR for up-to-date data
        tags: ["consultations"],
      },
    )

    return data.doctorConsultations
  } catch (error) {
    console.error("Error fetching doctor consultations:", error)
    return []
  }
}

export default async function ConsultationsPage() {
  const consultations = await getDoctorConsultations()

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consultations</h1>
          <p className="text-muted-foreground">Gérez et consultez l'historique des consultations</p>
        </div>
        <Button asChild>
          <Link href="/doctor/appointments">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle consultation
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Chargement des consultations...</p>
            </div>
          </div>
        }
      >
        <ConsultationsFilters initialConsultations={consultations} />
      </Suspense>
    </div>
  )
}

