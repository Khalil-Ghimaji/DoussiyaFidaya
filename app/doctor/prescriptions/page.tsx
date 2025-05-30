import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Filter, FileText, Edit, Trash2, Plus } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { executeGraphQL } from "@/lib/graphql-client"
import { GET_DOCTOR_PRESCRIPTIONS } from "@/lib/graphql/queries/prescriptions"
import { auth } from "@/lib/auth"
import { formatDate } from "@/lib/utils"

// Loading component for Suspense
function PrescriptionsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
      <div className="h-10 w-full bg-muted animate-pulse rounded"></div>
      <div className="space-y-2">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="h-16 w-full bg-muted animate-pulse rounded"></div>
          ))}
      </div>
    </div>
  )
}

// Prescription list component with server-side data fetching
async function PrescriptionsList({ status }: { status: string }) {
  const session = await auth()

  if (!session?.user || session.user.role !== "doctor") {
    return <div className="text-center p-4">Accès non autorisé</div>
  }

  try {
    const doctorId = session.user.id
    const data = await executeGraphQL(
      GET_DOCTOR_PRESCRIPTIONS,
      {
        doctorId,
        status,
      },
      true,
    )

    const prescriptions = data.doctorPrescriptions || []

    if (prescriptions.length === 0) {
      return (
        <div className="text-center p-8 text-muted-foreground">
          Aucune ordonnance {status === "active" ? "active" : status === "completed" ? "terminée" : "expirée"} trouvée
        </div>
      )
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Médicaments</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions.map((prescription) => (
              <TableRow key={prescription._id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={prescription.patient.avatar}
                        alt={`${prescription.patient.firstName} ${prescription.patient.lastName}`}
                      />
                      <AvatarFallback>{prescription.patient.initials}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{`${prescription.patient.firstName} ${prescription.patient.lastName}`}</div>
                  </div>
                </TableCell>
                <TableCell>{formatDate(prescription.date)}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {prescription.medications.map((med, index) => (
                      <div key={index} className="text-sm">
                        {med.name} {med.dosage}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/doctor/prescriptions/${prescription._id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Détails
                      </Link>
                    </Button>
                    {status === "active" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/doctor/prescriptions/${prescription._id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </Link>
                      </Button>
                    )}
                    {status === "active" && (
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </Button>
                    )}
                    {status === "expired" && (
                      <Button variant="default" size="sm" asChild>
                        <Link href={`/doctor/prescriptions/${prescription._id}/renew`}>Renouveler</Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
    return (
      <div className="text-center p-4 text-destructive">Une erreur est survenue lors du chargement des ordonnances</div>
    )
  }
}

export default async function DoctorPrescriptionsPage() {
  const session = await auth()

  if (!session?.user) {
    return <div className="text-center p-4">Veuillez vous connecter pour accéder à cette page</div>
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes prescriptions</h1>
          <p className="text-muted-foreground">Gérez les ordonnances que vous avez prescrites</p>
        </div>
        <Button asChild>
          <Link href="/doctor/prescriptions/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle ordonnance
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Actives</TabsTrigger>
          <TabsTrigger value="completed">Terminées</TabsTrigger>
          <TabsTrigger value="expired">Expirées</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions actives</CardTitle>
              <CardDescription>Ordonnances en cours de validité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Rechercher un patient..." className="pl-8" />
                </div>
                <Button variant="outline" className="flex gap-2">
                  <Filter className="h-4 w-4" />
                  Filtres
                </Button>
              </div>

              <Suspense fallback={<PrescriptionsLoading />}>
                <PrescriptionsList status="active" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions terminées</CardTitle>
              <CardDescription>Ordonnances délivrées et terminées</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<PrescriptionsLoading />}>
                <PrescriptionsList status="completed" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions expirées</CardTitle>
              <CardDescription>Ordonnances dont la validité est dépassée</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<PrescriptionsLoading />}>
                <PrescriptionsList status="expired" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

