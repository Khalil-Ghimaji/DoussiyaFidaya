import { Suspense } from "react"
import { fetchGraphQL } from "@/lib/graphql-client"
import { GET_LABORATORY_DASHBOARD } from "@/lib/graphql/queriesV2/laboratory"
import { DashboardSkeleton } from "@/components/laboratory/dashboard-skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ClipboardList, Clock, CheckCircle } from "lucide-react"
import { BarChart } from "@/components/charts/bar-chart"
import { cookies } from "next/headers"

// This page uses SSR with revalidation every 60 seconds
export const revalidate = 60

async function LaboratoryDashboardContent() {
  const storedSession = await cookies();
  const labId = storedSession.get("associatedId")?.value;

  const { data } = await fetchGraphQL<any>(GET_LABORATORY_DASHBOARD, { labId })

  const {
    totalAnalyses,
    pendingAnalyses,
    completedAnalyses,
    recentAnalyses,
    analyticsData
  } = data

  const totalCount = totalAnalyses._count._all
  const pendingCount = pendingAnalyses._count._all
  const completedCount = completedAnalyses._count._all

  const barChartData = {
    labels: analyticsData.map((entry: any) => entry.status),
    datasets: [
      {
        label: "Analyses",
        data: analyticsData.map((entry: any) => entry._count._all),
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">All time analyses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Analyses</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting results</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Analyses</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
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
              {totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}%` : "0%"}
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
            <BarChart data={barChartData} />
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
                      analysis.status === "completed" ? "bg-green-500" : "bg-amber-500"
                    }`}
                  />
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium">
                      {analysis.patients?.users?.first_name} {analysis.patients?.users?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{analysis.lab_requests?.type}</p>
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
