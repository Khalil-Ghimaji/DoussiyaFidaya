"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, AlertTriangle, Shield, Eye, AlertCircle, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { authorizeDoctor, revokeDoctorAccess, revokeEmergencyAccess, submitEmergencyAccessComplaint } from "./actions"

type PatientAuthorizationsContentProps = {
  patientId: string
  initialData?: any
}

export default function PatientAuthorizationsContent({ patientId, initialData }: PatientAuthorizationsContentProps) {
  const { toast } = useToast()
  const router = useRouter()

  const authorizedDoctors = initialData?.authorizedDoctors || []
  const availableDoctors = initialData?.availableDoctors || []
  const emergencyAccesses = initialData?.emergencyAccesses || []
  const accessHistory = initialData?.accessHistory || []

  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDoctor, setShowAddDoctor] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [accessLevel, setAccessLevel] = useState("specialty")
  const [activeTab, setActiveTab] = useState("current")
  const [complaintReason, setComplaintReason] = useState("")
  const [selectedEmergencyAccess, setSelectedEmergencyAccess] = useState<string | null>(null)
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRevokeAccess = async (authorizationId: string, doctorName: string) => {
    setIsSubmitting(true)
    try {
      const result = await revokeDoctorAccess(authorizationId)

      if (result.success) {
        toast({
          title: "Accès révoqué",
          description: `L'accès du Dr. ${doctorName} a été révoqué avec succès.`,
        })
        router.refresh()
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Une erreur est survenue lors de la révocation de l'accès.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la révocation de l'accès.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddDoctor = async () => {
    if (!selectedDoctor) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un médecin.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await authorizeDoctor({
        patientId,
        doctorId: selectedDoctor,
        accessLevel,
      })

      if (result.success) {
        toast({
          title: "Médecin autorisé",
          description: `Le médecin a été autorisé avec succès avec un niveau d'accès ${
            accessLevel === "full" ? "complet" : accessLevel === "specialty" ? "par spécialité" : "général"
          }.`,
        })
        setShowAddDoctor(false)
        setSelectedDoctor("")
        setAccessLevel("specialty")
        router.refresh()
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Une erreur est survenue lors de l'autorisation du médecin.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'autorisation du médecin.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevokeEmergencyAccess = async (accessId: string) => {
    setIsSubmitting(true)
    try {
      const result = await revokeEmergencyAccess(accessId)

      if (result.success) {
        toast({
          title: "Accès révoqué",
          description: "L'accès d'urgence a été révoqué avec succès.",
        })
        router.refresh()
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Une erreur est survenue lors de la révocation de l'accès d'urgence.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la révocation de l'accès d'urgence.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitComplaint = async () => {
    if (!complaintReason || !selectedEmergencyAccess) {
      toast({
        title: "Erreur",
        description: "Veuillez indiquer le motif de votre réclamation.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitEmergencyAccessComplaint({
        accessId: selectedEmergencyAccess,
        reason: complaintReason,
      })

      if (result.success) {
        toast({
          title: "Réclamation envoyée",
          description: "Votre réclamation a été envoyée avec succès et sera examinée par notre équipe.",
        })
        setComplaintDialogOpen(false)
        setComplaintReason("")
        router.refresh()
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Une erreur est survenue lors de l'envoi de la réclamation.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la réclamation.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openComplaintDialog = (accessId: string) => {
    setSelectedEmergencyAccess(accessId)
    setComplaintDialogOpen(true)
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center my-8 gap-4">
        <div></div>
        <Button onClick={() => setShowAddDoctor(!showAddDoctor)} disabled={isSubmitting}>
          <Plus className="mr-2 h-4 w-4" />
          Autoriser un médecin
        </Button>
      </div>

      {showAddDoctor && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ajouter un médecin</CardTitle>
            <CardDescription>Autorisez un nouveau médecin à accéder à votre dossier médical</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sélectionnez un médecin</label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez un médecin" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDoctors.map((doctor: any) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        {doctor.firstName} {doctor.lastName} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Niveau d'accès</label>
                <Select value={accessLevel} onValueChange={setAccessLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez un niveau d'accès" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Général (informations de base uniquement)</SelectItem>
                    <SelectItem value="specialty">
                      Par spécialité (informations générales + spécialité du médecin)
                    </SelectItem>
                    <SelectItem value="full">Complet (accès à tout le dossier médical)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Information importante</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                      En autorisant un médecin, vous lui donnez accès à vos informations médicales selon le niveau
                      d'accès choisi. Vous pouvez révoquer cet accès à tout moment.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDoctor(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddDoctor} disabled={isSubmitting}>
                  {isSubmitting ? "Traitement..." : "Autoriser"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Médecins autorisés</TabsTrigger>
          <TabsTrigger value="emergency">Accès d'urgence</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Liste des médecins autorisés</CardTitle>
              <CardDescription>Ces médecins ont actuellement accès à votre dossier médical</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un médecin..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {authorizedDoctors.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">Aucun médecin autorisé pour le moment</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Médecin</TableHead>
                        <TableHead>Spécialité</TableHead>
                        <TableHead>Établissement</TableHead>
                        <TableHead>Autorisé depuis</TableHead>
                        <TableHead>Niveau d'accès</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {authorizedDoctors
                        .filter((auth: any) => {
                          const doctor = auth.doctor
                          return (
                            doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                        })
                        .map((auth: any) => {
                          const doctor = auth.doctor
                          return (
                            <TableRow key={auth._id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={doctor.avatar} alt={`${doctor.firstName} ${doctor.lastName}`} />
                                    <AvatarFallback>{doctor.initials}</AvatarFallback>
                                  </Avatar>
                                  <div className="font-medium">{`${doctor.firstName} ${doctor.lastName}`}</div>
                                </div>
                              </TableCell>
                              <TableCell>{doctor.specialty}</TableCell>
                              <TableCell>{doctor.hospital}</TableCell>
                              <TableCell>{new Date(auth.authorizedSince).toLocaleDateString("fr-FR")}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    auth.accessLevel === "full"
                                      ? "default"
                                      : auth.accessLevel === "specialty"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  {auth.accessLevel === "full"
                                    ? "Complet"
                                    : auth.accessLevel === "specialty"
                                      ? "Par spécialité"
                                      : "Général"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleRevokeAccess(auth._id, `${doctor.firstName} ${doctor.lastName}`)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    Révoquer l'accès
                                  </Button>
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/patient/authorizations/${auth._id}/edit`}>Modifier</Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle>Accès d'urgence</CardTitle>
              <CardDescription>Accès d'urgence à votre dossier médical</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 mb-6">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      À propos des accès d'urgence
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      En cas d'urgence médicale, un médecin peut obtenir un accès immédiat à votre dossier médical. Vous
                      êtes notifié de cet accès et pouvez le révoquer à tout moment si vous le jugez non justifié. Vous
                      pouvez également déposer une réclamation si vous estimez que l'accès n'était pas nécessaire.
                    </p>
                  </div>
                </div>
              </div>

              {emergencyAccesses.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">Aucun accès d'urgence à afficher</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Médecin</TableHead>
                        <TableHead>Date et heure</TableHead>
                        <TableHead>Motif</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {emergencyAccesses.map((access: any) => (
                        <TableRow key={access._id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={access.doctor.avatar}
                                  alt={`${access.doctor.firstName} ${access.doctor.lastName}`}
                                />
                                <AvatarFallback>{access.doctor.initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{`${access.doctor.firstName} ${access.doctor.lastName}`}</div>
                                <div className="text-xs text-muted-foreground">{access.doctor.specialty}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{new Date(access.date).toLocaleDateString("fr-FR")}</div>
                            <div className="text-xs text-muted-foreground">{access.time}</div>
                          </TableCell>
                          <TableCell>{access.reason}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                access.status === "active"
                                  ? "default"
                                  : access.status === "expired"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {access.status === "active"
                                ? "Actif"
                                : access.status === "expired"
                                  ? "Expiré"
                                  : "Révoqué"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {access.status === "active" && (
                              <div className="flex space-x-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRevokeEmergencyAccess(access._id)}
                                  disabled={isSubmitting}
                                >
                                  <X className="mr-1 h-3 w-3" />
                                  Révoquer
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => openComplaintDialog(access._id)}>
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                  Réclamation
                                </Button>
                              </div>
                            )}
                            {access.status !== "active" && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/patient/authorizations/emergency/${access._id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Détails
                                </Link>
                              </Button>
                            )}
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

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des accès</CardTitle>
              <CardDescription>Historique des accès à votre dossier médical</CardDescription>
            </CardHeader>
            <CardContent>
              {accessHistory.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">Aucun historique d'accès à afficher</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Médecin</TableHead>
                        <TableHead>Type d'accès</TableHead>
                        <TableHead>Date et heure</TableHead>
                        <TableHead>Données consultées</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessHistory.map((access: any) => (
                        <TableRow key={access._id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={access.doctor.avatar}
                                  alt={`${access.doctor.firstName} ${access.doctor.lastName}`}
                                />
                                <AvatarFallback>{access.doctor.initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{`${access.doctor.firstName} ${access.doctor.lastName}`}</div>
                                <div className="text-xs text-muted-foreground">{access.doctor.specialty}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={access.accessType === "regular" ? "default" : "secondary"}>
                              {access.accessType === "regular" ? "Autorisé" : "Urgence"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>{new Date(access.date).toLocaleDateString("fr-FR")}</div>
                            <div className="text-xs text-muted-foreground">{access.time}</div>
                          </TableCell>
                          <TableCell>{access.dataAccessed}</TableCell>
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

      <Dialog open={complaintDialogOpen} onOpenChange={setComplaintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Déposer une réclamation</DialogTitle>
            <DialogDescription>
              Expliquez pourquoi vous contestez cet accès d'urgence à votre dossier médical.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="complaint">Motif de la réclamation</Label>
              <Textarea
                id="complaint"
                placeholder="Expliquez pourquoi vous estimez que cet accès n'était pas justifié..."
                value={complaintReason}
                onChange={(e) => setComplaintReason(e.target.value)}
              />
            </div>
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Information importante</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Votre réclamation sera examinée par notre équipe médicale. Si l'accès est jugé non justifié, des
                    mesures appropriées seront prises. Cette réclamation n'affecte pas la révocation de l'accès, que
                    vous pouvez effectuer séparément.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComplaintDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitComplaint} disabled={isSubmitting}>
              {isSubmitting ? "Envoi en cours..." : "Envoyer la réclamation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

