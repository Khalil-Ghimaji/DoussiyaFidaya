"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, CheckCircle, XCircle, CalendarIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { getPatientAppointments, updateAppointmentStatus } from "@/actions/appointments"
import { useSession } from "next-auth/react"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function PatientAppointments() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchAppointments() {
      if (session?.user?.id) {
        setLoading(true)
        const result = await getPatientAppointments(session.user.id)
        if (result.success) {
          setAppointments(result.data)
        } else {
          toast({
            title: "Erreur",
            description: result.message,
            variant: "destructive",
          })
        }
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [session, toast])

  const handleCancelAppointment = async (appointmentId: string) => {
    const result = await updateAppointmentStatus(appointmentId, "cancelled", "Annulé par le patient")
    if (result.success) {
      setAppointments(
        appointments.map((app: any) => (app._id === appointmentId ? { ...app, status: "cancelled" } : app)),
      )
      toast({
        title: "Succès",
        description: "Rendez-vous annulé avec succès",
      })
      setDetailsOpen(false)
    } else {
      toast({
        title: "Erreur",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "dd MMMM yyyy", { locale: fr })
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Confirmé
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> En attente
          </Badge>
        )
      case "proposed":
        return (
          <Badge variant="info" className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" /> Proposition
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Refusé
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Annulé
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Terminé
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const appointmentsForSelectedDate = date
    ? appointments.filter((app: any) => {
        const appDate = app.confirmedDate
          ? parseISO(app.confirmedDate).toDateString()
          : parseISO(app.preferredDate).toDateString()
        return appDate === date.toDateString()
      })
    : []

  const viewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setDetailsOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Mes rendez-vous</CardTitle>
            <div className="flex justify-between items-center">
              <CardDescription>Consultez et gérez vos demandes de rendez-vous</CardDescription>
              <Button size="sm" asChild>
                <Link href="/patient/appointments/new">Nouveau rendez-vous</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Chargement des rendez-vous...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-4">Aucun rendez-vous trouvé</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Médecin</TableHead>
                    <TableHead>Date souhaitée</TableHead>
                    <TableHead>Créneau</TableHead>
                    <TableHead>Motif</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment: any) => (
                    <TableRow key={appointment._id}>
                      <TableCell className="font-medium">
                        Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                        <div className="text-xs text-muted-foreground">{appointment.doctor.speciality}</div>
                      </TableCell>
                      <TableCell>
                        {appointment.confirmedDate
                          ? formatDate(appointment.confirmedDate)
                          : formatDate(appointment.preferredDate)}
                      </TableCell>
                      <TableCell>
                        {appointment.confirmedDate
                          ? format(parseISO(appointment.confirmedDate), "HH:mm")
                          : `${appointment.preferredTimeStart} - ${appointment.preferredTimeEnd}`}
                      </TableCell>
                      <TableCell>{appointment.reason}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => viewAppointmentDetails(appointment)}>
                            Détails
                          </Button>
                          {(appointment.status === "pending" || appointment.status === "proposed") && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelAppointment(appointment._id)}
                            >
                              Annuler
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Calendrier</CardTitle>
            <CardDescription>Sélectionnez une date pour voir vos rendez-vous</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            <div className="mt-4 space-y-2">
              <h3 className="font-medium text-sm">Rendez-vous du jour</h3>
              {appointmentsForSelectedDate.length > 0 ? (
                appointmentsForSelectedDate.map((appointment: any) => (
                  <div key={appointment._id} className="p-2 border rounded-md">
                    <p className="font-medium">
                      Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {appointment.confirmedDate
                        ? format(parseISO(appointment.confirmedDate), "HH:mm")
                        : `${appointment.preferredTimeStart} - ${appointment.preferredTimeEnd}`}
                    </div>
                    <div className="mt-1">{getStatusBadge(appointment.status)}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Aucun rendez-vous ce jour</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogue de détails du rendez-vous */}
      {selectedAppointment && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Détails du rendez-vous</DialogTitle>
              <DialogDescription>
                Rendez-vous avec Dr. {selectedAppointment.doctor.firstName} {selectedAppointment.doctor.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Statut</h4>
                <div className="mt-1">{getStatusBadge(selectedAppointment.status)}</div>
              </div>

              <div>
                <h4 className="text-sm font-medium">Motif</h4>
                <p className="text-sm">{selectedAppointment.reason}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium">
                  {selectedAppointment.confirmedDate ? "Date confirmée" : "Date souhaitée"}
                </h4>
                <p className="text-sm">
                  {selectedAppointment.confirmedDate
                    ? formatDate(selectedAppointment.confirmedDate)
                    : formatDate(selectedAppointment.preferredDate)}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium">
                  {selectedAppointment.confirmedDate ? "Heure confirmée" : "Créneau souhaité"}
                </h4>
                <p className="text-sm">
                  {selectedAppointment.confirmedDate
                    ? format(parseISO(selectedAppointment.confirmedDate), "HH:mm")
                    : `${selectedAppointment.preferredTimeStart} - ${selectedAppointment.preferredTimeEnd}`}
                </p>
              </div>

              {selectedAppointment.notes && selectedAppointment.notes.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium">Historique</h4>
                  <ScrollArea className="h-[100px] mt-1 rounded border p-2">
                    {selectedAppointment.notes.map((note, index) => (
                      <div key={index} className="mb-2 text-sm">
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(note.createdAt), "dd/MM/yyyy HH:mm")}
                        </p>
                        <p>{note.text}</p>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                Fermer
              </Button>
              {(selectedAppointment.status === "pending" || selectedAppointment.status === "proposed") && (
                <Button variant="destructive" onClick={() => handleCancelAppointment(selectedAppointment._id)}>
                  Annuler le rendez-vous
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

