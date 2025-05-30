"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { revokeEmergencyAccessAction, submitEmergencyAccessComplaintAction } from "@/app/patient/actions"

export function EmergencyAccessActions({ accessId }: { accessId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRevoke = async () => {
    if (confirm("Êtes-vous sûr de vouloir révoquer cet accès d'urgence ?")) {
      setIsSubmitting(true)

      try {
        const result = await revokeEmergencyAccessAction({ accessId })

        if (result.success) {
          toast({
            title: "Succès",
            description: result.message || "L'accès d'urgence a été révoqué avec succès",
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

  const handleComplaint = async () => {
    const reason = prompt("Veuillez indiquer la raison de votre signalement:")

    if (reason) {
      setIsSubmitting(true)

      try {
        const result = await submitEmergencyAccessComplaintAction({
          accessId,
          reason,
        })

        if (result.success) {
          toast({
            title: "Succès",
            description: result.message || "Votre signalement a été soumis avec succès",
          })
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
    <div className="flex flex-wrap gap-4 justify-end">
      <Button variant="outline" onClick={handleComplaint} disabled={isSubmitting}>
        Signaler un problème
      </Button>
      <Button variant="destructive" onClick={handleRevoke} disabled={isSubmitting}>
        Révoquer l'accès
      </Button>
    </div>
  )
}

