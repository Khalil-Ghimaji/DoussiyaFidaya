import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getClient } from "@/lib/apollo-client-server"
import { GET_ANALYSIS_RESULTS } from "@/lib/graphql/queries/laboratory"
import { FormSkeleton } from "@/components/laboratory/form-skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, FileIcon as FilePdf, FileSpreadsheet } from "lucide-react"

// This page uses ISR with revalidation every 5 minutes
export const revalidate = 300 // 5 minutes

async function DownloadResultsContent({ id }: { id: string }) {
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

  // In a real application, these would be server actions that generate and return the files
  const downloadPDF = () => {
    // Implementation would be in a server action
    console.log("Downloading PDF")
  }

  const downloadCSV = () => {
    // Implementation would be in a server action
    console.log("Downloading CSV")
  }

  return (
    <>
      <div className="mb-6">
        <Link href={`/laboratory/results/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Results
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Download Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="mb-2">
                Analysis: <span className="font-medium">{results.type}</span>
              </p>
              <p className="mb-2">
                Patient: <span className="font-medium">{results.patient.name}</span>
              </p>
              <p className="mb-2">
                Date:{" "}
                <span className="font-medium">
                  {new Date(results.completedAt || results.requestedAt).toLocaleDateString()}
                </span>
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <FilePdf className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">PDF Format</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download the results in PDF format for printing or sharing.
                    </p>
                    <form action={downloadPDF}>
                      <input type="hidden" name="analysisId" value={id} />
                      <Button type="submit" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <FileSpreadsheet className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">CSV Format</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download the results in CSV format for data analysis.
                    </p>
                    <form action={downloadCSV}>
                      <input type="hidden" name="analysisId" value={id} />
                      <Button type="submit" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Download CSV
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default function DownloadResultsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Download Analysis Results</h1>
        <p className="text-muted-foreground">Download the laboratory analysis results in different formats</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Suspense fallback={<FormSkeleton />}>
          <DownloadResultsContent id={params.id} />
        </Suspense>
      </div>
    </div>
  )
}

