"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock } from "lucide-react"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

interface AcceptAppointmentFormProps {
  appointmentId: string
  appointmentDetails: {
    patientName: string
    date: string
    time: string
    reason: string
    type: string
  }
}

export function AcceptAppointmentForm({ appointmentId, appointmentDetails }: AcceptAppointmentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    time: appointmentDetails.time,
    duration: "30",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, you would call your API here
      // const response = await fetch(`/api/appointments/${appointmentId}/accept`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // })

      toast({
        title: "Rendez-vous confirmé",
        description: `Le rendez-vous avec ${appointmentDetails.patientName} a été confirmé.`,
      })

      router.push("/doctor/appointments")
      router.refresh()
    } catch (error) {
      console.error("Error accepting appointment:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la confirmation du rendez-vous.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedDate = format(parseISO(appointmentDetails.date), "dd MMMM yyyy", { locale: fr })

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Confirmer le rendez-vous</CardTitle>
          <CardDescription>Confirmez les détails du rendez-vous avec {appointmentDetails.patientName}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formattedDate}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Heure</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    className="pl-8"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durée (minutes)</Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              min="15"
              step="5"
              value={formData.duration}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes pour le patient (optionnel)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Instructions ou informations supplémentaires..."
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Confirmation..." : "Confirmer le rendez-vous"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

