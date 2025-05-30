"use client"

import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink } from "@apollo/client"
import type { ReactNode } from "react"

interface ApolloProviderWrapperProps {
  children: ReactNode
}

export function ApolloProviderWrapper({ children }: ApolloProviderWrapperProps) {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "http://localhost:4000/graphql",
    }),
    defaultOptions: {
      query: {
        fetchPolicy: "cache-and-network",
      },
    },
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

