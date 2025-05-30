// lib/apollo-server-client.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

let apolloClient: ApolloClient<any> | null = null;

function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: 'http://192.168.43.246:4000/graphql',
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