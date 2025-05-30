import { Suspense } from "react"
import Link from "next/link"
import { getClient } from "@/lib/apollo-server"
import { GET_ASSISTANT_APPOINTMENTS } from "@/lib/graphql/queries/assistant"
import { AppointmentsLoading } from "@/components/assistant/appointments-loading"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Search, UserPlus, Edit, Eye } from "lucide-react"
import { format } from "date-fns"

export const dynamic = "force-dynamic"

type AppointmentsPageProps = {
  searchParams: {
    status?: string
    date?: string
    search?: string
  }
}

async function getAppointments(status?: string, date?: string, search?: string) {
  try {
    const client = getClient()
    const { data } = await client.query({
      query: GET_ASSISTANT_APPOINTMENTS,
      variables: { status, date, search },
      fetchPolicy: "network-only",
    })
    return data.assistantAppointments
  } catch (error) {
    console.error("Error fetching appointments:", error)
    throw new Error("Failed to load appointments")
  }
}

function AppointmentsContent({ searchParams }: AppointmentsPageProps) {
  return (
    <Suspense fallback={<AppointmentsLoading />}>
      <AppointmentsData searchParams={searchParams} />
    </Suspense>
  )
}

async function AppointmentsData({ searchParams }: AppointmentsPageProps) {
  const { status, date, search } = searchParams
  const appointments = await getAppointments(status, date, search)

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-10">
        <Calendar className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">No appointments found</h2>
        <p className="mt-2 text-muted-foreground">
          {search
            ? "Try adjusting your search terms"
            : status
              ? "No appointments with the selected status"
              : date
                ? "No appointments on the selected date"
                : "There are no appointments to display"}
        </p>
        <Button asChild className="mt-6">
          <Link href="/assistant/appointments/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Create New Appointment
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id}>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">{appointment.patientName}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(appointment.date), "MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {appointment.startTime} - {appointment.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${
                      appointment.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : appointment.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/assistant/appointments/${appointment.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/assistant/appointments/${appointment.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const { status = "", date = "", search = "" } = searchParams

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">Manage and view all appointments</p>
        </div>
        <Button asChild>
          <Link href="/assistant/appointments/new">
            <UserPlus className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-48">
          <Select defaultValue={status}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select defaultValue={date}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="tomorrow">Tomorrow</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="next-week">Next Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative w-full sm:w-64 ml-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search appointments..." defaultValue={search} className="pl-8" />
        </div>
      </div>

      <AppointmentsContent searchParams={searchParams} />
    </div>
  )
}

