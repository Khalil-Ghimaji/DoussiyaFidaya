"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"
import { fetchGraphQL } from "@/lib/graphql-client"
import { useRouter } from "next/navigation"

interface GraphQLError {
  message: string
  locations?: { line: number; column: number }[]
  path?: string[]
}

interface GraphQLResponse<T> {
  data: T
  errors?: GraphQLError[]
}

const UPDATE_RDV_REQUEST = `
  mutation UpdateRdvRequest($set: String!, $where: Rdv_requestsWhereUniqueInput!) {
    updateOneRdv_requests(
      data: { Status: { set: $set } }
      where: $where
    ) {
      Status
      Motif
      date
      doctor_id
      id
      patients {
        id
      }
      rdv_id
      time
    }
  }
`

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

interface RdvRequestUpdateInput {
  set: string
  where: {
    id: string
  }
}

interface RdvCreateInput {
  date: string
  time: string
  patients: {
    connect: {
      id: string
    }
  }
  doctors: {
    connect: {
      id: string
    }
  }
}

interface AcceptAppointmentFormProps {
  appointment: {
    id: string
    date: string
    time: string
    duration: string
    patient: {
      id: string
      firstName: string
      lastName: string
    }
    doctor: {
      id: string
    }
    reason: string
  }
}

export function AcceptAppointmentForm({ appointment }: AcceptAppointmentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(appointment.date))

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      console.log("Time format:", {
        originalTime: appointment.time,
        date: `${format(selectedDate, "yyyy-MM-dd")}T00:00:00.000Z`
      })

      // Create new appointment
      const { data: rdvData, errors: createErrors } = await fetchGraphQL<{ createOneRdvs: { id: string } }>(
        CREATE_RDV,
        {
          data: {
            date: `${format(selectedDate, "yyyy-MM-dd")}T00:00:00.000Z`,
            time: `1970-01-01T${appointment.time}.000Z`,
            patients: {
              connect: {
                id: appointment.patient.id
              }
            },
            doctors: {
              connect: {
                id: appointment.doctor.id
              }
            }
          } as RdvCreateInput
        }
      ) as GraphQLResponse<{ createOneRdvs: { id: string } }>

      if (createErrors) {
        console.error("Create RDV Errors:", createErrors)
        throw new Error(createErrors.map((e: GraphQLError) => e.message).join(", "))
      }

      console.log("RDV created successfully:", rdvData)

      // Update request status to completed
      const { errors: updateErrors } = await fetchGraphQL(
        UPDATE_RDV_REQUEST,
        {
          set: "completed",
          where: {
            id: appointment.id
          }
        } as RdvRequestUpdateInput
      ) as GraphQLResponse<unknown>

      if (updateErrors) {
        console.error("Update Status Errors:", updateErrors)
        throw new Error(updateErrors.map((e: GraphQLError) => e.message).join(", "))
      }

      router.push("/doctor/appointments?status=upcoming")
    } catch (error) {
      console.error("Full error object:", error)
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmer le rendez-vous</CardTitle>
        <CardDescription>
          Confirmez le rendez-vous avec {appointment.patient.firstName} {appointment.patient.lastName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="space-y-2">
          <Label>Date du rendez-vous</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "dd MMMM yyyy", { locale: fr })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Heure</Label>
          <div className="text-sm">{appointment.time}</div>
        </div>

        <div className="space-y-2">
          <Label>Motif</Label>
          <div className="text-sm">{appointment.reason}</div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmer le rendez-vous
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 