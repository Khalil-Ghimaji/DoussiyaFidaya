"use client"

import { Suspense } from "react"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDoctorsList } from "@/lib/server/assistant-queries"
import { NewAppointmentForm } from "./new-appointment-form"

const formSchema = z.object({
  patientId: z.string().min(1, { message: "Patient is required" }),
  doctorId: z.string().min(1, { message: "Doctor is required" }),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  reason: z.string().min(1, { message: "Reason is required" }),
  notes: z.string().optional(),
})

async function AppointmentFormContent() {
  const doctors = await getDoctorsList()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <NewAppointmentForm doctors={doctors} />
      </CardContent>
    </Card>
  )
}

export default async function NewAppointmentPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Appointment</h1>
        <p className="text-muted-foreground">Schedule a new appointment for a patient</p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        }
      >
        <AppointmentFormContent />
      </Suspense>
    </div>
  )
}

