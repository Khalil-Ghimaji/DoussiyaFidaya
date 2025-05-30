import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { getAppointmentRequest } from "@/lib/server/assistant-queries"
import { DeclineRequestForm } from "./decline-request-form"

export default async function DeclineAppointmentRequestPage({ params }: { params: { id: string } }) {
  const id = params.id

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Decline Appointment Request</h1>
        <p className="text-muted-foreground">Provide a reason for declining this appointment request</p>
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
        <DeclineRequestContent id={id} />
      </Suspense>
    </div>
  )
}

async function DeclineRequestContent({ id }: { id: string }) {
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
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium">Reason for Visit</h3>
            <p className="text-sm text-muted-foreground">{request.reason}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Preferred Dates</h3>
            <p className="text-sm text-muted-foreground">{request.preferredDates.join(", ")}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Preferred Times</h3>
            <p className="text-sm text-muted-foreground">{request.preferredTimes.join(", ")}</p>
          </div>

          <DeclineRequestForm requestId={id} />
        </div>
      </CardContent>
    </Card>
  )
}

