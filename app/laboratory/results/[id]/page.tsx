import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getClient } from "@/lib/apollo-client-server"
import { GET_ANALYSIS_RESULTS } from "@/lib/graphql/queries/laboratory"
import { FormSkeleton } from "@/components/laboratory/form-skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, FileText } from "lucide-react"

// This page uses ISR with revalidation every 5 minutes
export const revalidate = 300 // 5 minutes

async function AnalysisResultsContent({ id }: { id: string }) {
  const { data, error } = await getClient().query({
    query: GET_ANALYSIS_RESULTS,
    variables: {
      analysisId: id,
    },
  })

  if (error || !data.analysisResults) {
    notFound()
  }

  const results = data.analysisResults

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/laboratory/pending">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pending Analyses
          </Button>
        </Link>

        <Link href={`/laboratory/results/${id}/download`}>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Download Results
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p>{results.patient.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Document ID</p>
                <p>{results.patient.documentId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p>{new Date(results.patient.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p>{results.patient.gender}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p>{results.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={results.status === "COMPLETED" ? "success" : "warning"}>{results.status}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requested By</p>
                <p>
                  {results.requestedBy.name} ({results.requestedBy.specialty})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requested Date</p>
                <p>{new Date(results.requestedAt).toLocaleDateString()}</p>
              </div>
              {results.completedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed Date</p>
                  <p>{new Date(results.completedAt).toLocaleDateString()}</p>
                </div>
              )}
              {results.completedBy && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed By</p>
                  <p>{results.completedBy.name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.results.map((result: any) => (
              <div key={result.id} className="grid grid-cols-5 gap-4 py-2">
                <div className="col-span-2">
                  <p className="font-medium">{result.title}</p>
                </div>
                <div className="col-span-1">
                  <p className={result.isAbnormal ? "font-bold text-red-500" : ""}>
                    {result.value} {result.unit}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Reference: {result.referenceRange}</p>
                </div>
              </div>
            ))}
          </div>

          {results.notes && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="font-medium mb-2">Notes</h3>
                <p className="text-sm">{results.notes}</p>
              </div>
            </>
          )}

          {results.attachments && results.attachments.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="font-medium mb-2">Attachments</h3>
                <div className="space-y-2">
                  {results.attachments.map((attachment: any) => (
                    <div key={attachment.id} className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {attachment.name}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default function AnalysisResultsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analysis Results</h1>
        <p className="text-muted-foreground">View detailed laboratory analysis results</p>
      </div>

      <Suspense fallback={<FormSkeleton />}>
        <AnalysisResultsContent id={params.id} />
      </Suspense>
    </div>
  )
}

