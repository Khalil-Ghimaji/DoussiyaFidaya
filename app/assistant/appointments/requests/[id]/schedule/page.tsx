import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { getAppointmentRequest } from "@/lib/server/assistant-queries"
import { ScheduleRequestForm } from "./schedule-request-form"

export default async function ScheduleAppointmentRequestPage({ params }: { params: { id: string } }) {
  const id = params.id

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule Appointment</h1>
        <p className="text-muted-foreground">Schedule an appointment for this request</p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <div className="h-6 w-60 bg-gray-200 animate-pulse rounded mb-2"></div>
              <div className="h-4 w-40 bg-gray-200 animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
              </div>
            </CardContent>
          </Card>
        }
      >
        <ScheduleRequestContent id={id} />
      </Suspense>
    </div>
  )
}

async function ScheduleRequestContent({ id }: { id: string }) {
  const request = await getAppointmentRequest(id)

  if (!request) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        <h2 className="mt-4 text-lg font-semibold">Error Loading Request</h2>
        <p className="mt-2 text-muted-foreground">The appointment request could not be found.</p>
        <Button asChild className="mt-6">
          <a href="/assistant/appointments">Go Back</a>
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request from {request.patientName}</CardTitle>
        <CardDescription>Requested on {new Date(request.createdAt).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Reason for Visit</h3>
              <p className="text-sm text-muted-foreground">{request.reason}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Patient Information</h3>
              <p className="text-sm text-muted-foreground">
                {request.patientName}
                <br />
                {request.patientPhone}
                <br />
                {request.patientEmail}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Preferred Dates</h3>
              <p className="text-sm text-muted-foreground">{request.preferredDates.join(", ")}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Preferred Times</h3>
              <p className="text-sm text-muted-foreground">{request.preferredTimes.join(", ")}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-medium mb-4">Schedule Appointment</h3>
            <ScheduleRequestForm request={request} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

