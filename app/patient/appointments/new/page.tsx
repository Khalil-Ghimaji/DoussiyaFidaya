"use client"

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
import { gql } from '@apollo/client'
import { fetchGraphQL } from "@/lib/graphql-client"
import { auth } from "@/lib/auth"

const CREATE_RDV = gql`
  mutation CreateRdv($Motif: String!, $Status: String!, $date: DateTimeISO!, $time: DateTimeISO!, $id: String!, $id1: String!) {
    createOneRdv_requests(
      data: {
        date: $date,
        time: $time,
        Motif: $Motif,
        Status: $Status,
        patients: { connect: { id: $id1 } },
        doctors: { connect: { id: $id } }
      }
    ) {
      Motif
      Status
      date
      doctor_id
      id
      patient_id
      rdv_id
      time
    }
  }
`

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

interface Doctor {
  id: string
  first_name: string
  last_name: string
  specialty: string
}

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

interface CreateRdvResponse {
  createOneRdv_requests: {
    Motif: string
    Status: string
    date: string
    doctor_id: string
    id: string
    patient_id: string
    rdv_id: string | null
    time: string
  }
}

export default function NewAppointmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [doctorId, setDoctorId] = useState("")
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch doctors using GraphQL
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true)
      try {
        const { data } = await fetchGraphQL<{ findManyDoctors: Doctor[] }>(
          `query MyQuery {
            findManyDoctors {
              id
              first_name
              last_name
              specialty
            }
           }`,
          {},
        )
        setDoctors(data.findManyDoctors || [])
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

    if (!doctorId || !date || !time || !reason) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      // Temporarily commented out auth check
      // const session = await auth()
      // if (!session?.user?.id) {
      //   throw new Error("Vous devez être connecté pour prendre un rendez-vous")
      // }

      // Using a test patient ID for now
      const testPatientId = "5b167751-34a2-469a-badf-f57cda19cf55"

      const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
      const formattedTime = `1970-01-01T${time}:00.000+00:00`

      const response = await fetchGraphQL<CreateRdvResponse>(CREATE_RDV, {
        Motif: reason,
        Status: "pending",
        date: formattedDate,
        time: formattedTime,
        id: doctorId,
        id1: testPatientId,
      })

      if (!response?.data?.createOneRdv_requests) {
        throw new Error("Erreur lors de la création du rendez-vous")
      }

      toast({
        title: "Succès",
        description: "Demande de rendez-vous créée avec succès",
      })
      router.push("/patient/appointments")
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
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
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {`${doctor.first_name} ${doctor.last_name}`} - {doctor.specialty}
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

              <div className="space-y-2">
                <Label>Heure souhaitée</Label>
                <Select value={time} onValueChange={setTime} disabled={!date} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

