import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })
  console.log("Logging out user")
  const cookieStore = await cookies()
  cookieStore.getAll().forEach(cookie => {
    response.cookies.delete(cookie.name)
  })
  return response
} 