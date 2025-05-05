import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Edit, Download, Printer, ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { executeGraphQL } from "@/lib/graphql-client"
import { GET_PRESCRIPTION_BY_ID } from "@/lib/graphql/queries/prescriptions"
import { auth } from "@/lib/auth"
import { formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"
import { Suspense } from "react"

// Generate static params for the most common prescriptions
export async function generateStaticParams() {
  // In a real app, you would fetch the most viewed prescriptions
  // For now, we'll return an empty array
  return []
}

// Loading component for Suspense
function PrescriptionDetailsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="h-[400px] bg-muted animate-pulse rounded"></div>
        </div>
        <div>
          <div className="h-[300px] bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    </div>
  )
}

// Prescription details component with server-side data fetching
async function PrescriptionDetails({ prescriptionId }: { prescriptionId: string }) {
  const session = await auth()

  if (!session?.user || session.user.role !== "doctor") {
    return <div className="text-center p-4">Accès non autorisé</div>
  }

  try {
    const data = await executeGraphQL(
      GET_PRESCRIPTION_BY_ID,
      {
        prescriptionId,
      },
      true,
    )

    const prescription = data.prescription

    if (!prescription) {
      notFound()
    }

    const getStatusBadge = (status: string) => {
      switch (status) {
        case "active":
          return <Badge className="bg-green-500">Active</Badge>
        case "expired":
          return <Badge variant="outline">Expirée</Badge>
        case "completed":
          return <Badge variant="secondary">Terminée</Badge>
        default:
          return <Badge variant="outline">{status}</Badge>
      }
    }

    return (
      <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/doctor/prescriptions">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Détails de l'ordonnance</h1>
              <p className="text-muted-foreground">Ordonnance du {formatDate(prescription.date)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {prescription.status !== "completed" && (
              <Button variant="outline" asChild>
                <Link href={`/doctor/prescriptions/${prescriptionId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </Button>
            )}
            {prescription.status === "active" && (
              <Button variant="outline" asChild>
                <Link href={`/doctor/prescriptions/${prescriptionId}/renew`}>
                  <ArrowLeft className="mr-2 h-4 w-4 rotate-180" />
                  Renouveler
                </Link>
              </Button>
            )}
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Télécharger PDF
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Ordonnance médicale</CardTitle>
                  {getStatusBadge(prescription.status)}
                </div>
                <CardDescription>Valable jusqu'au {formatDate(prescription.expiryDate)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Médecin</h3>
                    <p className="font-medium">{`${prescription.doctor.firstName} ${prescription.doctor.lastName}`}</p>
                    <p>{prescription.doctor.specialty}</p>
                    <p className="text-sm">{prescription.doctor.address}</p>
                    <p className="text-sm">{prescription.doctor.phone}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-medium text-sm text-muted-foreground">Patient</h3>
                    <div className="flex items-center gap-2 justify-end">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={prescription.patient.avatar}
                          alt={`${prescription.patient.firstName} ${prescription.patient.lastName}`}
                        />
                        <AvatarFallback>{prescription.patient.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{`${prescription.patient.firstName} ${prescription.patient.lastName}`}</p>
                        <p className="text-sm">Né(e) le {formatDate(prescription.patient.birthDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">Médicaments prescrits</h3>
                  <div className="space-y-4">
                    {prescription.medications.map((medication, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <div className="flex justify-between">
                          <div className="font-medium">
                            {medication.name} {medication.dosage}
                          </div>
                          <div>{medication.duration}</div>
                        </div>
                        <p className="text-sm text-muted-foreground">{medication.frequency}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {prescription.instructions && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Instructions</h3>
                      <p>{prescription.instructions}</p>
                    </div>
                  </>
                )}

                {prescription.isSigned && (
                  <>
                    <Separator />
                    <div className="flex justify-end">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Signature électronique</p>
                        <div className="mt-2 border rounded-md p-2 inline-block">
                          <FileText className="h-12 w-12 text-primary" />
                          <p className="text-xs text-muted-foreground mt-1">Document signé électroniquement</p>
                          <p className="text-xs text-muted-foreground">le {formatDate(prescription.date)}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Statut</h3>
                  <p>{getStatusBadge(prescription.status)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date de prescription</h3>
                  <p>{formatDate(prescription.date)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date d'expiration</h3>
                  <p>{formatDate(prescription.expiryDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Signature</h3>
                  <p>{prescription.isSigned ? "Signée électroniquement" : "Non signée"}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/doctor/patients/${prescription.patient._id}`}>Voir le dossier patient</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </>
    )
  } catch (error) {
    console.error("Error fetching prescription details:", error)
    return (
      <div className="text-center p-4 text-destructive">
        Une erreur est survenue lors du chargement des détails de l'ordonnance
      </div>
    )
  }
}

export default async function PrescriptionDetailsPage({ params }: { params: { id: string } }) {
  const prescriptionId = params.id

  return (
    <div className="container py-8">
      <Suspense fallback={<PrescriptionDetailsLoading />}>
        <PrescriptionDetails prescriptionId={prescriptionId} />
      </Suspense>
    </div>
  )
}

