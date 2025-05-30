import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, FileText, User, Shield, Loader2 } from "lucide-react"
import Link from "next/link"
import PatientAppointments from "@/components/patient/appointments"
import PatientPrescriptions from "@/components/patient/prescriptions"
import PatientLabResults from "@/components/patient/lab-results"
import { fetchGraphQL } from "@/lib/server/graphql-client"
import { GET_PATIENT_DASHBOARD_DATA } from "@/lib/server/patient-queries"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"

// Using ISR with a 60-second revalidation period for the dashboard
export const revalidate = 60

async function PatientDashboardContent() {
  const session = await auth()
  if (!session?.user?.id) {
    notFound()
  }

  try {
    const data = await fetchGraphQL<{
      patient: {
        _id: string
        firstName: string
        lastName: string
        medicalRecord: {
          birthDate: string
          bloodType: string
          allergies: string[]
          medicalHistory: Array<{
            condition: string
            since: string
          }>
          currentTreatments: Array<{
            name: string
            dosage: string
            frequency: string
            prescribedBy: string
          }>
        }
        stats: {
          upcomingAppointmentsCount: number
          activePrescritionsCount: number
          labResultsCount: number
          authorizedDoctorsCount: number
          nextAppointment: {
            doctorName: string
            date: string
          }
        }
      }
    }>(GET_PATIENT_DASHBOARD_DATA, { patientId: session.user.id }, "no-store")

    const patientName = `${data.patient.firstName} ${data.patient.lastName}`
    const stats = data.patient.stats
    const medicalRecord = data.patient.medicalRecord

    return (
      <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord patient</h1>
            <p className="text-muted-foreground">Bienvenue, {patientName}. Voici un aperçu de votre dossier médical.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/patient/authorizations">
                <Shield className="mr-2 h-4 w-4" />
                Gérer les autorisations
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/patient/medical-record">
                <FileText className="mr-2 h-4 w-4" />
                Dossier médical
              </Link>
            </Button>
            <Button asChild>
              <Link href="/patient/appointments/new">Prendre rendez-vous</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prochains rendez-vous</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingAppointmentsCount}</div>
              <p className="text-xs text-muted-foreground">
                Prochain: {stats.nextAppointment.doctorName} - {stats.nextAppointment.date}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ordonnances actives</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePrescritionsCount}</div>
              <p className="text-xs text-muted-foreground">Dernière: 15 mars 2023</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Résultats d'analyses</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.labResultsCount}</div>
              <p className="text-xs text-muted-foreground">Dernier: Analyse sanguine - 10 mars</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Médecins autorisés</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.authorizedDoctorsCount}</div>
              <p className="text-xs text-muted-foreground">Généraliste, Cardiologue, Dermatologue</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
            <TabsTrigger value="prescriptions">Ordonnances</TabsTrigger>
            <TabsTrigger value="lab-results">Résultats d'analyses</TabsTrigger>
            <TabsTrigger value="medical-record">Dossier médical</TabsTrigger>
          </TabsList>
          <TabsContent value="appointments" className="space-y-4">
            <PatientAppointments />
          </TabsContent>
          <TabsContent value="prescriptions" className="space-y-4">
            <PatientPrescriptions />
          </TabsContent>
          <TabsContent value="lab-results" className="space-y-4">
            <PatientLabResults />
          </TabsContent>
          <TabsContent value="medical-record" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Dossier médical</CardTitle>
                  <CardDescription>Votre historique médical complet</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/patient/medical-record">
                    <FileText className="mr-2 h-4 w-4" />
                    Voir le dossier complet
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Informations personnelles</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                      <p>{patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date de naissance</p>
                      <p>{medicalRecord.birthDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Groupe sanguin</p>
                      <p>{medicalRecord.bloodType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                      <p>{medicalRecord.allergies.join(", ") || "Aucune"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Antécédents médicaux</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {medicalRecord.medicalHistory.map((item, index) => (
                      <li key={index}>
                        {item.condition} (depuis {item.since})
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Traitements en cours</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {medicalRecord.currentTreatments.map((treatment, index) => (
                      <li key={index}>
                        {treatment.name} {treatment.dosage} - {treatment.frequency}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </>
    )
  } catch (error) {
    console.error("Error fetching patient dashboard data:", error)
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Erreur</p>
        <p>Une erreur est survenue lors du chargement de votre tableau de bord. Veuillez réessayer plus tard.</p>
      </div>
    )
  }
}

export default function PatientDashboard() {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement de votre tableau de bord...</p>
            </div>
          </div>
        }
      >
        <PatientDashboardContent />
      </Suspense>
    </div>
  )
}

