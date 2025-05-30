import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getClient } from "@/lib/apollo-client"
import { GET_PRESCRIPTION_DETAILS } from "@/lib/graphql/queries/pharmacy"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatDate } from "@/lib/utils"
import { PrescriptionDetailsLoading } from "@/components/pharmacy/prescription-details-loading"
import { ErrorDisplay } from "@/components/error-display"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const prescription = await fetchPrescriptionDetails(params.id)
    return {
      title: `Prescription: ${prescription.medicationName} | Medical System`,
      description: `Prescription details for ${prescription.patientName}`,
    }
  } catch (error) {
    return {
      title: "Prescription Details | Medical System",
      description: "View prescription details",
    }
  }
}

// Data fetching function separated from UI
async function fetchPrescriptionDetails(id: string) {
  const client = getClient()

  try {
    const { data } = await client.query({
      query: GET_PRESCRIPTION_DETAILS,
      variables: { id },
      fetchPolicy: "network-only",
    })

    if (!data.prescription) {
      throw new Error("Prescription not found")
    }

    return data.prescription
  } catch (error) {
    console.error("Error fetching prescription details:", error)
    throw error
  }
}

// UI Components
function PrescriptionDetailsContent({ id }: { id: string }) {
  return (
    <Suspense fallback={<PrescriptionDetailsLoading />}>
      <PrescriptionDetails id={id} />
    </Suspense>
  )
}

// This component will be rendered with Suspense
async function PrescriptionDetails({ id }: { id: string }) {
  try {
    const prescription = await fetchPrescriptionDetails(id)

    const getStatusBadge = (status: string) => {
      switch (status.toLowerCase()) {
        case "pending":
          return (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Pending
            </Badge>
          )
        case "processing":
          return (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Processing
            </Badge>
          )
        case "delivered":
          return (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Delivered
            </Badge>
          )
        case "cancelled":
          return (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Cancelled
            </Badge>
          )
        default:
          return <Badge variant="outline">{status}</Badge>
      }
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Prescription Details</CardTitle>
                <CardDescription>Prescription #{prescription.id.slice(0, 8).toUpperCase()}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(prescription.status)}
                <span className="text-sm text-muted-foreground">Created: {formatDate(prescription.createdAt)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Patient Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{prescription.patient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <span>{formatDate(prescription.patient.dateOfBirth)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact:</span>
                    <span>{prescription.patient.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{prescription.patient.email}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Doctor Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{prescription.doctor.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Specialization:</span>
                    <span>{prescription.doctor.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact:</span>
                    <span>{prescription.doctor.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{prescription.doctor.email}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Medication Details</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Medication</h4>
                    <p className="text-lg">{prescription.medication.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{prescription.medication.description}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dosage:</span>
                      <span className="font-medium">{prescription.dosage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span>{prescription.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{prescription.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Stock:</span>
                      <span
                        className={
                          prescription.medication.currentStock < prescription.medication.minThreshold
                            ? "text-red-500 font-medium"
                            : ""
                        }
                      >
                        {prescription.medication.currentStock} units
                      </span>
                    </div>
                  </div>
                </div>

                {prescription.instructions && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-1">Instructions</h4>
                    <p className="text-sm">{prescription.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/pharmacy">Back to Prescriptions</Link>
            </Button>

            {prescription.status === "pending" || prescription.status === "processing" ? (
              <Button asChild>
                <Link href={`/pharmacy/prescriptions/${prescription.id}/deliver`}>Deliver Prescription</Link>
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      </div>
    )
  } catch (error) {
    if ((error as Error).message === "Prescription not found") {
      notFound()
    }
    return <ErrorDisplay error={error} />
  }
}

export default function PrescriptionDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <PrescriptionDetailsContent id={params.id} />
    </div>
  )
}

