import { Suspense } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { getPatientAnalyses } from "@/lib/server/patient-queries"
import { SearchAndFilterClient } from "./search-filter-client"

export default async function PatientAnalyses() {
  const analyses = await getPatientAnalyses()

  // Function to display the status in French
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "Complété", variant: "success" as const }
      case "pending":
        return { label: "En attente", variant: "warning" as const }
      case "processing":
        return { label: "En cours", variant: "secondary" as const }
      default:
        return { label: status, variant: "default" as const }
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement de vos analyses...</p>
            </div>
          </div>
        }
      >
        <AnalysesContent analyses={analyses} getStatusLabel={getStatusLabel} />
      </Suspense>
    </div>
  )
}

function AnalysesContent({
  analyses,
  getStatusLabel,
}: {
  analyses: any[]
  getStatusLabel: (status: string) => { label: string; variant: string }
}) {
  if (!analyses || analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Mes analyses médicales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-muted-foreground">Aucune analyse trouvée</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Mes analyses médicales</CardTitle>
      </CardHeader>
      <CardContent>
        <SearchAndFilterClient analyses={analyses} getStatusLabel={getStatusLabel} />
      </CardContent>
    </Card>
  )
}

// This component will be exported and used by the client component
export function AnalysesTable({
  filteredAnalyses,
  getStatusLabel,
}: {
  filteredAnalyses: any[]
  getStatusLabel: (status: string) => { label: string; variant: string }
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Laboratoire</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAnalyses.map((analysis) => {
            const status = getStatusLabel(analysis.status)
            return (
              <TableRow key={analysis._id}>
                <TableCell>{format(new Date(analysis.completionDate), "dd MMMM yyyy", { locale: fr })}</TableCell>
                <TableCell>{analysis.type}</TableCell>
                <TableCell>{analysis.laboratory.name}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild disabled={analysis.status !== "completed"}>
                    <Link href={`/patient/analyses/${analysis._id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild disabled={analysis.status !== "completed"}>
                    <Link href={`/patient/analyses/${analysis._id}/document`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Document
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

