import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc"

export function getClient() {
  const { getClient } = registerApolloClient(() => {
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: process.env.GRAPHQL_API_URL || "http://localhost:4000/graphql",
        // Additional options like headers can be added here
      }),
      defaultOptions: {
        query: {
          fetchPolicy: "no-cache",
          errorPolicy: "all",
        },
      },
    })
  })

  return getClient()
}

