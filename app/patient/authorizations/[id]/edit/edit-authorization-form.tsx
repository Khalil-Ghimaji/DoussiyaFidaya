"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateDoctorAccessLevelAction, revokeDoctorAccessAction } from "@/app/patient/actions"

export function EditAuthorizationForm({ authDetails }: { authDetails: any }) {
  const router = useRouter()
  const { toast } = useToast()
  const [accessLevel, setAccessLevel] = useState<string>(authDetails.accessLevel)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Format doctor name
  const doctorName = `Dr. ${authDetails.doctor.firstName} ${authDetails.doctor.lastName}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateDoctorAccessLevelAction({
        authorizationId: authDetails._id,
        accessLevel,
      })

      if (result.success) {
        toast({
          title: "Succès",
          description: result.message || "Niveau d'accès mis à jour avec succès",
        })
        router.push("/patient/authorizations")
      } else {
        throw new Error(result.error || "Une erreur est survenue")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevokeAccess = async () => {
    if (confirm("Êtes-vous sûr de vouloir révoquer l'accès de ce médecin ? Cette action ne peut pas être annulée.")) {
      setIsSubmitting(true)

      try {
        const result = await revokeDoctorAccessAction({
          authorizationId: authDetails._id,
        })

        if (result.success) {
          toast({
            title: "Succès",
            description: result.message || "Accès révoqué avec succès",
          })
          router.push("/patient/authorizations")
        } else {
          throw new Error(result.error || "Une erreur est survenue")
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: (error as Error).message,
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informations du médecin</CardTitle>
          <CardDescription>Détails du médecin autorisé</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={authDetails.doctor.avatar} alt={doctorName} />
              <AvatarFallback>{authDetails.doctor.initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{doctorName}</h2>
              <p className="text-muted-foreground">{authDetails.doctor.specialty}</p>
              <p className="text-sm text-muted-foreground">{authDetails.doctor.hospital}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Autorisé depuis le {new Date(authDetails.authorizedSince).toLocaleDateString("fr-FR")}
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Niveau d'accès</CardTitle>
            <CardDescription>Définissez le niveau d'accès du médecin à votre dossier médical</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={accessLevel} onValueChange={setAccessLevel} className="space-y-4">
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="general" id="general" className="mt-1" />
                <div className="grid gap-1.5">
                  <Label htmlFor="general" className="font-medium">
                    Général
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Le médecin aura accès uniquement aux informations de base (nom, âge, groupe sanguin, allergies) et
                    aux antécédents médicaux généraux.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="specialty" id="specialty" className="mt-1" />
                <div className="grid gap-1.5">
                  <Label htmlFor="specialty" className="font-medium">
                    Par spécialité
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Le médecin aura accès aux informations générales et aux données spécifiques à sa spécialité (
                    {authDetails.doctor.specialty}).
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="full" id="full" className="mt-1" />
                <div className="grid gap-1.5">
                  <Label htmlFor="full" className="font-medium">
                    Complet
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Le médecin aura accès à l'intégralité de votre dossier médical, y compris toutes les spécialités,
                    les ordonnances et les résultats d'analyses.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Information importante</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                En modifiant le niveau d'accès, vous changez les informations médicales auxquelles le médecin peut
                accéder. Assurez-vous de choisir un niveau approprié pour votre suivi médical.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="destructive" onClick={handleRevokeAccess} disabled={isSubmitting}>
            Révoquer l'accès
          </Button>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}

