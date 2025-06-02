"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"

type Appointment = {
  _id: string
  date: string
  time: string
  status: string
  patient: {
    _id: string
    firstName: string
    lastName: string
    profileImage: string
  }
}

type UpcomingAppointmentsProps = {
  appointments: Appointment[]
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  const [displayCount, setDisplayCount] = useState(3)

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`)
    const dateB = new Date(`${b.date}T${b.time}`)
    return dateA.getTime() - dateB.getTime()
  })

  const upcomingAppointments = sortedAppointments.filter(
    (appointment) => appointment.status !== "cancelled" && appointment.status !== "completed",
  )

  const displayedAppointments = upcomingAppointments.slice(0, displayCount)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmé</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            En attente
          </Badge>
        )
      case "rescheduled":
        return <Badge className="bg-blue-500">Reprogrammé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatAppointmentDate = (dateStr: string, timeStr: string) => {
    // Ensure the date and time are properly formatted
    const [year, month, day] = dateStr.split('-');
    const [hours, minutes] = timeStr.split(':');
    
    // Create a date object with proper UTC handling
    const date = new Date();
    date.setUTCFullYear(parseInt(year, 10));
    date.setUTCMonth(parseInt(month, 10) - 1); // months are 0-indexed
    date.setUTCDate(parseInt(day, 10));
    date.setUTCHours(parseInt(hours, 10));
    date.setUTCMinutes(parseInt(minutes, 10));
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);

    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
}

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Rendez-vous à venir</CardTitle>
        <CardDescription>Vos prochains rendez-vous avec les patients</CardDescription>
      </CardHeader>
      <CardContent>
        {displayedAppointments.length > 0 ? (
          <div className="space-y-4">
            {displayedAppointments.map((appointment) => (
              <div key={appointment._id} className="flex items-start space-x-4 rounded-md border p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={appointment.patient.profileImage || "/placeholder.svg?height=40&width=40"}
                    alt={`${appointment.patient.firstName} ${appointment.patient.lastName}`}
                  />
                  <AvatarFallback>
                    {appointment.patient.firstName[0]}
                    {appointment.patient.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </p>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span className="mr-2">{appointment.date}</span>
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{appointment.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatAppointmentDate(appointment.date, appointment.time)}
                  </p>
                </div>
              </div>
            ))}

            {upcomingAppointments.length > displayCount && (
              <Button variant="ghost" className="w-full" onClick={() => setDisplayCount((prev) => prev + 3)}>
                Voir plus
              </Button>
            )}

            <Button asChild className="w-full mt-2">
              <Link href="/doctor/appointments">Tous les rendez-vous</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Aucun rendez-vous à venir</p>
            <Button asChild className="mt-4">
              <Link href="/doctor/appointments/new">Créer un rendez-vous</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}