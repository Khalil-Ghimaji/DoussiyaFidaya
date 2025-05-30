import { GraphQLClient } from "graphql-request"

// Use environment variable for GraphQL API endpoint
const endpoint = process.env.GRAPHQL_API_ENDPOINT || "https://api.medisystem.com/graphql"

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    // Add any default headers here
  },
})

// Function to add auth token to requests when available
export const getAuthenticatedClient = (token?: string) => {
  if (!token) return graphqlClient

  return new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

