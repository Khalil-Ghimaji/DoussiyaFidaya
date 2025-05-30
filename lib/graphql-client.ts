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
    });
    
    return { data: result.data };
  } catch (error) {
    console.error('GraphQL Error:', error);
    throw error;
  }
}
export async function pushGraphQL<T>(
  mutation: string | DocumentNode,
  variables?: Record<string, any>
): Promise<{ data: T }> {
  const client = getApolloServerClient();

  try {
    const parsedMutation = typeof mutation === 'string' ? gql`${mutation}` : mutation;
    const result = await client.mutate<T>({
      mutation: parsedMutation,
      variables,
    });

    return { data: result.data as T };
  } catch (error) {
    console.error('GraphQL Mutation Error:', error);
    throw error;
  }
}