import { Suspense } from "react"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_DOCTOR_CONSULTATIONS } from "@/lib/graphql/doctor-queries"
import { auth } from "@/lib/auth"
import { ConsultationsFilters } from "./consultations-filters"
import { BackendConsultation, FrontendConsultation, transformConsultations } from "@/lib/transformers/consultation"
import {cookies} from "next/headers";
import {fetchGraphQL} from "@/lib/graphql-client";

// Define the consultation type
export type Consultation = FrontendConsultation

// Get consultations from the server
async function getDoctorConsultations() {
  try {
    const token = (await cookies()).get("token")?.value || ""
    console.log("this is the token", token)
    if (!token) {
      throw new Error("No authentication token found")
    }
    const userId = (await cookies()).get("userId")?.value || ""
    console.log("this is the userId", userId)

    // Default to fetching consultations for the last 30 days
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const startDate = thirtyDaysAgo.toISOString()
    const endDate = today.toISOString()

    const {data} = await fetchGraphQL<{ findManyConsultations: BackendConsultation[] }>(
      GET_DOCTOR_CONSULTATIONS,
      {
        where: {
          doctor_id: { equals: userId },
          // date: {
          //   gte: startDate,
          //   lte: endDate
          // }
        //uncomment this
        }
      }
    )
    console.log("these are the consultations data", data)

    return transformConsultations(data.findManyConsultations)
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

