import { Suspense } from "react"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_DOCTOR_PATIENTS } from "@/lib/graphql/doctor-queries"
import { auth } from "@/lib/auth"
import { PatientsFilters } from "./patients-filters"

// Define patient type
type Patient = {
  _id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  email: string
  phone: string
  address: string
  profileImage: string
  lastConsultation: string
}

// Get patients from the server
async function getDoctorPatients() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("User not authenticated")
    }

    const data = await executeGraphQLServer<{ doctorPatients: Patient[] }>(
      GET_DOCTOR_PATIENTS,
      { doctorId: session.user.id },
      {
        revalidate: 300, // Use ISR with 5 minute revalidation
        tags: ["patients"],
      },
    )

    return data.doctorPatients
  } catch (error) {
    console.error("Error fetching doctor patients:", error)
    return []
  }
}

export default async function PatientsPage() {
  const patients = await getDoctorPatients()

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Gérez vos patients et leurs dossiers médicaux</p>
        </div>
        <Button asChild>
          <Link href="/doctor/patients/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau patient
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Chargement des patients...</p>
            </div>
          </div>
        }
      >
        <PatientsFilters initialPatients={patients} />
      </Suspense>
    </div>
  )
}

