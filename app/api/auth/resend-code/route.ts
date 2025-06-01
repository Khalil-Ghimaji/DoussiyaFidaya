import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    const response = await fetch(
      `${process.env.API_URL}/auth/sendverification/${email}`,
      {
        method: 'POST',
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || "Erreur lors de l'envoi du code" },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Resend code error:", error)
    return NextResponse.json(
      { success: false, message: "Une erreur s'est produite lors de l'envoi du code" },
      { status: 500 }
    )
  }
} 