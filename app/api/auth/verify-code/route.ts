import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()
    
    const response = await fetch(
      `${process.env.API_URL}/auth/mailverification/${email}/${code}`,
      {
        method: 'POST',
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Code de vérification incorrect" },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json(
      { success: false, message: "Une erreur s'est produite lors de la vérification" },
      { status: 500 }
    )
  }
} 