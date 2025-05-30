import { Suspense } from "react"
import Link from "next/link"
import { getClient } from "@/lib/apollo-client-server"
import { GET_LABORATORY_PATIENTS } from "@/lib/graphql/queries/laboratory"
import { TableSkeleton } from "@/components/laboratory/table-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus } from "lucide-react"

// This page uses dynamic rendering for fresh data
export const dynamic = "force-dynamic"

// This component uses PPR (Partial Pre-Rendering)
async function PatientsTable({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const search = searchParams.search || ""
  const page = Number.parseInt(searchParams.page || "1")
  const limit = 10

  const { data, error } = await getClient().query({
    query: GET_LABORATORY_PATIENTS,
    variables: {
      search,
      page,
      limit,
    },
  })

  if (error) {
    throw new Error("Failed to fetch patients")
  }

  const { patients, pagination } = data.laboratoryPatients

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search patients..."
              className="pl-8"
              defaultValue={search}
            />
          </form>
        </div>
        <Link href="/laboratory/new-analysis">
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
              <TableHead>Name</TableHead>
              <TableHead>Document ID</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Last Analysis</TableHead>
              <TableHead>Total Analyses</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient: any) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell>{patient.documentId}</TableCell>
                <TableCell>{new Date(patient.dateOfBirth).toLocaleDateString()}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>
                  {patient.lastAnalysisDate ? new Date(patient.lastAnalysisDate).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>{patient.totalAnalyses}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link href={`/laboratory/patients/${patient.id}/history`}>
                      <Button variant="outline" size="sm">
                        History
                      </Button>
                    </Link>
                    <Link href={`/laboratory/patients/${patient.id}/new-analysis`}>
                      <Button size="sm">New Analysis</Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} patients
        </p>
        <div className="flex space-x-2">
          <Link href={`/laboratory/patients?page=${page - 1}${search ? `&search=${search}` : ""}`}>
            <Button variant="outline" size="sm" disabled={page <= 1}>
              Previous
            </Button>
          </Link>
          <Link href={`/laboratory/patients?page=${page + 1}${search ? `&search=${search}` : ""}`}>
            <Button variant="outline" size="sm" disabled={!pagination.hasMore}>
              Next
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PatientsPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Laboratory Patients</h1>
        <p className="text-muted-foreground">Manage patient records and request new analyses</p>
      </div>

      <Suspense fallback={<TableSkeleton columns={7} rows={10} />}>
        <PatientsTable searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

