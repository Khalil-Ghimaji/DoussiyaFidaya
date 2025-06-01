import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { email: string; token: string } }
) {
  try {
    const { email, token } = params
    
    // Make API call to your backend
    const response = await fetch(
      `${process.env.API_URL}/auth/mailverification/${email}/${token}`,
      {
        method: 'GET',
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Email verification failed" },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during email verification" },
      { status: 500 }
    )
  }
} 