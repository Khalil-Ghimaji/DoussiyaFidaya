"use client"

import { useState } from "react"
import { useFormState } from "react-dom"
import { submitContactForm } from "@/actions/contact-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Mail, Phone, MapPin } from "lucide-react"

// This page uses Client-Side Rendering with Server Actions for form submission
export default function ContactPageClient() {
  const [state, formAction] = useFormState(submitContactForm, { success: false, message: "", ticketId: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    await formAction(formData)
    setIsSubmitting(false)
  }

  return (
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-bold mb-4">Contactez-nous</h1>
          <p className="text-muted-foreground mb-8">
            Nous sommes là pour vous aider. Remplissez le formulaire ci-dessous ou utilisez nos coordonnées pour nous
            contacter.
          </p>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <Mail className="h-6 w-6 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">contact@medisystem.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Phone className="h-6 w-6 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Téléphone</h3>
                <p className="text-muted-foreground">+33 1 23 45 67 89</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <MapPin className="h-6 w-6 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Adresse</h3>
                <p className="text-muted-foreground">
                  123 Avenue de la Médecine
                  <br />
                  75001 Paris, France
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formulaire de contact</CardTitle>
            <CardDescription>
              Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.
            </CardDescription>
          </CardHeader>

          <form action={handleSubmit}>
            <CardContent className="space-y-4">
              {state.message && (
                <Alert variant={state.success ? "default" : "destructive"}>
                  {state.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertDescription>
                    {state.message}
                    {state.ticketId && (
                      <span className="block mt-1">
                        Numéro de référence: <strong>{state.ticketId}</strong>
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" name="name" required disabled={state.success} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input id="email" name="email" type="email" required disabled={state.success} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input id="subject" name="subject" required disabled={state.success} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" rows={5} required disabled={state.success} />
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting || state.success}>
                {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

