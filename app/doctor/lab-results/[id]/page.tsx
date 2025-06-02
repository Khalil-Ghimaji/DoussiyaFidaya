import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { fetchGraphQL } from "@/lib/graphql-client"
import { GET_LABORATORY_ANALYSIS_DETAILS } from "@/lib/graphql/queriesV2/laboratory"
import { LabResultDetails } from "./lab-result-details"

type LabResult = {
  _id: string
  date: string
  type: string
  status: string
  requestDate: string
  completionDate: string
  result: string
  patient: {
    _id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    profileImage: string | null
  }
  laboratory: {
    name: string
    address: string
    phone: string
  }
}

// Adapter: transform the GraphQL response into the UI model
function adaptToLabResults(data: any): LabResult[] {
  if (!data?.data?.anlyses) {
    console.error("Invalid data structure received:", data)
    return []
  }

  return data.data.anlyses.map((item: any) => ({
    _id: item.id,
    date: item.date,
    type: item.lab_requests?.type ?? "Unknown",
    status: item.status,
    requestDate: item.date, // Using date as requestDate since it's not separately provided
    completionDate: item.completed_at ?? "", // Fallback to empty string if null
    result: item.result ?? "No result provided", // Single result field
    patient: {
      _id: item.patients?.id,
      firstName: item.patients?.users?.first_name ?? "",
      lastName: item.patients?.users?.last_name ?? "",
      dateOfBirth: item.patients?.date_of_birth,
      gender: item.patients?.gender,
      profileImage: item.patients?.profile_image ?? null,
    },
    laboratory: {
      name: item.laboratories?.name ?? "",
      address: item.laboratories?.address ?? "",
      phone: item.laboratories?.phone ?? "",
    },
  }))
}

// Fetch lab results for a given lab request ID
async function getLabResults(labDocumentID: string): Promise<LabResult[] | null> {
  console.log("Fetching lab results for request ID:", labDocumentID)
  try {
    const response = await fetchGraphQL(
      GET_LABORATORY_ANALYSIS_DETAILS,
      { labDocumentID }
    )
    console.log("GraphQL response:", response)

    if (!response?.data?.anlyses?.length) {
      console.log("No analyses found in response")
      return null
    }

    const adaptedResults = adaptToLabResults(response)
    console.log("Adapted lab results:", adaptedResults)
    return adaptedResults
  } catch (error) {
    console.error("Error fetching lab results:", error)
    return null
  }
}

// Page component
export default async function LabResultsPage({ params }: { params: { id: string } }) {
  const { id } = params
  const labResults = await getLabResults(id)

  if (!labResults || labResults.length === 0) {
    notFound()
  }

  return (
    <div className="container py-8 space-y-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/doctor/patients">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux patients
          </Link>
        </Button>
      </div>

      {labResults.map((labResult) => (
        <LabResultDetails key={labResult._id} labResult={labResult} />
      ))}
    </div>
  )
}