# GraphQL API Migration

This document outlines the migration from Sanity and mock data to a GraphQL API in the medical system application.

## Overview

The application has been refactored to use a GraphQL API instead of Sanity and mock data. This provides several benefits:

- Consistent data fetching pattern across the application
- Improved type safety with GraphQL schema
- Better performance with optimized queries
- Easier to maintain and extend

## Architecture

The GraphQL implementation consists of:

1. **GraphQL Client**: Apollo Client for client-side queries and mutations
2. **Server-side GraphQL Executor**: A utility function for server-side queries and mutations
3. **GraphQL Queries and Mutations**: Organized in separate files for better maintainability
4. **Environment Variables**: Configuration for GraphQL API endpoints

## Key Files

- `lib/graphql-client.ts`: Apollo Client setup and server-side executor
- `lib/graphql/queries.ts`: GraphQL query definitions
- `lib/graphql/mutations.ts`: GraphQL mutation definitions
- `lib/env.ts`: Environment variables configuration
- `actions/*.ts`: Server actions using GraphQL

## Environment Variables

The following environment variables need to be set:

