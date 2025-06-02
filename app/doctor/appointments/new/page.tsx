"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Loader2, ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { fetchGraphQL } from "@/lib/graphql-client"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"

const CREATE_RDV = `
  mutation CreateRdv($data: RdvsCreateInput!) {
    createOneRdvs(data: $data) {
      id
      date
      time
      patients {
        id
      }
      doctors {
        id
      }
    }
  }
`

const GET_PATIENTS = `
  query GetPatients {
    findManyPatients {
      id
      users {
        first_name
        last_name
      }
    }
  }
`

const formSchema = z.object({
  patientId: z.string({
    required_error: "Veuillez sélectionner un patient",
  }),
  date: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  time: z.string({
    required_error: "Veuillez sélectionner une heure",
  }),
})

const availableTimes = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
]

interface Patient {
  id: string
  users: {
    first_name: string
    last_name: string
  }
}

interface GraphQLError {
  message: string
}

interface GraphQLResponse<T> {
  data: T
  errors?: GraphQLError[]
}

interface PatientsResponse {
  findManyPatients: Patient[]
}

interface CreateRdvResponse {
  createOneRdvs: {
    id: string
    date: string
    time: string
    patients: {
      id: string
    }
    doctors: {
      id: string
    }
  }
}

export default function NewAppointmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const doctorId = "3665a171-9626-4ee1-a1dd-086a1e445c2d" // Replace with actual doctor ID from auth

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  // Fetch patients when component mounts
  useEffect(() => {
    fetchGraphQL<PatientsResponse>(GET_PATIENTS)
      .then(response => {
        if (response.data?.findManyPatients) {
          setPatients(response.data.findManyPatients)
        }
      })
      .catch(error => {
        console.error("Error fetching patients:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des patients",
          variant: "destructive",
        })
      })
  }, [toast])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const { data, errors } = await fetchGraphQL<CreateRdvResponse>(CREATE_RDV, {
        data: {
          date: format(values.date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          time: `1970-01-01T${values.time}:00.000Z`,
          patients: {
            connect: {
              id: values.patientId
            }
          },
          doctors: {
            connect: {
              id: doctorId
            }
          }
        }
      }) as GraphQLResponse<CreateRdvResponse>

      if (errors) {
        throw new Error(errors.map((error: GraphQLError) => error.message).join(", "))
      }

      toast({
        title: "Rendez-vous créé",
        description: "Le rendez-vous a été créé avec succès",
      })

      router.push("/doctor/appointments")
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
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/doctor/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux rendez-vous
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouveau rendez-vous</h1>
          <p className="text-muted-foreground">Créez un nouveau rendez-vous pour un patient</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Détails du rendez-vous</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.users.first_name} {patient.users.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: fr })
                            ) : (
                              <span>Choisir une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date.getDay() === 0 || date.getDay() === 6
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une heure" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer le rendez-vous
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}