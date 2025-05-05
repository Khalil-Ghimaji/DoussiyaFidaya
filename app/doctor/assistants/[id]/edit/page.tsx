import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_ASSISTANT_DETAILS } from "@/lib/graphql/doctor-queries"
import { EditAssistantForm } from "./edit-form"

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

// Get assistant details from the server
async function getAssistantDetails(id: string) {
  try {
    const data = await executeGraphQLServer<{ assistant: Assistant }>(
      GET_ASSISTANT_DETAILS,
      { assistantId: id },
      {
        cache: "no-store", // Use SSR for up-to-date data
        tags: [`assistant-${id}`],
      },
    )

    return data.assistant
  } catch (error) {
    console.error("Error fetching assistant details:", error)
    return null
  }
}

export default async function EditAssistantPage({ params }: { params: { id: string } }) {
  const assistant = await getAssistantDetails(params.id)

  if (!assistant) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/doctor/assistants">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux assistants
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Modifier l'assistant</CardTitle>
            <CardDescription>Modifiez les informations et les permissions de l'assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <EditAssistantForm assistant={assistant} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

