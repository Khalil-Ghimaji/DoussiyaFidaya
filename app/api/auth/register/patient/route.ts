import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Make API call to your backend
    const response = await fetch(`${process.env.API_URL}/auth/registerPatient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Patient registration failed" },
        { status: response.status }
      )
    }

    // Send verification email
    await fetch(`${process.env.API_URL}/auth/sendverification/${body.email}`, {
      method: 'POST',
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Patient registration error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during patient registration" },
      { status: 500 }
    )
  }
} 