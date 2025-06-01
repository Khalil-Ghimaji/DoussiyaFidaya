import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { email } = await request.json()

    // Log the request details
    console.log('Resending code for:', { email })
    console.log('API URL:', process.env.API_URL)
    
    // Make the request to the backend
    const url = `${process.env.API_URL}/auth/sendverification/${email}`
    console.log('Full URL:', url)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    // Log the response details
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    // Get the response text first
    const responseText = await response.text()
    console.log('Raw response text:', responseText)

    // Try to parse the response as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (err) {
      const error = err as Error
      console.error('Failed to parse backend response as JSON:', error)
      console.error('Raw response received:', responseText)
      return NextResponse.json(
        { 
          success: false, 
          message: "Le serveur a retourné une réponse invalide",
          debug: {
            url,
            responseText,
            error: error.message
          }
        },
        { status: 500 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          message: data.message || "Erreur lors de l'envoi du code",
          debug: {
            status: response.status,
            data
          }
        },
        { status: response.status }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Un nouveau code a été envoyé à votre adresse e-mail" 
    })
  } catch (err) {
    const error = err as Error
    console.error("Resend code error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Une erreur s'est produite lors de l'envoi du code",
        debug: {
          error: error.message,
          stack: error.stack
        }
      },
      { status: 500 }
    )
  }
} 