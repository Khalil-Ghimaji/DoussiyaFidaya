// lib/graphql-client.ts
import { getApolloServerClient } from '@/lib/apollo-server-client';
import { DocumentNode } from '@apollo/client';
import { gql } from "@apollo/client"

export async function fetchGraphQL<T>(
  query: string | DocumentNode,
  variables?: Record<string, any>
): Promise<{ data: T }> {
  const client = getApolloServerClient();
  
  try {
    const result = await client.query<T>({
      query: typeof query === 'string' ? gql`${query}` : query,
      variables,
      fetchPolicy: 'no-cache',
    });
    
    return { data: result.data };
  } catch (error) {
    console.error('GraphQL Error:', error);
    throw error;
  }
}