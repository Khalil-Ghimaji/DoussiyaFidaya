import { Suspense } from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { getClient } from "@/lib/apollo-client"
import { GET_PHARMACY_PRESCRIPTIONS } from "@/lib/graphql/queries/pharmacy"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "@/components/search"
import { PrescriptionsList } from "@/components/pharmacy/prescriptions-list"
import { LoadingPrescriptions } from "@/components/pharmacy/loading-prescriptions"
import { ErrorDisplay } from "@/components/error-display"

export const metadata: Metadata = {
  title: "Pharmacy | Medical System",
  description: "Manage prescriptions and inventory in the pharmacy",
}

// Data fetching function separated from UI
async function fetchPrescriptions(status?: string, search?: string) {
  const client = getClient()

  try {
    const { data } = await client.query({
      query: GET_PHARMACY_PRESCRIPTIONS,
      variables: { status, search },
      fetchPolicy: "network-only",
    })

    return data.pharmacyPrescriptions
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
    throw error
  }
}

// UI Components
function PrescriptionsTab({ status }: { status?: string }) {
  return (
    <Suspense fallback={<LoadingPrescriptions />}>
      <PrescriptionsContent status={status} />
    </Suspense>
  )
}

// This component will be rendered with Suspense
async function PrescriptionsContent({ status }: { status?: string }) {
  try {
    const prescriptions = await fetchPrescriptions(status)

    return <PrescriptionsList prescriptions={prescriptions} />
  } catch (error) {
    return <ErrorDisplay error={error} />
  }
}

export default function PharmacyPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pharmacy</h1>
        <div className="flex gap-2">
          <Link href="/pharmacy/scan">
            <Button>Scan Prescription</Button>
          </Link>
          <Link href="/pharmacy/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>
          <CardDescription>Manage and process patient prescriptions</CardDescription>
          <div className="mt-4">
            <Search placeholder="Search prescriptions..." />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <PrescriptionsTab status="pending" />
            </TabsContent>
            <TabsContent value="processing">
              <PrescriptionsTab status="processing" />
            </TabsContent>
            <TabsContent value="delivered">
              <PrescriptionsTab status="delivered" />
            </TabsContent>
            <TabsContent value="all">
              <PrescriptionsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

