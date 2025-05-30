import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { getClient } from "@/lib/apollo-client"
import { GET_PHARMACY_DASHBOARD } from "@/lib/graphql/queries/pharmacy"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangleIcon, CheckCircleIcon } from "lucide-react"
import { DashboardLoading } from "@/components/pharmacy/dashboard-loading"
import { ErrorDisplay } from "@/components/error-display"

export const metadata: Metadata = {
  title: "Pharmacy Dashboard | Medical System",
  description: "Overview of pharmacy operations and metrics",
}

// Data fetching function separated from UI
async function fetchDashboardData() {
  const client = getClient()

  try {
    const { data } = await client.query({
      query: GET_PHARMACY_DASHBOARD,
      fetchPolicy: "network-only",
    })

    return data.pharmacyDashboard
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    throw error
  }
}

// UI Components
function DashboardContent() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardData />
    </Suspense>
  )
}

// This component will be rendered with Suspense
async function DashboardData() {
  try {
    const dashboard = await fetchDashboardData()

    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.stats.totalPrescriptions}</div>
              <p className="text-xs text-muted-foreground">All time prescriptions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.stats.deliveredToday}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">
                  +{Math.round((dashboard.stats.deliveredToday / dashboard.stats.totalPrescriptions) * 100)}%
                </span>{" "}
                from yesterday
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.stats.pendingPrescriptions}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-500">+{dashboard.stats.lowStockItems}</span> need attention
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Pending Prescriptions</CardTitle>
              <CardDescription>Prescriptions awaiting processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.pendingPrescriptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending prescriptions</p>
                ) : (
                  dashboard.pendingPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{prescription.patientName}</p>
                        <p className="text-sm text-muted-foreground">{prescription.medicationName}</p>
                      </div>
                      <Link href={`/pharmacy/prescriptions/${prescription.id}`}>
                        <Button size="sm" variant="outline">
                          Process
                        </Button>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/pharmacy">
                <Button variant="outline">View All</Button>
              </Link>
            </CardFooter>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
              <CardDescription>Items with low stock levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.inventoryAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No inventory alerts</p>
                ) : (
                  dashboard.inventoryAlerts.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{item.medicationName}</p>
                        <p className="text-sm text-muted-foreground">
                          Stock: {item.currentStock} (Min: {item.minThreshold})
                        </p>
                      </div>
                      <Badge variant="destructive">Low Stock</Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/pharmacy/inventory">
                <Button variant="outline">View Inventory</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </>
    )
  } catch (error) {
    return <ErrorDisplay error={error} />
  }
}

export default function PharmacyDashboardPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pharmacy Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/pharmacy/scan">
            <Button>Scan Prescription</Button>
          </Link>
          <Link href="/pharmacy">
            <Button variant="outline">All Prescriptions</Button>
          </Link>
        </div>
      </div>

      <DashboardContent />
    </div>
  )
}

