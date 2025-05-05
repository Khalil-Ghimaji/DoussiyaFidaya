import { env } from "@/lib/env"

type GraphQLRequestOptions = {
  cache?: RequestCache
  revalidate?: number
  tags?: string[]
  headers?: HeadersInit
}

/**
 * Execute a GraphQL query or mutation on the server
 * @param query The GraphQL query or mutation
 * @param variables The variables for the query or mutation
 * @param options Cache and revalidation options
 * @returns The response data
 */
export async function executeGraphQLServer<T = any>(
  query: string,
  variables = {},
  options: GraphQLRequestOptions = {},
) {
  const { cache = "force-cache", revalidate, tags, headers = {} } = options

  try {
    // Use the server-side API URL from environment variables
    const apiUrl = env.GRAPHQL_API_URL

    if (!apiUrl) {
      throw new Error("GRAPHQL_API_URL environment variable is not defined")
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache,
      next: {
        ...(revalidate !== undefined ? { revalidate } : {}),
        ...(tags ? { tags } : {}),
      },
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}`)
    }

    const result = await response.json()

    if (result.errors) {
      console.error("GraphQL errors:", result.errors)
      throw new Error(result.errors[0].message || "GraphQL Error")
    }

    return result.data as T
  } catch (error) {
    console.error("GraphQL server request failed:", error)
    throw error
  }
}

