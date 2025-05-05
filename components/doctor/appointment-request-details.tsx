import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar, Clock, User, Phone, Mail, FileText } from "lucide-react"

interface AppointmentRequestDetailsProps {
  appointment: {
    _id: string
    date: string
    time: string
    type: string
    reason: string
    status: string
    createdAt: string
    patient: {
      _id: string
      firstName: string
      lastName: string
      avatar?: string
      initials: string
      email: string
      phone: string
      dateOfBirth?: string
      gender?: string
      address?: string
    }
  }
}

export function AppointmentRequestDetails({ appointment }: AppointmentRequestDetailsProps) {
  const formattedDate = format(parseISO(appointment.date), "dd MMMM yyyy", { locale: fr })
  const formattedCreatedAt = format(parseISO(appointment.createdAt), "dd MMMM yyyy à HH:mm", { locale: fr })

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
    <Card>
      <CardHeader>
        <CardTitle>Détails de la demande</CardTitle>
        <CardDescription>Demande créée le {formattedCreatedAt}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            {appointment.patient.avatar && (
              <AvatarImage
                src={appointment.patient.avatar}
                alt={`${appointment.patient.firstName} ${appointment.patient.lastName}`}
              />
            )}
            <AvatarFallback className="text-lg">{appointment.patient.initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">
              {appointment.patient.firstName} {appointment.patient.lastName}
            </h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.patient.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.patient.phone}</span>
              </div>
              {appointment.patient.dateOfBirth && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(parseISO(appointment.patient.dateOfBirth), "dd/MM/yyyy")}
                    {appointment.patient.gender && ` • ${appointment.patient.gender}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-4">
            <h4 className="font-medium">Informations du rendez-vous</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Date: {formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Heure demandée: {appointment.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Type: {getTypeBadge(appointment.type)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Motif de la demande</h4>
            <div className="p-3 bg-muted/50 rounded-md">
              <p>{appointment.reason}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

