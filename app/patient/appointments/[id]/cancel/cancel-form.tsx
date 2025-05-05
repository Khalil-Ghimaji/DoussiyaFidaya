"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { cancelAppointmentAction } from "@/app/patient/actions"

export function CancelAppointmentForm({ appointmentId }: { appointmentId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [reason, setReason] = useState("")
  const [cancelReason, setCancelReason] = useState("schedule_conflict")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      toast({
        title: "Champ requis",
        description: "Veuillez fournir des détails supplémentaires sur l'annulation",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await cancelAppointmentAction({
        appointmentId,
        cancelReason,
        reason,
      })

      if (result.success) {
        toast({
          title: "Rendez-vous annulé",
          description: "Votre rendez-vous a été annulé avec succès",
        })
        router.push("/patient/appointments")
      } else {
        throw new Error(result.error || "Une erreur est survenue lors de l'annulation")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: (error as Error).message || "Une erreur est survenue lors de l'annulation",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Label>Raison de l'annulation</Label>
        <RadioGroup value={cancelReason} onValueChange={setCancelReason}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="schedule_conflict" id="schedule_conflict" />
            <Label htmlFor="schedule_conflict">Conflit d'horaire</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="feeling_better" id="feeling_better" />
            <Label htmlFor="feeling_better">Je me sens mieux</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="transportation" id="transportation" />
            <Label htmlFor="transportation">Problème de transport</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="other" id="other" />
            <Label htmlFor="other">Autre raison</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Détails supplémentaires</Label>
        <Textarea
          id="details"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Veuillez fournir plus de détails sur la raison de l'annulation..."
          rows={4}
          required
        />
      </div>

      <CardFooter className="flex justify-between px-0">
        <Button variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Retour
        </Button>
        <Button variant="destructive" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Annulation en cours..." : "Confirmer l'annulation"}
        </Button>
      </CardFooter>
    </form>
  )
}

