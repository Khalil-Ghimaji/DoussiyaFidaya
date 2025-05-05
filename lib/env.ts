/**
 * Environment variables with type safety
 */
export const env = {
  // GraphQL API URLs
  GRAPHQL_API_URL: process.env.GRAPHQL_API_URL || "",
  NEXT_PUBLIC_GRAPHQL_API_URL: process.env.NEXT_PUBLIC_GRAPHQL_API_URL || "",

  // Authentication
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",

  // Other environment variables
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET || "",
}

