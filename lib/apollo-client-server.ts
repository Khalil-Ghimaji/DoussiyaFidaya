import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client"
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc"
import { headers } from "next/headers"

export const { getClient } = registerApolloClient(() => {
  const apiUrl = process.env.GRAPHQL_API_URL

  if (!apiUrl) {
    throw new Error("GRAPHQL_API_URL environment variable is not defined")
  }

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: apiUrl,
      headers: {
        ...Object.fromEntries(headers()),
        "Content-Type": "application/json",
      },
    }),
  })
})

