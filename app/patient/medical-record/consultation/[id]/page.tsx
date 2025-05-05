import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Clock, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { fetchGraphQL } from "@/lib/server/graphql-client"
import { GET_CONSULTATION_DETAILS } from "@/lib/server/patient-queries"
import { notFound } from "next/navigation"

// Using ISR with a 5-minute revalidation period for consultation details
export const revalidate = 300

async function ConsultationDetailsContent({ consultationId }: { consultationId: string }) {
  try {
    const data = await fetchGraphQL<{
      consultation: {
        _id: string
        date: string
        time: string
        duration: string
        patient: {
          _id: string
          firstName: string
          lastName: string
          age: number
          gender: string
          bloodType: string
        }
        doctor: {
          firstName: string
          lastName: string
        }
        specialty: string
        reason: string
        notes: string
        diagnosis: string
        vitalSigns: {
          bloodPressure: string
          heartRate: string
          temperature: string
          respiratoryRate: string
          oxygenSaturation: string
          weight: string
        }
        prescriptions: Array<{
          id: string
          name: string
          dosage: string
          frequency: string
          duration: string
          quantity: string
        }>
        labRequests: Array<{
          id: string
          type: string
          priority: string
          laboratory: string
          status: string
          resultId: string
        }>
      }
    }>(GET_CONSULTATION_DETAILS, { consultationId })

    if (!data.consultation) {
      notFound()
    }

    const consultation = data.consultation
    const doctorName = `Dr. ${consultation.doctor.firstName} ${consultation.doctor.lastName}`
    const patientName = `${consultation.patient.firstName} ${consultation.patient.lastName}`

    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/patient/medical-record">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au dossier médical
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Détails de la consultation</h1>
            <p className="text-muted-foreground">
              {new Date(consultation.date).toLocaleDateString("fr-FR")} à {consultation.time}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations du patient</CardTitle>
              <CardDescription>Détails du patient pour cette consultation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom</p>
                  <p className="font-medium">{patientName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Âge</p>
                  <p>{consultation.patient.age} ans</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Genre</p>
                  <p>{consultation.patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Groupe sanguin</p>
                  <p>{consultation.patient.bloodType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détails de la consultation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{new Date(consultation.date).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {consultation.time} ({consultation.duration})
                  </span>
                </div>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {doctorName} - {consultation.specialty}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Motif</p>
                  <p>{consultation.reason}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Signes vitaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tension artérielle</p>
                  <p>{consultation.vitalSigns.bloodPressure}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fréquence cardiaque</p>
                  <p>{consultation.vitalSigns.heartRate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Température</p>
                  <p>{consultation.vitalSigns.temperature}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fréquence respiratoire</p>
                  <p>{consultation.vitalSigns.respiratoryRate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Saturation en oxygène</p>
                  <p>{consultation.vitalSigns.oxygenSaturation}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Poids</p>
                  <p>{consultation.vitalSigns.weight}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes et diagnostic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Notes de consultation</h3>
                  <p>{consultation.notes}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Diagnostic</h3>
                  <p>{consultation.diagnosis}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ordonnance</CardTitle>
            </CardHeader>
            <CardContent>
              {consultation.prescriptions.length === 0 ? (
                <p className="text-muted-foreground">Aucun médicament prescrit</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Médicament</th>
                      <th className="text-left py-2">Dosage</th>
                      <th className="text-left py-2">Fréquence</th>
                      <th className="text-left py-2">Durée</th>
                      <th className="text-left py-2">Quantité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultation.prescriptions.map((prescription) => (
                      <tr key={prescription.id} className="border-b">
                        <td className="py-2">{prescription.name}</td>
                        <td className="py-2">{prescription.dosage}</td>
                        <td className="py-2">{prescription.frequency}</td>
                        <td className="py-2">{prescription.duration}</td>
                        <td className="py-2">{prescription.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demandes d'analyses</CardTitle>
            </CardHeader>
            <CardContent>
              {consultation.labRequests.length === 0 ? (
                <p className="text-muted-foreground">Aucune analyse demandée</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Type d'analyse</th>
                      <th className="text-left py-2">Priorité</th>
                      <th className="text-left py-2">Laboratoire</th>
                      <th className="text-left py-2">Statut</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultation.labRequests.map((request) => (
                      <tr key={request.id} className="border-b">
                        <td className="py-2">{request.type}</td>
                        <td className="py-2">
                          <Badge
                            variant={
                              request.priority === "high"
                                ? "destructive"
                                : request.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {request.priority === "high"
                              ? "Haute"
                              : request.priority === "medium"
                                ? "Moyenne"
                                : "Basse"}
                          </Badge>
                        </td>
                        <td className="py-2">{request.laboratory}</td>
                        <td className="py-2">
                          <Badge
                            variant={
                              request.status === "completed"
                                ? "default"
                                : request.status === "pending"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {request.status === "completed"
                              ? "Terminé"
                              : request.status === "pending"
                                ? "En attente"
                                : "En cours"}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {request.status === "completed" && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/patient/lab-results/${request.resultId}`}>Voir résultats</Link>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    )
  } catch (error) {
    console.error("Error fetching consultation details:", error)
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/patient/medical-record">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au dossier médical
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Une erreur est survenue</h3>
              <p className="text-muted-foreground">Impossible de charger les détails de la consultation</p>
              <Button className="mt-4" asChild>
                <Link href="/patient/medical-record">Retour au dossier médical</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }
}

export default function ConsultationDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement des détails de la consultation...</p>
            </div>
          </div>
        }
      >
        <ConsultationDetailsContent consultationId={params.id} />
      </Suspense>
    </div>
  )
}

