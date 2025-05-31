import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_CONSULTATION_DETAILS } from "@/lib/graphql/doctor-queries"
import { ConsultationDetails } from "./consultation-details"
import { BackendConsultationDetails, FrontendConsultationDetails, transformConsultationDetails } from "@/lib/transformers/consultation-details"

// Define the consultation type
export type Consultation = FrontendConsultationDetails

// Get consultation details from the server
async function getConsultationDetails(id: string) {
  try {
    const data = await executeGraphQLServer<{ findUniqueConsultations: BackendConsultationDetails }>(
      GET_CONSULTATION_DETAILS,
      {
        where: {
          id: id
        }
      },
      {
        revalidate: 60, // Use ISR with 1 minute revalidation
        tags: [`consultation-${id}`],
      },
    )
    console.log("these are the consultation details data", data)
    return data.findUniqueConsultations ? transformConsultationDetails(data.findUniqueConsultations) : null
  } catch (error) {
    console.error("Error fetching consultation details:", error)
    return null
  }
}

export default async function ConsultationDetailsPage({ params }: { params: { id: string } }) {
  const consultation = await getConsultationDetails(params.id)

  if (!consultation) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/doctor/consultations">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux consultations
          </Link>
        </Button>
      </div>

      <ConsultationDetails consultation={consultation} />
    </div>
  )
}

