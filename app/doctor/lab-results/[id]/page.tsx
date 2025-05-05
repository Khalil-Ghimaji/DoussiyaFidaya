import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_LAB_RESULT_DETAILS } from "@/lib/graphql/doctor-queries"
import { LabResultDetails } from "./lab-result-details"

// Define the lab result type
type LabResult = {
  _id: string
  date: string
  type: string
  status: string
  requestDate: string
  completionDate: string
  resultSummary: string
  resultDetails: string
  attachments: string[]
  patient: {
    _id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    profileImage: string
  }
  doctor: {
    _id: string
    firstName: string
    lastName: string
    speciality: string
  }
  laboratory: {
    name: string
    address: string
    phone: string
  }
}

// Get lab result details from the server
async function getLabResultDetails(id: string) {
  try {
    const data = await executeGraphQLServer<{ labResult: LabResult }>(
      GET_LAB_RESULT_DETAILS,
      { resultId: id },
      {
        revalidate: 60, // Use ISR with 1 minute revalidation
        tags: [`lab-result-${id}`],
      },
    )

    return data.labResult
  } catch (error) {
    console.error("Error fetching lab result details:", error)
    return null
  }
}

export default async function LabResultDetailsPage({ params }: { params: { id: string } }) {
  const labResult = await getLabResultDetails(params.id)

  if (!labResult) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/doctor/lab-results">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux résultats d'analyses
          </Link>
        </Button>
      </div>

      <LabResultDetails labResult={labResult} />
    </div>
  )
}

