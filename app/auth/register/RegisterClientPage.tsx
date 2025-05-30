"use client"

import { useState } from "react"
import Link from "next/link"
import { useFormState } from "react-dom"
import { registerUser } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// This page uses Client-Side Rendering with Server Actions for form submission
export default function RegisterClientPage() {
  const [state, formAction] = useFormState(registerUser, { success: false, message: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    await formAction(formData)
    setIsSubmitting(false)
  }

  return (
    <div className="container flex items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>Remplissez le formulaire ci-dessous pour créer votre compte MediSystem</CardDescription>
        </CardHeader>

        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {state.message && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" name="firstName" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" name="lastName" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input id="email" name="email" type="email" placeholder="nom@exemple.com" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" required />
              <p className="text-xs text-muted-foreground">
                Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Type de compte</Label>
              <RadioGroup defaultValue="PATIENT" name="role" className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PATIENT" id="patient" />
                  <Label htmlFor="patient" className="font-normal">
                    Patient
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DOCTOR" id="doctor" />
                  <Label htmlFor="doctor" className="font-normal">
                    Médecin
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="LABORATORY" id="laboratory" />
                  <Label htmlFor="laboratory" className="font-normal">
                    Laboratoire
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PHARMACY" id="pharmacy" />
                  <Label htmlFor="pharmacy" className="font-normal">
                    Pharmacie
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ASSISTANT" id="assistant" />
                  <Label htmlFor="assistant" className="font-normal">
                    Assistant(e)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
            </Button>

            <div className="text-center text-sm">
              Vous avez déjà un compte?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

