import { Suspense } from "react"
import Link from "next/link"
import { TableSkeleton } from "@/components/laboratory/table-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { fetchGraphQL } from "@/lib/graphql-client"
import { GET_PATIENT_INFO } from "@/lib/graphql/queriesV2/patient"
import { GET_LABORATORY_PATIENT_ANALYSES } from "@/lib/graphql/queriesV2/laboratory"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"


async function PatientAnalysesTable({ 
  id,
  searchParams 
}: { 
  id: string
  searchParams: { page?: string } 
}) {
  // Ensure page is parsed safely
  const page = Number(searchParams?.page) || 1
  const limit = 10
  const storedSession = await cookies();
  const labId = storedSession.get("associatedId")?.value;// Replace with dynamic lab ID if needed

  try {
    // Fetch patient info and analyses in parallel
    const [patientData, analysesData] = await Promise.all([
      fetchGraphQL<any>(GET_PATIENT_INFO, { patientId: id }),
      fetchGraphQL<any>(GET_LABORATORY_PATIENT_ANALYSES, { 
        labId,
        patientId: id,
        take: limit,
        skip: (page - 1) * limit
      })
    ])

    const patient = patientData.data?.patient
    const analyses = analysesData.data?.analyses || []

    if (!patient) {
      throw new Error("Failed to fetch patient information")
    }

    return (
      <div className="space-y-6">
        {/* Patient Info Section */}
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-2">Patient Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p>{patient.users.first_name} {patient.users.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p>{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p>{new Date(patient.date_of_birth).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p>{patient.users.email}</p>
              {patient.users.phone && <p>{patient.users.phone}</p>}
            </div>
          </div>
        </div>

        {/* Analyses Table Section */}
        <div className="space-y-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search analyses..."
              className="pl-8"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map((analysis: any) => (
                  <TableRow key={analysis.id}>
                    <TableCell>{analysis?.lab_requests?.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          analysis.lab_requests?.priority === "high"
                            ? "destructive"
                            : analysis.lab_requests?.priority === "medium"
                              ? "warning"
                              : "outline"
                        }
                      >
                        {analysis.lab_requests?.priority || "low"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={analysis.status === "completed" ? "default" : "secondary"}>
                        {analysis.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(analysis.requested_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {analysis.status === "pending" && (
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, analyses.length)} of {analyses.length} analyses
            </p>
            <div className="flex space-x-2">
              <Link href={`/laboratory/patients/${id}/history?page=${page - 1}`}>
                <Button variant="outline" size="sm" disabled={page <= 1}>
                  Previous
                </Button>
              </Link>
              <Link href={`/laboratory/patients/${id}/history?page=${page + 1}`}>
                <Button variant="outline" size="sm" disabled={analyses.length < limit}>
                  Next
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error fetching data:", error)
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load patient data. Please try again later.</p>
      </div>
    )
  }
}

export default function PatientAnalysisPage({
  params,
  searchParams
}: {
  params: { id: string }
  searchParams: { page?: string }
}) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Patient Analysis History</h1>
        <p className="text-muted-foreground">View and manage patient laboratory analyses</p>
      </div>

      <Suspense fallback={<TableSkeleton columns={5} rows={10} />}>
        <PatientAnalysesTable 
          id={params.id}
          searchParams={searchParams}
        />
      </Suspense>
    </div>
  )
}