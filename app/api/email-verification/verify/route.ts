import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { email, code } = await request.json()

    // Log the request details
    console.log('Verifying code:', { email, code })
    console.log('API URL:', process.env.API_URL)
    
    // Make the request to the backend
    const url = `${process.env.API_URL}/auth/mailverification/${email}/${code}`
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
          message: data.message || "Code de vérification incorrect",
          debug: {
            status: response.status,
            data
          }
        },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    const error = err as Error
    console.error("Verification error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Une erreur s'est produite lors de la vérification",
        debug: {
          error: error.message,
          stack: error.stack
        }
      },
      { status: 500 }
    )
  }
} 