import { GraphQLClient } from "graphql-request"

// Use environment variable for GraphQL API endpoint
const endpoint = process.env.GRAPHQL_API_URL|| "http://localhost:4000/graphql"

const client = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function fetchGraphQL<T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  try {
    return await client.request<T>(query, variables)
  } catch (error) {
    console.error('GraphQL Error:', error)
    throw error
  }
}

export { client }

// Function to add auth token to requests when available
export const getAuthenticatedClient = (token?: string) => {
  if (!token) return client

  return new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

