"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import {
  getDoctorAppointments,
  confirmAppointment,
  updateAppointmentStatus,
  proposeNewTime,
} from "@/actions/appointments"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { Clock, CheckCircle, XCircle, CalendarIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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

// Exemple de données de médecins
const doctors = [{ id: "doctor1", name: "Dr. Karim Malouli", speciality: "Cardiologie" }]

export default function AssistantAppointments() {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [proposeDialogOpen, setProposeDialogOpen] = useState(false)
  const [confirmDate, setConfirmDate] = useState<Date>()
  const [confirmTime, setConfirmTime] = useState("")
  const [proposeDate, setProposeDate] = useState<Date>()
  const [proposeTimeStart, setProposeTimeStart] = useState("")
  const [proposeTimeEnd, setProposeTimeEnd] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true)
      // Dans un cas réel, vous récupéreriez l'ID du médecin associé à l'assistant
      const doctorId = "doctor1"
      const result = await getDoctorAppointments(doctorId)
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

    fetchAppointments()
  }, [toast])

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

  const viewAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment)
    setDetailsOpen(true)
  }

  const openConfirmDialog = (appointment) => {
    setSelectedAppointment(appointment)
    setConfirmDate(appointment.preferredDate ? parseISO(appointment.preferredDate) : new Date())
    setConfirmTime("")
    setConfirmDialogOpen(true)
  }

  const openProposeDialog = (appointment) => {
    setSelectedAppointment(appointment)
    setProposeDate(appointment.preferredDate ? parseISO(appointment.preferredDate) : new Date())
    setProposeTimeStart("")
    setProposeTimeEnd("")
    setProposeDialogOpen(true)
  }

  const openRejectDialog = (appointment) => {
    setSelectedAppointment(appointment)
    setRejectReason("")
    setRejectDialogOpen(true)
  }

  const handleConfirmAppointment = async () => {
    if (!confirmDate || !confirmTime) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date et une heure",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await confirmAppointment(selectedAppointment._id, format(confirmDate, "yyyy-MM-dd"), confirmTime)

      if (result.success) {
        toast({
          title: "Succès",
          description: "Rendez-vous confirmé avec succès",
        })

        // Mettre à jour l'état local
        setAppointments(
          appointments.map((app) =>
            app._id === selectedAppointment._id
              ? {
                  ...app,
                  status: "confirmed",
                  confirmedDate: new Date(`${format(confirmDate, "yyyy-MM-dd")}T${confirmTime}`).toISOString(),
                }
              : app,
          ),
        )

        setConfirmDialogOpen(false)
        setDetailsOpen(false)
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la confirmation du rendez-vous",
        variant: "destructive",
      })
    }
  }

  const handleProposeNewTime = async () => {
    if (!proposeDate || !proposeTimeStart || !proposeTimeEnd) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une date et un créneau horaire",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await proposeNewTime(
        selectedAppointment._id,
        format(proposeDate, "yyyy-MM-dd"),
        proposeTimeStart,
        proposeTimeEnd,
      )

      if (result.success) {
        toast({
          title: "Succès",
          description: "Proposition de créneau envoyée avec succès",
        })

        // Mettre à jour l'état local
        setAppointments(
          appointments.map((app) =>
            app._id === selectedAppointment._id
              ? {
                  ...app,
                  status: "proposed",
                  proposedDate: format(proposeDate, "yyyy-MM-dd"),
                  proposedTimeStart,
                  proposedTimeEnd,
                }
              : app,
          ),
        )

        setProposeDialogOpen(false)
        setDetailsOpen(false)
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la proposition du nouveau créneau",
        variant: "destructive",
      })
    }
  }

  const handleRejectAppointment = async () => {
    if (!rejectReason) {
      toast({
        title: "Erreur",
        description: "Veuillez indiquer une raison pour le refus",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await updateAppointmentStatus(selectedAppointment._id, "rejected", rejectReason)

      if (result.success) {
        toast({
          title: "Succès",
          description: "Rendez-vous refusé avec succès",
        })

        // Mettre à jour l'état local
        setAppointments(
          appointments.map((app) => (app._id === selectedAppointment._id ? { ...app, status: "rejected" } : app)),
        )

        setRejectDialogOpen(false)
        setDetailsOpen(false)
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du refus du rendez-vous",
        variant: "destructive",
      })
    }
  }

  const pendingAppointments = appointments.filter((app) => app.status === "pending" || app.status === "proposed")
  const confirmedAppointments = appointments.filter(
    (app) => app.status === "confirmed" && new Date(app.confirmedDate) >= new Date(),
  )
  const todayAppointments = confirmedAppointments.filter((app) => {
    const appDate = new Date(app.confirmedDate)
    const today = new Date()
    return (
      appDate.getDate() === today.getDate() &&
      appDate.getMonth() === today.getMonth() &&
      appDate.getFullYear() === today.getFullYear()
    )
  })

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Demandes de rendez-vous en attente</CardTitle>
          <CardDescription>Gérez les demandes de rendez-vous des patients</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Chargement des rendez-vous...</div>
          ) : pendingAppointments.length === 0 ? (
            <div className="text-center py-4">Aucune demande de rendez-vous en attente</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date souhaitée</TableHead>
                  <TableHead>Créneau</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingAppointments.map((appointment) => (
                  <TableRow key={appointment._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg" alt={appointment.patient.name} />
                          <AvatarFallback>
                            {appointment.patient.firstName.charAt(0)}
                            {appointment.patient.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{format(parseISO(appointment.preferredDate), "dd MMMM yyyy", { locale: fr })}</TableCell>
                    <TableCell>{`${appointment.preferredTimeStart} - ${appointment.preferredTimeEnd}`}</TableCell>
                    <TableCell>{appointment.reason}</TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => viewAppointmentDetails(appointment)}>
                          Détails
                        </Button>
                        <Button variant="default" size="sm" onClick={() => openConfirmDialog(appointment)}>
                          Confirmer
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => openProposeDialog(appointment)}>
                          Proposer
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => openRejectDialog(appointment)}>
                          Refuser
                        </Button>
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
          <CardTitle>Rendez-vous du jour</CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Chargement des rendez-vous...</div>
          ) : todayAppointments.length === 0 ? (
            <div className="text-center py-4">Aucun rendez-vous aujourd'hui</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Motif</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAppointments.map((appointment) => (
                  <TableRow key={appointment._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg" alt={appointment.patient.name} />
                          <AvatarFallback>
                            {appointment.patient.firstName.charAt(0)}
                            {appointment.patient.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{format(parseISO(appointment.confirmedDate), "HH:mm")}</TableCell>
                    <TableCell>{appointment.reason}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/doctor/patients/${appointment.patient._id}`}>Dossier</Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/assistant/appointments/${appointment._id}/edit`}>Modifier</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogue de détails du rendez-vous */}
      {selectedAppointment && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Détails de la demande</DialogTitle>
              <DialogDescription>
                Demande de {selectedAppointment.patient.firstName} {selectedAppointment.patient.lastName}
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
                <h4 className="text-sm font-medium">Date souhaitée</h4>
                <p className="text-sm">
                  {format(parseISO(selectedAppointment.preferredDate), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium">Créneau souhaité</h4>
                <p className="text-sm">
                  {`${selectedAppointment.preferredTimeStart} - ${selectedAppointment.preferredTimeEnd}`}
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
              <div className="flex space-x-2">
                <Button
                  variant="default"
                  onClick={() => {
                    setDetailsOpen(false)
                    openConfirmDialog(selectedAppointment)
                  }}
                >
                  Confirmer
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDetailsOpen(false)
                    openProposeDialog(selectedAppointment)
                  }}
                >
                  Proposer
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailsOpen(false)
                    openRejectDialog(selectedAppointment)
                  }}
                >
                  Refuser
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialogue de confirmation de rendez-vous */}
      {selectedAppointment && (
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmer le rendez-vous</DialogTitle>
              <DialogDescription>
                Choisissez une date et une heure pour le rendez-vous avec {selectedAppointment.patient.firstName}{" "}
                {selectedAppointment.patient.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date du rendez-vous</Label>
                <Calendar
                  mode="single"
                  selected={confirmDate}
                  onSelect={setConfirmDate}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0 || date.getDay() === 6
                  }
                  className="rounded-md border"
                />
              </div>

              <div className="space-y-2">
                <Label>Heure du rendez-vous</Label>
                <Select value={confirmTime} onValueChange={setConfirmTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleConfirmAppointment}>Confirmer le rendez-vous</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialogue de proposition de nouveau créneau */}
      {selectedAppointment && (
        <Dialog open={proposeDialogOpen} onOpenChange={setProposeDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Proposer un nouveau créneau</DialogTitle>
              <DialogDescription>
                Proposez un nouveau créneau pour le rendez-vous avec {selectedAppointment.patient.firstName}{" "}
                {selectedAppointment.patient.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date proposée</Label>
                <Calendar
                  mode="single"
                  selected={proposeDate}
                  onSelect={setProposeDate}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0)) || date.getDay() === 0 || date.getDay() === 6
                  }
                  className="rounded-md border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heure de début</Label>
                  <Select value={proposeTimeStart} onValueChange={setProposeTimeStart}>
                    <SelectTrigger>
                      <SelectValue placeholder="Heure de début" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time} disabled={proposeTimeEnd && time >= proposeTimeEnd}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Heure de fin</Label>
                  <Select value={proposeTimeEnd} onValueChange={setProposeTimeEnd} disabled={!proposeTimeStart}>
                    <SelectTrigger>
                      <SelectValue placeholder="Heure de fin" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time} disabled={time <= proposeTimeStart}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProposeDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleProposeNewTime}>Proposer ce créneau</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialogue de refus de rendez-vous */}
      {selectedAppointment && (
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Refuser la demande</DialogTitle>
              <DialogDescription>
                Veuillez indiquer la raison du refus de la demande de {selectedAppointment.patient.firstName}{" "}
                {selectedAppointment.patient.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejectReason">Raison du refus</Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Expliquez pourquoi vous ne pouvez pas accepter cette demande"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleRejectAppointment}>
                Refuser la demande
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

