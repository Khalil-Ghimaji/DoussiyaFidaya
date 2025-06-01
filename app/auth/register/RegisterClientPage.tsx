"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { registerPatient, registerDoctor } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Enums for registration
enum Role {
  Doctor = "Doctor",
  Patient = "Patient"
}

enum doctors_type_enum {
  doctor = "doctor",
  clinique = "clinique",
  hopital = "hopital"
}

enum doctors_specialty_enum {
  generaliste = "generaliste",
  cardiologue = "cardiologue",
  dermatologue = "dermatologue",
  gynecologue = "gynecologue",
  pediatre = "pediatre",
  orthopediste = "orthopediste",
  psychiatre = "psychiatre",
  ophtalmologue = "ophtalmologue",
  otorhinolaryngologue = "otorhinolaryngologue",
  neurologue = "neurologue",
  urologue = "urologue",
  endocrinologue = "endocrinologue",
  gastroenterologue = "gastroenterologue",
  rheumatologue = "rheumatologue",
  anesthesiste = "anesthesiste",
  radiologue = "radiologue",
  oncologue = "oncologue",
  chirurgien = "chirurgien",
  nutritionniste = "nutritionniste",
  physiotherapeute = "physiotherapeute",
  psychologue = "psychologue",
  sexologue = "sexologue",
  geriatre = "geriatre",
  allergologue = "allergologue",
  hematologue = "hematologue",
  nephrologue = "nephrologue",
  pneumologue = "pneumologue",
  dentiste = "dentiste",
  orthodontiste = "orthodontiste",
  autre = "autre"
}

enum patients_gender_enum {
  Male = "Male",
  Female = "Female"
}

type ActionState = {
  success: boolean
  message: string
  email?: string | null
}

export default function RegisterClientPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<Role>(Role.Patient)
  const [error, setError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true)
      setError("")
      
      formData.set("role", selectedRole)
      const result = await (selectedRole === Role.Patient ? registerPatient : registerDoctor)(null, formData)
      
      if (result.success && result.email) {
        router.push(`/auth/verify-code?email=${encodeURIComponent(result.email)}`)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("An error occurred during registration")
    } finally {
      setIsSubmitting(false)
    }
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
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Type de compte</Label>
              <RadioGroup 
                defaultValue={Role.Patient}
                className="flex flex-col space-y-1"
                value={selectedRole}
                onValueChange={(value: string) => setSelectedRole(value as Role)}
                disabled={isSubmitting}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Role.Patient} id="patient" />
                  <Label htmlFor="patient" className="font-normal">
                    Patient
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={Role.Doctor} id="doctor" />
                  <Label htmlFor="doctor" className="font-normal">
                    Médecin
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" name="firstName" required disabled={isSubmitting} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" name="lastName" required disabled={isSubmitting} />
              </div>
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
              <p className="text-xs text-muted-foreground">
                Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" type="tel" disabled={isSubmitting} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" name="address" disabled={isSubmitting} />
            </div>

            {/* Patient-specific fields */}
            {selectedRole === Role.Patient && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cin">CIN</Label>
                  <Input 
                    id="cin" 
                    name="cin" 
                    type="number" 
                    min="10000000" 
                    max="99999999" 
                    required 
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date de naissance</Label>
                  <Input 
                    id="date_of_birth" 
                    name="date_of_birth" 
                    type="date" 
                    required 
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Genre</Label>
                  <Select name="gender" required disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={patients_gender_enum.Male}>Homme</SelectItem>
                      <SelectItem value={patients_gender_enum.Female}>Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Doctor-specific fields */}
            {selectedRole === Role.Doctor && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select name="type" required disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(doctors_type_enum).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Spécialité</Label>
                  <Select name="specialty" required disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre spécialité" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(doctors_specialty_enum).map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "Créer un compte"
              )}
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

