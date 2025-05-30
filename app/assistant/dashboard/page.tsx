import { Suspense } from "react"
import Link from "next/link"
import { getClient } from "@/lib/apollo-server"
import { GET_ASSISTANT_DASHBOARD } from "@/lib/graphql/queries/assistant"
import { DashboardLoading } from "@/components/assistant/dashboard-loading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ClipboardList, Clock, UserPlus, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export const dynamic = "force-dynamic"

async function getAssistantDashboard() {
  try {
    const client = getClient()
    const { data } = await client.query({
      query: GET_ASSISTANT_DASHBOARD,
      fetchPolicy: "network-only",
    })
    return data.assistantDashboard
  } catch (error) {
    console.error("Error fetching assistant dashboard:", error)
    throw new Error("Failed to load dashboard data")
  }
}

function DashboardContent() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardData />
    </Suspense>
  )
}

async function DashboardData() {
  const dashboard = await getAssistantDashboard()

  if (!dashboard) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Unable to load dashboard</h2>
        <p className="mt-2 text-muted-foreground">Please try refreshing the page or contact support.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Today's Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard.todayAppointments}</div>
          <p className="text-xs text-muted-foreground">
            {dashboard.todayAppointments === 0
              ? "No appointments today"
              : dashboard.todayAppointments === 1
                ? "1 appointment scheduled"
                : `${dashboard.todayAppointments} appointments scheduled`}
          </p>
          <Button asChild variant="ghost" className="mt-4 w-full">
            <Link href="/assistant/appointments?date=today">View all</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard.pendingRequests}</div>
          <p className="text-xs text-muted-foreground">
            {dashboard.pendingRequests === 0
              ? "No pending requests"
              : dashboard.pendingRequests === 1
                ? "1 request needs attention"
                : `${dashboard.pendingRequests} requests need attention`}
          </p>
          <Button asChild variant="ghost" className="mt-4 w-full">
            <Link href="/assistant/appointments?status=pending">Review requests</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dashboard.upcomingAppointments}</div>
          <p className="text-xs text-muted-foreground">
            {dashboard.upcomingAppointments === 0
              ? "No upcoming appointments"
              : dashboard.upcomingAppointments === 1
                ? "1 upcoming appointment"
                : `${dashboard.upcomingAppointments} upcoming appointments`}
          </p>
          <Button asChild variant="ghost" className="mt-4 w-full">
            <Link href="/assistant/appointments?status=upcoming">View schedule</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest actions and updates in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboard.recentActivities.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent activities</p>
            ) : (
              dashboard.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    {activity.type === "appointment_created" && <UserPlus className="h-4 w-4" />}
                    {activity.type === "appointment_updated" && <ClipboardList className="h-4 w-4" />}
                    {activity.type === "appointment_cancelled" && <AlertCircle className="h-4 w-4" />}
                    {activity.type === "request_processed" && <Clock className="h-4 w-4" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Button variant="outline" className="mt-6 w-full">
            View all activities
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AssistantDashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of appointments and requests</p>
        </div>
        <Button asChild>
          <Link href="/assistant/appointments/new">
            <UserPlus className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>

      <DashboardContent />
    </div>
  )
}

