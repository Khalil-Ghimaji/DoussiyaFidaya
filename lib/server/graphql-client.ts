import { env } from "@/lib/env"

type GraphQLResponse<T> = {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{
      line: number
      column: number
    }>
    path?: string[]
    extensions?: Record<string, any>
  }>
}

export async function fetchGraphQL<T = any>(
  query: string,
  variables?: Record<string, any>,
  cache?: RequestCache,
  revalidate?: number,
): Promise<T> {
  try {
    if (!env.GRAPHQL_API_URL) {
      throw new Error("GRAPHQL_API_URL environment variable is not defined")
    }

    const res = await fetch(env.GRAPHQL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache: cache || "default",
      next: revalidate !== undefined ? { revalidate } : undefined,
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`)
    }

    const json = (await res.json()) as GraphQLResponse<T>

    if (json.errors) {
      console.error("GraphQL Errors:", json.errors)
      throw new Error(`GraphQL Error: ${json.errors[0].message}`)
    }

    return json.data as T
  } catch (error) {
    console.error("Error fetching GraphQL data:", error)
    throw error
  }
}

