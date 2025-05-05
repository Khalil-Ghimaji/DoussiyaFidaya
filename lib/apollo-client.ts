import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc"

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: process.env.GRAPHQL_API_URL || "http://localhost:4000/graphql",
      // Use fetch with custom options if needed
      fetchOptions: {
        cache: "no-store",
      },
    }),
    defaultOptions: {
      query: {
        fetchPolicy: "network-only",
      },
      mutate: {
        fetchPolicy: "network-only",
      },
    },
  })
})

