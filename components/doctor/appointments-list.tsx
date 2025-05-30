import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"

type Appointment = {
  _id: string
  time: string
  duration?: string
  date?: string
  patient: {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
    initials: string
  }
  status: string
  type: string
  reason: string
}

interface DoctorAppointmentsListProps {
  appointments: Appointment[]
  isPending?: boolean
}

export function DoctorAppointmentsList({ appointments, isPending = false }: DoctorAppointmentsListProps) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Aucun rendez-vous à afficher</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Confirmé
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            En attente
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Annulé
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Terminé
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "consultation":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Consultation
          </Badge>
        )
      case "follow-up":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Suivi
          </Badge>
        )
      case "emergency":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Urgence
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <div
          key={appointment._id}
          className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              {appointment.patient.avatar && (
                <AvatarImage
                  src={appointment.patient.avatar}
                  alt={`${appointment.patient.firstName} ${appointment.patient.lastName}`}
                />
              )}
              <AvatarFallback>{appointment.patient.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{`${appointment.patient.firstName} ${appointment.patient.lastName}`}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {getTypeBadge(appointment.type)}
                {getStatusBadge(appointment.status)}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-4 md:mt-0">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.time}</span>
                {appointment.duration && <span>({appointment.duration})</span>}
              </div>
              {appointment.date && (
                <div className="flex items-center gap-1 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.date}</span>
                </div>
              )}
            </div>

            <Button size="sm" variant="outline" asChild>
              {isPending ? (
                <Link href={`/doctor/appointments/requests/${appointment._id}`}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link href={`/doctor/appointments/${appointment._id}`}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

