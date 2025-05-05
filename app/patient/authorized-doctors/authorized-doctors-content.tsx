"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { authorizeDoctor, revokeDoctorAccess } from "@/app/patient/actions"

type AuthorizedDoctor = {
  _id: string
  doctor: {
    _id: string
    firstName: string
    lastName: string
    avatar: string
    initials: string
    specialty: string
    hospital: string
  }
  authorizedSince: string
  accessLevel: string
}

type AvailableDoctor = {
  _id: string
  firstName: string
  lastName: string
  avatar: string
  initials: string
  specialty: string
  hospital: string
}

type AuthorizedDoctorsData = {
  authorizedDoctors: AuthorizedDoctor[]
  availableDoctors: AvailableDoctor[]
}

export async function AuthorizedDoctorsContent({ dataPromise }: { dataPromise: Promise<AuthorizedDoctorsData> }) {
  const { toast } = useToast()
  const [data, setData] = useState<AuthorizedDoctorsData | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDoctor, setShowAddDoctor] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [accessLevel, setAccessLevel] = useState("specialty")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await dataPromise
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to load data"))
      }
    }

    fetchData()
  }, [dataPromise])

  const handleRevokeAccess = async (authorizationId: string, doctorName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir révoquer l'accès du Dr. ${doctorName} ?`)) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await revokeDoctorAccess(authorizationId)

      if (result.success) {
        toast({
          title: "Succès",
          description: result.message,
        })

        // Refresh data after successful revocation
        const refreshedData = await dataPromise
        setData(refreshedData)
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la révocation de l'accès",
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
      const result = await authorizeDoctor(selectedDoctor, accessLevel)

      if (result.success) {
        toast({
          title: "Succès",
          description: result.message,
        })

        setShowAddDoctor(false)
        setSelectedDoctor("")
        setAccessLevel("specialty")

        // Refresh data after successful authorization
        const refreshedData = await dataPromise
        setData(refreshedData)
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'autorisation du médecin",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Une erreur est survenue</h3>
            <p className="text-muted-foreground">{error.message || "Impossible de charger les médecins autorisés"}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null // Loading state is handled by the Suspense boundary
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Médecins autorisés</h1>
          <p className="text-muted-foreground">Gérez les médecins qui ont accès à votre dossier médical</p>
        </div>
        <Button onClick={() => setShowAddDoctor(!showAddDoctor)}>
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
                    {data.availableDoctors.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        {`Dr. ${doctor.firstName} ${doctor.lastName}`} - {doctor.specialty}
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
                      En autorisant un médecin, vous lui donnez accès à vos informations m��dicales selon le niveau
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
                  {isSubmitting ? "Traitement en cours..." : "Autoriser"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                {data.authorizedDoctors
                  .filter((auth) => {
                    const doctorName = `${auth.doctor.firstName} ${auth.doctor.lastName}`.toLowerCase()
                    const specialty = auth.doctor.specialty.toLowerCase()
                    const searchTermLower = searchTerm.toLowerCase()
                    return doctorName.includes(searchTermLower) || specialty.includes(searchTermLower)
                  })
                  .map((auth) => (
                    <TableRow key={auth._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={auth.doctor.avatar}
                              alt={`${auth.doctor.firstName} ${auth.doctor.lastName}`}
                            />
                            <AvatarFallback>{auth.doctor.initials}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{`Dr. ${auth.doctor.firstName} ${auth.doctor.lastName}`}</div>
                        </div>
                      </TableCell>
                      <TableCell>{auth.doctor.specialty}</TableCell>
                      <TableCell>{auth.doctor.hospital}</TableCell>
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
                              handleRevokeAccess(auth._id, `${auth.doctor.firstName} ${auth.doctor.lastName}`)
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
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

