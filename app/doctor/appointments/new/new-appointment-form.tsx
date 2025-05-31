"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { createAppointment } from "@/app/doctor/actions"

type Patient = {
  _id: string
  firstName: string
  lastName: string
  avatar: string
  initials: string
  age: number
  gender: string
  bloodType: string
  lastVisit: string
}

type TimeSlot = {
  time: string
  available: boolean
}

export function NewAppointmentForm({ patients }: { patients: Patient[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [date, setDate] = useState<Date>()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [formData, setFormData] = useState({
    patientId: "",
    time: "",
    duration: "30",
    type: "consultation",
    reason: "",
    notes: "",
  })

  const handleDateChange = async (selectedDate: Date | undefined) => {
    setDate(selectedDate)

    if (selectedDate) {
      setIsLoadingSlots(true)
      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd")

        // Fetch available slots from the server
        const response = await fetch("/api/doctor/available-slots", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ date: formattedDate }),
        })

        if (!response.ok) {
          throw new Error("Failed to fetch available slots")
        }

        const data = await response.json()
        setTimeSlots(data.slots)
      } catch (error) {
        console.error("Error fetching available slots:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les créneaux disponibles",
          variant: "destructive",
        })
        setTimeSlots([])
      } finally {
        setIsLoadingSlots(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date",
        variant: "destructive",
      })
      return
    }

    if (!formData.time) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un horaire",
        variant: "destructive",
      })
      return
    }

    if (!formData.patientId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un patient",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSubmit = new FormData()
      formDataToSubmit.append("patientId", formData.patientId)
      formDataToSubmit.append("date", format(date, "yyyy-MM-dd"))
      formDataToSubmit.append("time", formData.time)
      formDataToSubmit.append("duration", formData.duration)
      formDataToSubmit.append("type", formData.type)
      formDataToSubmit.append("reason", formData.reason)
      formDataToSubmit.append("notes", formData.notes)

      const result = await createAppointment(formDataToSubmit)

      if (result.success) {
        toast({
          title: "Succès",
          description: result.message,
        })
        router.push("/doctor/appointments")
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du rendez-vous",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select
                  value={formData.patientId}
                  onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                  required
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Sélectionnez un patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName} ({patient.age} ans)
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: fr }) : "Sélectionnez une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      initialFocus
                      disabled={(date) =>
                          date < new Date() || date > new Date(new Date().setMonth(new Date().getMonth() + 3))
                      }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horaire</Label>
              <Select
                  value={formData.time}
                  onValueChange={(value) => setFormData({ ...formData, time: value })}
                  disabled={!date || isLoadingSlots}
                  required
              >
                <SelectTrigger id="time">
                  <SelectValue placeholder={isLoadingSlots ? "Chargement..." : "Sélectionnez un horaire"} />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.length > 0 ? (
                      timeSlots.map((slot) => (
                          <SelectItem key={slot.time} value={slot.time} disabled={!slot.available}>
                            {slot.time} {!slot.available && "(Indisponible)"}
                          </SelectItem>
                      ))
                  ) : (
                      <SelectItem value="" disabled>
                        {date ? "Aucun créneau disponible" : "Sélectionnez d'abord une date"}
                      </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Durée (minutes)</Label>
              <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData({ ...formData, duration: value })}
                  required
              >
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Sélectionnez une durée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de rendez-vous</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })} required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="followup">Suivi</SelectItem>
                  <SelectItem value="emergency">Urgence</SelectItem>
                  <SelectItem value="procedure">Procédure médicale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motif du rendez-vous</Label>
            <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Motif du rendez-vous"
                required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes supplémentaires"
                rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
            ) : (
                "Créer le rendez-vous"
            )}
          </Button>
        </div>
      </form>
  )
}

