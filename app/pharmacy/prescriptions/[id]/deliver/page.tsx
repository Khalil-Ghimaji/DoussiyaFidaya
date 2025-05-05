import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { getPrescriptionDetails } from "@/lib/server/pharmacy-queries"
import { DeliverPrescriptionForm } from "./deliver-prescription-form"

export default async function DeliverPrescriptionPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Loading...</CardTitle>
              <CardDescription>Please wait while we load the prescription details</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        }
      >
        <DeliverPrescriptionContent id={params.id} />
      </Suspense>
    </div>
  )
}

async function DeliverPrescriptionContent({ id }: { id: string }) {
  const prescription = await getPrescriptionDetails(id)

  if (!prescription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Prescription Not Found</CardTitle>
          <CardDescription>The requested prescription could not be found</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please check the prescription ID and try again.</p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/pharmacy">Back to Prescriptions</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Deliver Prescription</CardTitle>
        <CardDescription>
          Complete the delivery process for {prescription.medicationName} to {prescription.patientName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-2">Prescription Summary</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Patient:</span>
              <span className="ml-2 font-medium">{prescription.patientName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Doctor:</span>
              <span className="ml-2">{prescription.doctorName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Medication:</span>
              <span className="ml-2 font-medium">{prescription.medicationName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Dosage:</span>
              <span className="ml-2">{prescription.dosage}</span>
            </div>
          </div>
        </div>

        <DeliverPrescriptionForm prescription={prescription} />
      </CardContent>
    </Card>
  )
}

