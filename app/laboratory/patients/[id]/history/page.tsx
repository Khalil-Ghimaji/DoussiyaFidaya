import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getClient } from "@/lib/apollo-client-server"
import { GET_PATIENT_ANALYSIS_HISTORY } from "@/lib/graphql/queries/laboratory"
import { TableSkeleton } from "@/components/laboratory/table-skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowLeft } from "lucide-react"

// This page uses ISR with revalidation every 5 minutes
export const revalidate = 300 // 5 minutes

async function PatientHistoryContent({ id, searchParams }: { id: string; searchParams: { page?: string } }) {
  const page = Number.parseInt(searchParams.page || "1")
  const limit = 10

  const { data, error } = await getClient().query({
    query: GET_PATIENT_ANALYSIS_HISTORY,
    variables: {
      patientId: id,
      page,
      limit,
    },
  })

  if (error || !data.patientAnalysisHistory) {
    notFound()
  }

  const { patient, analyses, pagination } = data.patientAnalysisHistory

  return (
    <>
      <div className="mb-6">
        <Link href="/laboratory/patients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p>{patient.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Document ID</p>
              <p>{patient.documentId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
              <p>{new Date(patient.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <p>{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
              <p>{patient.contactNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{patient.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Analysis History</h2>
        <Link href={`/laboratory/patients/${id}/new-analysis`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Analysis
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead>Completed Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analyses.map((analysis: any) => (
              <TableRow key={analysis.id}>
                <TableCell>{analysis.type}</TableCell>
                <TableCell>
                  <Badge variant={analysis.status === "COMPLETED" ? "success" : "warning"}>{analysis.status}</Badge>
                </TableCell>
                <TableCell>{analysis.requestedBy.name}</TableCell>
                <TableCell>{new Date(analysis.requestedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  {analysis.completedAt ? new Date(analysis.completedAt).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  {analysis.status === "COMPLETED" ? (
                    <Link href={`/laboratory/results/${analysis.id}`}>
                      <Button variant="outline" size="sm">
                        View Results
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/laboratory/upload?analysisId=${analysis.id}`}>
                      <Button size="sm">Upload Results</Button>
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} analyses
        </p>
        <div className="flex space-x-2">
          <Link href={`/laboratory/patients/${id}/history?page=${page - 1}`}>
            <Button variant="outline" size="sm" disabled={page <= 1}>
              Previous
            </Button>
          </Link>
          <Link href={`/laboratory/patients/${id}/history?page=${page + 1}`}>
            <Button variant="outline" size="sm" disabled={!pagination.hasMore}>
              Next
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}

export default function PatientHistoryPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { page?: string }
}) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Patient Analysis History</h1>
        <p className="text-muted-foreground">View and manage patient's laboratory analyses</p>
      </div>

      <Suspense fallback={<TableSkeleton columns={6} rows={10} />}>
        <PatientHistoryContent id={params.id} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

