import { Suspense } from "react"
import { getClient } from "@/lib/apollo-client-server"
import { GET_LABORATORY_DASHBOARD } from "@/lib/graphql/queries/laboratory"
import { DashboardSkeleton } from "@/components/laboratory/dashboard-skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ClipboardList, Clock, CheckCircle } from "lucide-react"
import { BarChart } from "@/components/charts/bar-chart"

// This page uses SSR with revalidation every 60 seconds
export const revalidate = 60

async function LaboratoryDashboardContent() {
  const { data, error } = await getClient().query({
    query: GET_LABORATORY_DASHBOARD,
  })

  if (error) {
    throw new Error("Failed to fetch laboratory dashboard data")
  }

  const { totalAnalyses, pendingAnalyses, completedAnalyses, recentAnalyses, analyticsData } = data.laboratoryDashboard

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">All time analyses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Analyses</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAnalyses}</div>
            <p className="text-xs text-muted-foreground">Awaiting results</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Analyses</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAnalyses}</div>
            <p className="text-xs text-muted-foreground">Results available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAnalyses > 0 ? `${Math.round((completedAnalyses / totalAnalyses) * 100)}%` : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Analysis Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={{
                labels: analyticsData.labels,
                datasets: analyticsData.datasets.map((dataset: any) => ({
                  label: dataset.label,
                  data: dataset.data,
                })),
              }}
            />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnalyses.map((analysis: any) => (
                <div key={analysis.id} className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      analysis.status === "COMPLETED" ? "bg-green-500" : "bg-amber-500"
                    }`}
                  />
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">{analysis.patientName}</p>
                    <p className="text-sm text-muted-foreground">{analysis.type}</p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    {new Date(analysis.requestedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LaboratoryDashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Laboratory Dashboard</h1>
        <p className="text-muted-foreground">Overview of laboratory operations and analytics</p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <LaboratoryDashboardContent />
      </Suspense>
    </div>
  )
}

