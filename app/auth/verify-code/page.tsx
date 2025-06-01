"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function VerifyCodePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("Email vérifié avec succès!")
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        setStatus("error")
        setMessage(data.message || "Code de vérification incorrect")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Une erreur s'est produite lors de la vérification")
    }
  }

  const handleResendCode = async () => {
    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Un nouveau code a été envoyé à votre adresse e-mail")
      } else {
        setMessage(data.message || "Erreur lors de l'envoi du code")
      }
    } catch (error) {
      setMessage("Erreur lors de l'envoi du code")
    }
  }

  if (!email) {
    router.push("/auth/login")
    return null
  }

  return (
    <div className="container flex items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Vérification de l'email</CardTitle>
          <CardDescription>
            Veuillez entrer le code de vérification envoyé à {email}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <Alert variant={status === "success" ? "default" : "destructive"} className={status === "success" ? "bg-green-50" : ""}>
              {status === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className={status === "success" ? "text-green-600" : ""}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code de vérification</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Entrez le code à 6 chiffres"
                required
                maxLength={6}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={status === "loading" || code.length !== 6}
            >
              {status === "loading" ? "Vérification..." : "Vérifier"}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={handleResendCode}
                className="text-primary hover:underline"
              >
                Renvoyer le code
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 