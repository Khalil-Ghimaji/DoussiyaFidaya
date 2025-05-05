"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Loader2, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { createAppointment } from "@/app/doctor/actions"
import { executeGraphQLServer } from "@/lib/graphql-server"

// Heures disponibles
const availableTimes = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
]

// Type for the doctor data
type Doctor = {
  _id: string
  firstName: string
  lastName: string
  specialty: string
}

export default async function NewAppointmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  // const { createAppointmentRequest, result } = usePatientAppointmentActions() // Removed usePatientAppointmentActions
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [doctorId, setDoctorId] = useState("")
  const [date, setDate] = useState<Date>()
  const [timeStart, setTimeStart] = useState("")
  const [timeEnd, setTimeEnd] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch doctors using server component
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true)
      try {
        const response = await executeGraphQLServer(
          `query GetAvailableDoctors {
            doctors {
              _id
              firstName
              lastName
              specialty
            }
          }`,
          {},
        )
        setDoctors(response.doctors || [])
      } catch (error) {
        console.error("Error fetching doctors:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des médecins.",
          variant: "destructive",
        })
      } finally {
        setLoadingDoctors(false)
      }
    }
    fetchDoctors()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!doctorId || !date || !timeStart || !timeEnd || !reason) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      })
      return
    }

    // Vérifier que l'heure de fin est après l'heure de début
    if (timeStart >= timeEnd) {
      toast({
        title: "Erreur",
        description: "L'heure de fin doit être après l'heure de début",
        variant: "destructive",
      })
      return
    }

    const appointmentData = {
      doctorId,
      preferredDate: format(date, "yyyy-MM-dd"),
      preferredTimeStart: timeStart,
      preferredTimeEnd: timeEnd,
      reason,
    }

    try {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append("patientId", "currentPatientId") // Replace with actual patient ID
      formData.append("doctorId", appointmentData.doctorId)
      formData.append("date", appointmentData.preferredDate)
      formData.append("time", appointmentData.preferredTimeStart)
      formData.append("duration", "30") // You will need to determine how to calculate this from the time
      formData.append("type", "consultation")
      formData.append("reason", appointmentData.reason)

      const result = await createAppointment(formData)

      if (result.success) {
        toast({
          title: "Succès",
          description: "Demande de rendez-vous créée avec succès",
        })
        router.push("/patient/appointments")
      } else {
        throw new Error(result.message || "Erreur lors de la création du rendez-vous.")
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

  if (loadingDoctors) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Demande de rendez-vous</h1>

        <Card>
          <CardHeader>
            <CardTitle>Nouvelle demande</CardTitle>
            <CardDescription>
              Remplissez le formulaire ci-dessous pour demander un rendez-vous avec un médecin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="doctor">Médecin</Label>
                <Select value={doctorId} onValueChange={setDoctorId} required>
                  <SelectTrigger id="doctor">
                    <SelectValue placeholder="Sélectionnez un médecin" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        {`${doctor.firstName} ${doctor.lastName}`} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date souhaitée</Label>
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
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0 || date.getDay() === 6
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heure de début souhaitée</Label>
                  <Select value={timeStart} onValueChange={setTimeStart} disabled={!date} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Heure de début" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time} disabled={timeEnd && time >= timeEnd}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Heure de fin souhaitée</Label>
                  <Select value={timeEnd} onValueChange={setTimeEnd} disabled={!date || !timeStart} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Heure de fin" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time} disabled={time <= timeStart}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Motif du rendez-vous</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Décrivez brièvement la raison de votre consultation"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Créer le rendez-vous
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Votre demande sera examinée par le médecin ou son assistant qui vous proposera un rendez-vous.
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

