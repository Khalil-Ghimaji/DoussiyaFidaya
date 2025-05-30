"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, CheckCircle, XCircle, CalendarIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { getPatientAppointments, updateAppointmentStatus, confirmAppointment, proposeNewTime } from "@/actions/appointments"
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
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAppointments() {
      if (session?.user?.id) {
        try {
          setLoading(true)
          setError(null)
          const result = await getPatientAppointments(session.user.id)
          if (result.success) {
            setAppointments(result.data)
          } else {
            setError(result.message)
            toast({
              title: "Erreur",
              description: result.message,
              variant: "destructive",
            })
          }
        } catch (err) {
          setError("Une erreur est survenue lors du chargement des rendez-vous")
          toast({
            title: "Erreur",
            description: "Une erreur est survenue lors du chargement des rendez-vous",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchAppointments()
  }, [session, toast])

  const handleCancelAppointment = async (appointmentId: string) => {
    // Optimistically update the UI
    const oldAppointments = [...appointments]
    setAppointments(
      appointments.map((app: any) => (app._id === appointmentId ? { ...app, status: "cancelled" } : app)),
    )
    setDetailsOpen(false)

    try {
      const result = await updateAppointmentStatus(appointmentId, "cancelled", "Annulé par le patient")
      if (result.success) {
        toast({
          title: "Succès",
          description: "Rendez-vous annulé avec succès",
        })
      } else {
        // Revert the optimistic update on error
        setAppointments(oldAppointments)
        toast({
          title: "Erreur",
          description: result.message || "Impossible d'annuler le rendez-vous",
          variant: "destructive",
        })
      }
    } catch (err) {
      // Revert the optimistic update on error
      setAppointments(oldAppointments)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation du rendez-vous",
        variant: "destructive",
      })
    }
  }

  const handleConfirmAppointment = async (appointmentId: string, confirmedDate: string, confirmedTime: string) => {
    // Optimistically update the UI
    const oldAppointments = [...appointments]
    setAppointments(
      appointments.map((app: any) =>
        app._id === appointmentId
          ? {
              ...app,
              status: "confirmed",
              confirmedDate: `${confirmedDate}T${confirmedTime}`,
            }
          : app,
      ),
    )
    setDetailsOpen(false)

    try {
      const result = await confirmAppointment(appointmentId, confirmedDate, confirmedTime)
      if (result.success) {
        toast({
          title: "Succès",
          description: "Rendez-vous confirmé avec succès",
        })
      } else {
        // Revert the optimistic update on error
        setAppointments(oldAppointments)
        toast({
          title: "Erreur",
          description: result.message || "Impossible de confirmer le rendez-vous",
          variant: "destructive",
        })
      }
    } catch (err) {
      // Revert the optimistic update on error
      setAppointments(oldAppointments)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la confirmation du rendez-vous",
        variant: "destructive",
      })
    }
  }

  const handleProposeNewTime = async (
    appointmentId: string,
    proposedDate: string,
    proposedTimeStart: string,
    proposedTimeEnd: string,
  ) => {
    // Optimistically update the UI
    const oldAppointments = [...appointments]
    setAppointments(
      appointments.map((app: any) =>
        app._id === appointmentId
          ? {
              ...app,
              status: "proposed",
              preferredDate: proposedDate,
              preferredTimeStart: proposedTimeStart,
              preferredTimeEnd: proposedTimeEnd,
            }
          : app,
      ),
    )
    setDetailsOpen(false)

    try {
      const result = await proposeNewTime(appointmentId, proposedDate, proposedTimeStart, proposedTimeEnd)
      if (result.success) {
        toast({
          title: "Succès",
          description: "Nouvelle proposition envoyée avec succès",
        })
      } else {
        // Revert the optimistic update on error
        setAppointments(oldAppointments)
        toast({
          title: "Erreur",
          description: result.message || "Impossible de proposer un nouveau créneau",
          variant: "destructive",
        })
      }
    } catch (err) {
      // Revert the optimistic update on error
      setAppointments(oldAppointments)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la proposition d'un nouveau créneau",
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

  const appointmentDates = appointments.map((app: any) => {
    const date = app.confirmedDate ? parseISO(app.confirmedDate) : parseISO(app.preferredDate)
    return date.toDateString()
  })

  const appointmentsForSelectedDate = date
    ? appointments.filter((app: any) => {
        const appDate = app.confirmedDate
          ? parseISO(app.confirmedDate).toDateString()
          : parseISO(app.preferredDate).toDateString()
        return appDate === date.toDateString()
      })
    : []

  const getAppointmentCount = (day: Date) => {
    return appointments.filter((app: any) => {
      const appDate = app.confirmedDate
        ? parseISO(app.confirmedDate).toDateString()
        : parseISO(app.preferredDate).toDateString()
      return appDate === day.toDateString()
    }).length
  }

  const getDayColor = (day: Date) => {
    const appsForDay = appointments.filter((app: any) => {
      const appDate = app.confirmedDate
        ? parseISO(app.confirmedDate).toDateString()
        : parseISO(app.preferredDate).toDateString()
      return appDate === day.toDateString()
    })

    if (appsForDay.length === 0) return ""

    const hasConfirmed = appsForDay.some((app) => app.status === "confirmed")
    const hasPending = appsForDay.some((app) => app.status === "pending")
    const hasProposed = appsForDay.some((app) => app.status === "proposed")

    if (hasConfirmed) return "bg-green-100 dark:bg-green-900/20"
    if (hasPending) return "bg-yellow-100 dark:bg-yellow-900/20"
    if (hasProposed) return "bg-blue-100 dark:bg-blue-900/20"
    return "bg-gray-100 dark:bg-gray-800/20"
  }

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
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Chargement de vos rendez-vous...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
                <p className="font-medium">Une erreur est survenue</p>
                <p className="text-sm">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setLoading(true)
                    setError(null)
                    getPatientAppointments(session?.user?.id)
                  }}
                >
                  Réessayer
                </Button>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Aucun rendez-vous trouvé</p>
                <Button asChild>
                  <Link href="/patient/appointments/new">Prendre un rendez-vous</Link>
                </Button>
              </div>
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
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                hasAppointment: (day) => appointmentDates.includes(day.toDateString()),
              }}
              modifiersStyles={{
                hasAppointment: {
                  fontWeight: "bold",
                },
              }}
              components={{
                DayContent: ({ date: dayDate }) => {
                  const count = getAppointmentCount(dayDate)
                  const color = getDayColor(dayDate)
                  return (
                    <div
                      className={`relative w-full h-full flex items-center justify-center ${color} rounded-md`}
                    >
                      {dayDate.getDate()}
                      {count > 0 && (
                        <div className="absolute -top-1 -right-1">
                          <div className="flex items-center justify-center w-4 h-4 text-[10px] font-medium rounded-full bg-primary text-primary-foreground">
                            {count}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                },
              }}
            />
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-medium text-sm mb-2">Rendez-vous du jour</h3>
                {appointmentsForSelectedDate.length > 0 ? (
                  <div className="space-y-2">
                    {appointmentsForSelectedDate.map((appointment: any) => (
                      <div
                        key={appointment._id}
                        className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => viewAppointmentDetails(appointment)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">
                            Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                          </p>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {appointment.confirmedDate
                            ? format(parseISO(appointment.confirmedDate), "HH:mm")
                            : `${appointment.preferredTimeStart} - ${appointment.preferredTimeEnd}`}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{appointment.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun rendez-vous ce jour</p>
                )}
              </div>
              <div className="pt-2 border-t">
                <h3 className="font-medium text-sm mb-2">Légende</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900/20" />
                    <span>Confirmé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20" />
                    <span>En attente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-100 dark:bg-blue-900/20" />
                    <span>Proposé</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-100 dark:bg-gray-800/20" />
                    <span>Autre</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogue de détails du rendez-vous */}
      {selectedAppointment && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Détails du rendez-vous</DialogTitle>
              <DialogDescription>
                Consultation avec Dr. {selectedAppointment.doctor.firstName} {selectedAppointment.doctor.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Spécialité</p>
                      <p>{selectedAppointment.doctor.speciality}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">Statut</p>
                      <div>{getStatusBadge(selectedAppointment.status)}</div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date et heure</p>
                    <p>
                      {selectedAppointment.confirmedDate
                        ? `${formatDate(selectedAppointment.confirmedDate)} à ${format(
                            parseISO(selectedAppointment.confirmedDate),
                            "HH:mm",
                          )}`
                        : `${formatDate(selectedAppointment.preferredDate)} entre ${
                            selectedAppointment.preferredTimeStart
                          } et ${selectedAppointment.preferredTimeEnd}`}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Motif de consultation</p>
                    <p>{selectedAppointment.reason}</p>
                  </div>

                  {selectedAppointment.notes && selectedAppointment.notes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <ScrollArea className="h-[100px] w-full rounded-md border p-2">
                        {selectedAppointment.notes.map((note, index) => (
                          <div key={index} className="mb-2 last:mb-0">
                            <p className="text-sm">{note.text}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(note.createdAt), "dd/MM/yyyy HH:mm")}
                            </p>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="flex space-x-2">
              {(selectedAppointment.status === "pending" || selectedAppointment.status === "proposed") && (
                <Button variant="destructive" onClick={() => handleCancelAppointment(selectedAppointment._id)}>
                  Annuler le rendez-vous
                </Button>
              )}
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

