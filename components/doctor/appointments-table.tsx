import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import { Calendar, Clock, CheckCircle2, XCircle, FileText, ArrowRight } from "lucide-react"

type Appointment = {
  _id: string
  date: string
  time: string
  duration: string
  patient: {
    _id: string
    firstName: string
    lastName: string
    avatar?: string
    initials: string
    age?: number
    gender?: string
  }
  status: string
  type: string
  reason: string
  notes?: string
  createdAt: string
  createdBy?: string
}

interface DoctorAppointmentsTableProps {
  appointments: Appointment[]
  isPending?: boolean
  isPast?: boolean
}

export function DoctorAppointmentsTable({
  appointments,
  isPending = false,
  isPast = false,
}: DoctorAppointmentsTableProps) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-10">
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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Patient</th>
            <th className="text-left py-3 px-4 font-medium">Date & Heure</th>
            <th className="text-left py-3 px-4 font-medium">Type</th>
            <th className="text-left py-3 px-4 font-medium">Statut</th>
            <th className="text-left py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => {
            const formattedDate = format(parseISO(appointment.date), "dd MMMM yyyy", { locale: fr })

            return (
              <tr key={appointment._id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4">
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
                      {appointment.patient.age && appointment.patient.gender && (
                        <p className="text-sm text-muted-foreground">
                          {appointment.patient.age} ans, {appointment.patient.gender}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {appointment.time} ({appointment.duration})
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">{getTypeBadge(appointment.type)}</td>
                <td className="py-3 px-4">{getStatusBadge(appointment.status)}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {isPending ? (
                      <>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/doctor/appointments/requests/${appointment._id}/accept`}>
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Accepter
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          asChild
                        >
                          <Link href={`/doctor/appointments/requests/${appointment._id}/decline`}>
                            <XCircle className="mr-1 h-4 w-4" />
                            Refuser
                          </Link>
                        </Button>
                      </>
                    ) : isPast ? (
                      appointment.status === "completed" ? (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/doctor/appointments/${appointment._id}/consultation`}>
                            <FileText className="mr-1 h-4 w-4" />
                            Voir consultation
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">Aucune action disponible</span>
                      )
                    ) : (
                      <>
                        {appointment.status === "confirmed" && (
                          <Button size="sm" asChild>
                            <Link href={`/doctor/appointments/${appointment._id}/consultation`}>
                              <FileText className="mr-1 h-4 w-4" />
                              Consultation
                            </Link>
                          </Button>
                        )}
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/doctor/appointments/${appointment._id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

