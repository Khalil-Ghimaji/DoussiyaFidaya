import type { Metadata } from "next"
import { graphqlClient } from "@/lib/graphql/client"
import { GET_TERMS_CONTENT } from "@/lib/graphql/queries/content"

// This page uses Static Site Generation (SSG) since terms content rarely changes
export const revalidate = 86400 // Revalidate once per day

export const metadata: Metadata = {
  title: "Terms and Conditions | MediSystem",
  description: "Terms and conditions for using the MediSystem platform",
}

async function getTermsContent() {
  try {
    const { termsAndConditions } = await graphqlClient.request(GET_TERMS_CONTENT)
    return termsAndConditions
  } catch (error) {
    console.error("Error fetching terms content:", error)
    return {
      title: "Terms and Conditions",
      content: "Unable to load terms and conditions at this time. Please try again later.",
      lastUpdated: new Date().toISOString(),
    }
  }
}

export default async function TermsPage() {
  const terms = await getTermsContent()

  const formattedDate = new Date(terms.lastUpdated).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-6">{terms.title}</h1>

      <div className="mb-8 text-sm text-muted-foreground">Dernière mise à jour: {formattedDate}</div>

      <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: terms.content }} />
    </div>
  )
}

