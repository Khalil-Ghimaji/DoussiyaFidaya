import { Suspense } from "react"
import Link from "next/link"
import { getClient } from "@/lib/apollo-client-server"
import { GET_PENDING_ANALYSES } from "@/lib/graphql/queries/laboratory"
import { TableSkeleton } from "@/components/laboratory/table-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

// This page uses dynamic rendering for fresh data
export const dynamic = "force-dynamic"

async function PendingAnalysesTable({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  const search = searchParams.search || ""
  const page = Number.parseInt(searchParams.page || "1")
  const limit = 10

  const { data, error } = await getClient().query({
    query: GET_PENDING_ANALYSES,
    variables: {
      search,
      page,
      limit,
    },
  })

  if (error) {
    throw new Error("Failed to fetch pending analyses")
  }

  const { analyses, pagination } = data.pendingAnalyses

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search analyses..."
              className="pl-8"
              defaultValue={search}
            />
          </form>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analyses.map((analysis: any) => (
              <TableRow key={analysis.id}>
                <TableCell className="font-medium">{analysis.patientName}</TableCell>
                <TableCell>{analysis.type}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      analysis.priority === "URGENT"
                        ? "destructive"
                        : analysis.priority === "HIGH"
                          ? "warning"
                          : analysis.priority === "LOW"
                            ? "secondary"
                            : "outline"
                    }
                  >
                    {analysis.priority}
                  </Badge>
                </TableCell>
                <TableCell>{analysis.requestedBy.name}</TableCell>
                <TableCell>{new Date(analysis.requestedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Link href={`/laboratory/upload?analysisId=${analysis.id}`}>
                    <Button size="sm">Upload Results</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} analyses
        </p>
        <div className="flex space-x-2">
          <Link href={`/laboratory/pending?page=${page - 1}${search ? `&search=${search}` : ""}`}>
            <Button variant="outline" size="sm" disabled={page <= 1}>
              Previous
            </Button>
          </Link>
          <Link href={`/laboratory/pending?page=${page + 1}${search ? `&search=${search}` : ""}`}>
            <Button variant="outline" size="sm" disabled={!pagination.hasMore}>
              Next
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PendingAnalysesPage({ searchParams }: { searchParams: { search?: string; page?: string } }) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pending Analyses</h1>
        <p className="text-muted-foreground">Manage and process pending laboratory analyses</p>
      </div>

      <Suspense fallback={<TableSkeleton columns={6} rows={10} />}>
        <PendingAnalysesTable searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

