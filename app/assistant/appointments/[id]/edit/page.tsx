import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"
import { getAppointmentDetails, getDoctorsList } from "@/lib/server/assistant-queries"
import { EditAppointmentForm } from "./edit-appointment-form"

export default async function EditAppointmentPage({ params }: { params: { id: string } }) {
  const id = params.id

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Appointment</h1>
        <p className="text-muted-foreground">Update appointment details</p>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <EditAppointmentContent id={id} />
      </Suspense>
    </div>
  )
}

async function EditAppointmentContent({ id }: { id: string }) {
  const [appointment, doctors] = await Promise.all([getAppointmentDetails(id), getDoctorsList()])

  if (!appointment) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        <h2 className="mt-4 text-lg font-semibold">Error Loading Appointment</h2>
        <p className="mt-2 text-muted-foreground">The appointment could not be found.</p>
        <Button asChild className="mt-6">
          <a href="/assistant/appointments">Go Back</a>
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <EditAppointmentForm appointment={appointment} doctors={doctors} />
      </CardContent>
    </Card>
  )
}

