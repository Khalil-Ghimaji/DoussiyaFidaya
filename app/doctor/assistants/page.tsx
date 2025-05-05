import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_DOCTOR_ASSISTANTS } from "@/lib/graphql/doctor-queries"
import { AssistantsList } from "./assistants-list"
import { NewAssistantDialog } from "./new-assistant-dialog"
import { auth } from "@/lib/auth"

// Define the assistant type
type Assistant = {
  _id: string
  name: string
  email: string
  phone: string
  status: string
  createdAt: string
  permissions: {
    manageAppointments: boolean
    viewPatientDetails: boolean
    editPatientDetails: boolean
    cancelAppointments: boolean
    rescheduleAppointments: boolean
  }
}

// Get assistants from the server
async function getDoctorAssistants() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("User not authenticated")
    }

    const data = await executeGraphQLServer<{ doctorAssistants: Assistant[] }>(
      GET_DOCTOR_ASSISTANTS,
      { doctorId: session.user.id },
      {
        cache: "no-store", // Use SSR for up-to-date data
        tags: ["assistants"],
      },
    )

    return data.doctorAssistants
  } catch (error) {
    console.error("Error fetching doctor assistants:", error)
    return []
  }
}

export default async function AssistantsPage() {
  const assistants = await getDoctorAssistants()

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assistants</h1>
          <p className="text-muted-foreground">Gérez vos assistants et leurs accès.</p>
        </div>

        <NewAssistantDialog />
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Chargement des assistants...</p>
            </div>
          </div>
        }
      >
        <AssistantsList initialAssistants={assistants} />
      </Suspense>
    </div>
  )
}

