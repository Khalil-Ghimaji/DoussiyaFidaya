"use client"

import { useState } from "react"
import Link from "next/link"
import { useFormState } from "react-dom"
import { forgotPassword } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

// This page uses Client-Side Rendering with Server Actions for form submission
export default function ForgotPasswordClientPage() {
  const [state, formAction] = useFormState(forgotPassword, { success: false, message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    await formAction(formData)
    setIsSubmitting(false)
  }

  return (
    <div className="container flex items-center justify-center py-20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </CardDescription>
        </CardHeader>

        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {state.message && (
              <Alert variant={state.success ? "default" : "destructive"}>
                {state.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input id="email" name="email" type="email" placeholder="nom@exemple.com" required />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting || state.success}>
              {isSubmitting ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
            </Button>

            <div className="text-center text-sm">
              <Link href="/auth/login" className="text-primary hover:underline">
                Retour à la connexion
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

