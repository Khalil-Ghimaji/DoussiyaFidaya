"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { loginUser } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const defaultRole = searchParams.get("role")
  
  const [error, setError] = useState<string>(message || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>(defaultRole || "")

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true)
      setError("")
      
      formData.set("role", selectedRole)
      
      const result = await loginUser(null, formData)
      
      if (result?.success && result?.redirect) {
        router.push(result.redirect)
      } else {
        setError(result?.message || "An error occurred during login")
      }
    } catch (err) {
      setError("An error occurred during login")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container flex items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Se connecter</CardTitle>
          <CardDescription>Entrez vos identifiants pour accéder à votre compte</CardDescription>
        </CardHeader>

        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Type de compte</Label>
              <Select
                name="role"
                value={selectedRole}
                onValueChange={setSelectedRole}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre type de compte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Médecin</SelectItem>
                  <SelectItem value="laboratory">Laboratoire</SelectItem>
                  <SelectItem value="pharmacy">Pharmacie</SelectItem>
                  <SelectItem value="assistant">Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="nom@exemple.com" 
                required 
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                disabled={isSubmitting}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting || !selectedRole}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>

            <div className="flex flex-col space-y-2 text-center text-sm">
              <Link href="/auth/forgot-password" className="text-primary hover:underline">
                Mot de passe oublié?
              </Link>
              <div>
                Vous n'avez pas de compte?{" "}
                <Link href="/auth/register" className="text-primary hover:underline">
                  S'inscrire
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 