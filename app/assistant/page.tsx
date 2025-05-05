import { redirect } from "next/navigation"
import { getClient } from "@/lib/apollo-server"
import { GET_ASSISTANT_PROFILE } from "@/lib/graphql/queries/assistant"

export const dynamic = "force-dynamic"

async function getAssistantProfile() {
  try {
    const client = getClient()
    const { data } = await client.query({
      query: GET_ASSISTANT_PROFILE,
      fetchPolicy: "network-only",
    })
    return data.assistantProfile
  } catch (error) {
    console.error("Error fetching assistant profile:", error)
    return null
  }
}

export default async function AssistantPage() {
  const profile = await getAssistantProfile()

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Assistant Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">
            Unable to load your profile. Please try again later or contact support.
          </p>
        </div>
      </div>
    )
  }

  // Redirect to dashboard as the main page
  redirect("/assistant/dashboard")
}

