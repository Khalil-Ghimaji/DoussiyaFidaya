// lib/apollo-server-client.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

let apolloClient: ApolloClient<any> | null = null;

function createApolloClient() {
  // Get the base API URL from environment variable
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  return new ApolloClient({
    link: new HttpLink({
      uri: `${apiUrl}/graphql`,  // Properly construct the GraphQL endpoint
    }),
    cache: new InMemoryCache(),
    ssrMode: true,
  });
}

export function getApolloServerClient() {
  // Create the Apollo Client once and reuse it
  if (!apolloClient) {
    apolloClient = createApolloClient();
  }
  return apolloClient;
}