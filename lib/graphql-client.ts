import { env } from "@/lib/env"

/**
 * Execute a GraphQL query or mutation
 * @param query The GraphQL query or mutation
 * @param variables The variables for the query or mutation
 * @param isServer Whether the request is made from the server
 * @returns The response data
 */
export async function executeGraphQL(query: string, variables = {}, isServer = false) {
  try {
    // Use the appropriate API URL based on whether the request is from the server or client
    const apiUrl = isServer ? env.GRAPHQL_API_URL : env.NEXT_PUBLIC_GRAPHQL_API_URL

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      // Include credentials for authenticated requests
      credentials: "include",
      // For server-side requests, we need to specify cache behavior
      ...(isServer ? { cache: "no-store" } : {}),
    })

    const result = await response.json()

    if (result.errors) {
      throw new Error(result.errors[0].message || "GraphQL Error")
    }

    return result.data
  } catch (error) {
    console.error("GraphQL request failed:", error)
    throw error
  }
}

