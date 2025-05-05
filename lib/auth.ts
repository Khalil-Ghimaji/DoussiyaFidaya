import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { client } from "./sanity"

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        role: { label: "Rôle", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.role) {
          return null
        }

        try {
          // For testing purposes, allow a test user
          if (credentials.email === "test@example.com" && credentials.password === "password") {
            return {
              id: "test-user-id",
              name: "Test User",
              email: "test@example.com",
              role: credentials.role,
            }
          }

          // Real authentication with Sanity
          const client = getClient()
          const { data } = await client.query({
            query: gql`
              query GetUser($email: String!, $role: String!) {
                user(email: $email, role: $role) {
                  _id
                  firstName
                  lastName
                  email
                  role
                }
              }
            `,
            variables: {
              email: credentials.email,
              role: credentials.role,
            },
          })

          const users = data.user

          if (users) {
            // In a real app, you would verify the password here
            return {
              id: users._id,
              name: `${users.firstName} ${users.lastName}`,
              email: users.email,
              role: users.role,
              image: null,
            }
          }

          return null
        } catch (error) {
          console.error("Erreur d'authentification:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

export const { handlers, auth } = NextAuth(authConfig)

