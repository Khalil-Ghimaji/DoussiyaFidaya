import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Clock, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getEmergencyAccessDetails } from "@/lib/server/patient-queries"
import { EmergencyAccessActions } from "./emergency-access-actions"

export default async function EmergencyAccessDetailsPage({ params }: { params: { id: string } }) {
  const accessId = params.id

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/patient/authorizations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux autorisations
            </Link>
          </Button>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Chargement des détails de l'accès d'urgence...</p>
              </div>
            </div>
          }
        >
          <EmergencyAccessContent accessId={accessId} />
        </Suspense>
      </div>
    </div>
  )
}

async function EmergencyAccessContent({ accessId }: { accessId: string }) {
  const accessDetails = await getEmergencyAccessDetails(accessId)

  if (!accessDetails) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Une erreur est survenue</h3>
            <p className="text-muted-foreground">Impossible de charger les détails de l'accès d'urgence</p>
            <Button className="mt-4" asChild>
              <Link href="/patient/authorizations">Retour aux autorisations</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format doctor name
  const doctorName = `Dr. ${accessDetails.doctor.firstName} ${accessDetails.doctor.lastName}`

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Détails de l'accès d'urgence</h1>
        <p className="text-muted-foreground">Informations sur l'accès d'urgence à votre dossier médical</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>Détails de la demande d'accès d'urgence</CardDescription>
              </div>
              <Badge
                variant={
                  accessDetails.status === "approved"
                    ? "default"
                    : accessDetails.status === "pending"
                      ? "secondary"
                      : "destructive"
                }
                className="ml-2"
              >
                {accessDetails.status === "approved"
                  ? "Approuvé"
                  : accessDetails.status === "pending"
                    ? "En attente"
                    : "Refusé"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Médecin</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={accessDetails.doctor.avatar} alt={doctorName} />
                      <AvatarFallback>{accessDetails.doctor.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{doctorName}</p>
                      <p className="text-xs text-muted-foreground">{accessDetails.doctor.specialty}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Établissement</h3>
                  <p>{accessDetails.doctor.hospital}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Contact</h3>
                  <p>{accessDetails.doctor.phone}</p>
                  <p className="text-sm">{accessDetails.doctor.email}</p>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date et heure</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p>
                      {new Date(accessDetails.date).toLocaleDateString("fr-FR")} à {accessDetails.time}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Niveau d'urgence</h3>
                  <Badge
                    variant={
                      accessDetails.urgencyLevel === "high"
                        ? "destructive"
                        : accessDetails.urgencyLevel === "medium"
                          ? "default"
                          : "outline"
                    }
                    className="mt-1"
                  >
                    {accessDetails.urgencyLevel === "high"
                      ? "Élevé"
                      : accessDetails.urgencyLevel === "medium"
                        ? "Moyen"
                        : "Faible"}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Durée d'accès</h3>
                  <p>{accessDetails.duration}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Statut de la révision</h3>
                  <p>
                    {accessDetails.reviewedBy
                      ? `Révisé par ${accessDetails.reviewedBy} le ${new Date(
                          accessDetails.reviewDate || "",
                        ).toLocaleDateString("fr-FR")}`
                      : "Non révisé"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Motif de l'accès d'urgence</h3>
              <p className="mt-1 p-3 bg-muted/50 rounded-md">{accessDetails.reason}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Données consultées</CardTitle>
            <CardDescription>Sections du dossier médical consultées lors de cet accès</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type de données</TableHead>
                  <TableHead>Heure de consultation</TableHead>
                  <TableHead>Durée</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessDetails.accessedData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                        {data.type}
                      </div>
                    </TableCell>
                    <TableCell>{data.timestamp}</TableCell>
                    <TableCell>{data.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <EmergencyAccessActions accessId={accessId} />

        <div className="bg-blue-50 p-4 rounded-md border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex items-start">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-500 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Informations sur la confidentialité
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Les accès d'urgence sont strictement encadrés et font l'objet d'une surveillance. Si vous pensez que cet
                accès n'était pas justifié, vous pouvez le signaler à notre service de protection des données.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

