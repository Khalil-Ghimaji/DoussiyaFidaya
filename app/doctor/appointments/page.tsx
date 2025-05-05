import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Loader2 } from "lucide-react"
import Link from "next/link"
import { fetchGraphQL } from "@/lib/server/graphql-client"
import { GET_DOCTOR_APPOINTMENTS } from "@/lib/server/doctor-queries"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { DoctorAppointmentsTable } from "@/components/doctor/appointments-table"
import { AppointmentFilters } from "@/components/doctor/appointment-filters"

// Using dynamic rendering for appointments page to ensure fresh data
export const dynamic = "force-dynamic"

async function DoctorAppointmentsContent({
  searchParams,
}: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const session = await auth()
  if (!session?.user?.id) {
    notFound()
  }

  // Parse filters from search params
  const filters = {
    status: (searchParams.status as string) || undefined,
    type: (searchParams.type as string) || undefined,
    date: (searchParams.date as string) || undefined,
    search: (searchParams.search as string) || undefined,
  }

  try {
    const data = await fetchGraphQL<{
      doctorAppointments: Array<{
        _id: string
        date: string
        time: string
        duration: string
        patient: {
          _id: string
          firstName: string
          lastName: string
          avatar: string
          initials: string
          age: number
          gender: string
        }
        status: string
        type: string
        reason: string
        notes: string
        createdAt: string
        createdBy: string
      }>
    }>(
      GET_DOCTOR_APPOINTMENTS,
      {
        doctorId: session.user.id,
        filters,
      },
      "no-store",
    )

    const appointments = data.doctorAppointments

    // Group appointments by status
    const upcoming = appointments.filter((app) => app.status === "confirmed")
    const pending = appointments.filter((app) => app.status === "pending")
    const past = appointments.filter((app) => app.status === "completed" || app.status === "cancelled")

    return (
      <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rendez-vous</h1>
            <p className="text-muted-foreground">Gérez vos rendez-vous et consultations</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/doctor/appointments/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Nouveau rendez-vous
              </Link>
            </Button>
          </div>
        </div>

        <AppointmentFilters />

        <Tabs defaultValue="upcoming" className="space-y-4 mt-8">
          <TabsList>
            <TabsTrigger value="upcoming">À venir ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="pending">En attente ({pending.length})</TabsTrigger>
            <TabsTrigger value="past">Passés ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rendez-vous à venir</CardTitle>
                <CardDescription>
                  {upcoming.length > 0
                    ? `Vous avez ${upcoming.length} rendez-vous confirmés`
                    : "Vous n'avez pas de rendez-vous confirmés"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DoctorAppointmentsTable appointments={upcoming} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Demandes en attente</CardTitle>
                <CardDescription>
                  {pending.length > 0
                    ? `Vous avez ${pending.length} demandes de rendez-vous en attente`
                    : "Vous n'avez pas de demandes en attente"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DoctorAppointmentsTable appointments={pending} isPending />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="past" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rendez-vous passés</CardTitle>
                <CardDescription>
                  {past.length > 0
                    ? `Vous avez ${past.length} rendez-vous passés ou annulés`
                    : "Vous n'avez pas de rendez-vous passés"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DoctorAppointmentsTable appointments={past} isPast />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </>
    )
  } catch (error) {
    console.error("Error fetching doctor appointments:", error)
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Erreur</p>
        <p>Une erreur est survenue lors du chargement de vos rendez-vous. Veuillez réessayer plus tard.</p>
      </div>
    )
  }
}

export default function DoctorAppointmentsPage({
  searchParams,
}: { searchParams: { [key: string]: string | string[] | undefined } }) {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement des rendez-vous...</p>
            </div>
          </div>
        }
      >
        <DoctorAppointmentsContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

