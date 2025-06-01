"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginUser } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// This page uses Client-Side Rendering with Server Actions for form submission
export default function LoginPageClient({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; reset?: string }
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const callbackUrl = searchParams.callbackUrl || "/dashboard"
  const showResetSuccess = searchParams.reset === "success"

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true)
      setError("")
      
      const result = await loginUser(null, formData)
      
      if (!result.success) {
        setError(result.message || "An error occurred during login")
      } else if (result.redirect) {
        router.push(result.redirect)
      }
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container flex items-center justify-center py-20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>Entrez vos identifiants pour accéder à votre compte</CardDescription>
        </CardHeader>

        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {showResetSuccess && (
              <Alert>
                <AlertDescription>
                  Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre
                  nouveau mot de passe.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input id="email" name="email" type="email" placeholder="nom@exemple.com" required />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Mot de passe oublié?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required />
            </div>

            <div className="space-y-2">
              <Label>Type de compte</Label>
              <RadioGroup defaultValue="PATIENT" name="role" className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PATIENT" id="login-patient" />
                  <Label htmlFor="login-patient" className="font-normal">
                    Patient
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DOCTOR" id="login-doctor" />
                  <Label htmlFor="login-doctor" className="font-normal">
                    Médecin
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="LABORATORY" id="login-laboratory" />
                  <Label htmlFor="login-laboratory" className="font-normal">
                    Laboratoire
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PHARMACY" id="login-pharmacy" />
                  <Label htmlFor="login-pharmacy" className="font-normal">
                    Pharmacie
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ASSISTANT" id="login-assistant" />
                  <Label htmlFor="login-assistant" className="font-normal">
                    Assistant(e)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="rememberMe" name="rememberMe" />
              <Label htmlFor="rememberMe" className="text-sm font-normal">
                Se souvenir de moi
              </Label>
            </div>

            <input type="hidden" name="callbackUrl" value={callbackUrl} />
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Connexion en cours..." : "Se connecter"}
            </Button>

            <div className="text-center text-sm">
              Vous n&apos;avez pas de compte?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Créer un compte
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

