import "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    id?: string
    token?: string
  }

  interface Session {
    user: {
      id?: string
      name?: string
      email?: string
      image?: string
      role?: string
      token?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    id?: string
    token?: string
  }
}

