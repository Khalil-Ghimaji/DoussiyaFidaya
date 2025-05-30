"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, MapPin } from "lucide-react"
import Link from "next/link"

interface Doctor {
  bio: string | null
  education: string[]
  experience: string[]
  first_name: string
  id: string
  languages: string[]
  last_name: string
  profile_image: string | null
  specialty: string
  type: string
}

interface Appointment {
  Motif: string
  Status: string
  date: string
  doctor_id: string
  id: string
  patient_id: string
  rdv_id: string | null
  time: string
  doctors: Doctor
}

export function AppointmentsClient({
  confirmedAppointments,
  pendingAppointments,
  completedAppointments,
  cancelledAppointments,
  upcomingAppointments,
}: {
  confirmedAppointments: Appointment[]
  pendingAppointments: Appointment[]
  completedAppointments: Appointment[]
  cancelledAppointments: Appointment[]
  upcomingAppointments: Appointment[]
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">À venir</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="past">Passés</TabsTrigger>
            <TabsTrigger value="cancelled">Annulés</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Rendez-vous à venir</CardTitle>
                <CardDescription>Vos prochains rendez-vous confirmés</CardDescription>
              </CardHeader>
              <CardContent>
                {confirmedAppointments.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">Aucun rendez-vous à venir</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Médecin</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Heure</TableHead>
                          <TableHead>Motif</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {confirmedAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={appointment.doctors.profile_image || ""}
                                    alt={`${appointment.doctors.first_name} ${appointment.doctors.last_name}`}
                                  />
                                  <AvatarFallback>
                                    {`${appointment.doctors.first_name[0]}${appointment.doctors.last_name[0]}`}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {`${appointment.doctors.first_name} ${appointment.doctors.last_name}`}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{appointment.doctors.specialty}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{new Date(appointment.date).toLocaleDateString("fr-FR")}</TableCell>
                            <TableCell>{appointment.time}</TableCell>
                            <TableCell>{appointment.Motif}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/patient/appointments/${appointment.id}`}>Détails</Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/patient/appointments/${appointment.id}/cancel`}>Annuler</Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Demandes en attente</CardTitle>
                <CardDescription>Vos demandes de rendez-vous en attente de confirmation</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingAppointments.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">Aucune demande en attente</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Médecin</TableHead>
                          <TableHead>Date souhaitée</TableHead>
                          <TableHead>Heure souhaitée</TableHead>
                          <TableHead>Motif</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={appointment.doctors.profile_image || ""}
                                    alt={`${appointment.doctors.first_name} ${appointment.doctors.last_name}`}
                                  />
                                  <AvatarFallback>
                                    {`${appointment.doctors.first_name[0]}${appointment.doctors.last_name[0]}`}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {`${appointment.doctors.first_name} ${appointment.doctors.last_name}`}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{appointment.doctors.specialty}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{new Date(appointment.date).toLocaleDateString("fr-FR")}</TableCell>
                            <TableCell>{appointment.time}</TableCell>
                            <TableCell>{appointment.Motif}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">En attente</Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/patient/appointments/${appointment.id}/cancel`}>Annuler</Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Rendez-vous passés</CardTitle>
                <CardDescription>Historique de vos consultations précédentes</CardDescription>
              </CardHeader>
              <CardContent>
                {completedAppointments.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">Aucun rendez-vous passé</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Médecin</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Heure</TableHead>
                          <TableHead>Motif</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {completedAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={appointment.doctors.profile_image || ""}
                                    alt={`${appointment.doctors.first_name} ${appointment.doctors.last_name}`}
                                  />
                                  <AvatarFallback>
                                    {`${appointment.doctors.first_name[0]}${appointment.doctors.last_name[0]}`}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {`${appointment.doctors.first_name} ${appointment.doctors.last_name}`}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{appointment.doctors.specialty}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{new Date(appointment.date).toLocaleDateString("fr-FR")}</TableCell>
                            <TableCell>{appointment.time}</TableCell>
                            <TableCell>{appointment.Motif}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/patient/medical-record/consultation/${appointment.id}`}>
                                  Voir consultation
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="cancelled">
            <Card>
              <CardHeader>
                <CardTitle>Rendez-vous annulés</CardTitle>
                <CardDescription>Liste des rendez-vous qui ont été annulés</CardDescription>
              </CardHeader>
              <CardContent>
                {cancelledAppointments.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">Aucun rendez-vous annulé</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Médecin</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Heure</TableHead>
                          <TableHead>Motif</TableHead>
                          <TableHead>Raison d'annulation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cancelledAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={appointment.doctors.profile_image || ""}
                                    alt={`${appointment.doctors.first_name} ${appointment.doctors.last_name}`}
                                  />
                                  <AvatarFallback>
                                    {`${appointment.doctors.first_name[0]}${appointment.doctors.last_name[0]}`}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {`${appointment.doctors.first_name} ${appointment.doctors.last_name}`}
                                  </div>
                                  <div className="text-xs text-muted-foreground">{appointment.doctors.specialty}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{new Date(appointment.date).toLocaleDateString("fr-FR")}</TableCell>
                            <TableCell>{appointment.time}</TableCell>
                            <TableCell>{appointment.Motif}</TableCell>
                            <TableCell>Non spécifiée</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Calendrier</CardTitle>
            <CardDescription>Visualisez vos rendez-vous</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
            <div className="mt-4 space-y-2">
              <h3 className="font-medium text-sm">Prochains rendez-vous</h3>
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-2 border rounded-md">
                    <p className="font-medium">
                      {`${appointment.doctors.first_name} ${appointment.doctors.last_name}`}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      <span className="mr-2">
                        {new Date(appointment.date).toLocaleDateString("fr-FR")}
                      </span>
                      <Clock className="mr-1 h-3 w-3" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="mr-1 h-3 w-3" />
                      <span className="truncate">{appointment.doctors.specialty}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">Aucun rendez-vous à venir</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

