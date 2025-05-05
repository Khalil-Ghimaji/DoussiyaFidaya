import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { fetchGraphQL } from "@/lib/server/graphql-client"
import { GET_PATIENT_AUTHORIZATIONS } from "@/lib/server/patient-queries"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { AuthorizedDoctorsContent } from "./authorized-doctors-content"

// Using dynamic rendering for authorized doctors page to ensure fresh data
export const dynamic = "force-dynamic"

async function fetchAuthorizedDoctorsData() {
  const session = await auth()
  if (!session?.user?.id) {
    notFound()
  }

  try {
    const data = await fetchGraphQL<{
      authorizedDoctors: Array<{
        _id: string
        doctor: {
          _id: string
          firstName: string
          lastName: string
          avatar: string
          initials: string
          specialty: string
          hospital: string
        }
        authorizedSince: string
        accessLevel: string
      }>
      availableDoctors: Array<{
        _id: string
        firstName: string
        lastName: string
        avatar: string
        initials: string
        specialty: string
        hospital: string
      }>
    }>(GET_PATIENT_AUTHORIZATIONS, { patientId: session.user.id }, "no-store")

    return data
  } catch (error) {
    console.error("Error fetching authorized doctors data:", error)
    throw error
  }
}

export default function AuthorizedDoctorsPage() {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement des médecins autorisés...</p>
            </div>
          </div>
        }
      >
        <AuthorizedDoctorsContent dataPromise={fetchAuthorizedDoctorsData()} />
      </Suspense>
    </div>
  )
}

