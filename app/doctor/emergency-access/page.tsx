import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_EMERGENCY_ACCESS_REQUESTS } from "@/lib/graphql/doctor-queries"
import { auth } from "@/lib/auth"
import { EmergencyAccessList } from "./emergency-access-list"

// Define emergency access request type
type EmergencyAccessRequest = {
  _id: string
  date: string
  status: string
  reason: string
  requestedBy: {
    _id: string
    firstName: string
    lastName: string
    speciality: string
    hospital: string
    profileImage: string
  }
  patient: {
    _id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    profileImage: string
  }
}

// Get emergency access requests from the server
async function getEmergencyAccessRequests() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("User not authenticated")
    }

    const data = await executeGraphQLServer<{ emergencyAccessRequests: EmergencyAccessRequest[] }>(
      GET_EMERGENCY_ACCESS_REQUESTS,
      { doctorId: session.user.id },
      {
        cache: "no-store", // Use SSR for up-to-date data
        tags: ["emergency-access"],
      },
    )

    return data.emergencyAccessRequests
  } catch (error) {
    console.error("Error fetching emergency access requests:", error)
    return []
  }
}

export default async function EmergencyAccessPage() {
  const requests = await getEmergencyAccessRequests()

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accès d'urgence</h1>
          <p className="text-muted-foreground">Gérez les demandes d'accès d'urgence à vos dossiers patients</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Chargement des demandes d'accès...</p>
            </div>
          </div>
        }
      >
        <EmergencyAccessList initialRequests={requests} />
      </Suspense>
    </div>
  )
}

