import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getClient } from "@/lib/apollo-client-server"
import { GET_ANALYSIS_RESULTS } from "@/lib/graphql/queries/laboratory"
import { FormSkeleton } from "@/components/laboratory/form-skeleton"
import { uploadAnalysisResults } from "../actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus } from "lucide-react"

// This page uses dynamic rendering for fresh data
export const dynamic = "force-dynamic"

async function UploadResultsForm({ searchParams }: { searchParams: { analysisId?: string } }) {
  const analysisId = searchParams.analysisId

  if (!analysisId) {
    redirect("/laboratory/pending")
  }

  const { data, error } = await getClient().query({
    query: GET_ANALYSIS_RESULTS,
    variables: {
      analysisId,
    },
  })

  if (error || !data.analysisResults) {
    redirect("/laboratory/pending")
  }

  const results = data.analysisResults

  // If results are already completed, redirect to results page
  if (results.status === "COMPLETED") {
    redirect(`/laboratory/results/${analysisId}`)
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/laboratory/pending">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pending Analyses
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Analysis Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Patient</p>
              <p>{results.patient.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Document ID</p>
              <p>{results.patient.documentId}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Analysis Type</p>
              <p>{results.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Requested By</p>
              <p>{results.requestedBy.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Requested Date</p>
              <p>{new Date(results.requestedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Results</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={uploadAnalysisResults} className="space-y-6">
            <input type="hidden" name="analysisId" value={analysisId} />

            <div id="results-container" className="space-y-4">
              {/* This would be implemented with client-side JavaScript to add/remove result fields */}
              <div className="p-4 border rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="results[0].title">Test Name</Label>
                    <Input id="results[0].title" name="results[0].title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="results[0].value">Value</Label>
                    <Input id="results[0].value" name="results[0].value" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="results[0].unit">Unit</Label>
                    <Input id="results[0].unit" name="results[0].unit" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="results[0].referenceRange">Reference Range</Label>
                    <Input id="results[0].referenceRange" name="results[0].referenceRange" required />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="results[0].isAbnormal" name="results[0].isAbnormal" value="true" />
                  <Label htmlFor="results[0].isAbnormal">Mark as abnormal</Label>
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="results[1].title">Test Name</Label>
                    <Input id="results[1].title" name="results[1].title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="results[1].value">Value</Label>
                    <Input id="results[1].value" name="results[1].value" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="results[1].unit">Unit</Label>
                    <Input id="results[1].unit" name="results[1].unit" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="results[1].referenceRange">Reference Range</Label>
                    <Input id="results[1].referenceRange" name="results[1].referenceRange" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="results[1].isAbnormal" name="results[1].isAbnormal" value="true" />
                  <Label htmlFor="results[1].isAbnormal">Mark as abnormal</Label>
                </div>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Another Result
            </Button>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Additional notes or observations" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments</Label>
              <Input id="attachments" name="attachments" type="file" multiple />
              <p className="text-sm text-muted-foreground">Upload any relevant files or images (PDF, JPG, PNG)</p>
            </div>

            <Button type="submit" className="w-full">
              Upload Results
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default function UploadResultsPage({ searchParams }: { searchParams: { analysisId?: string } }) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Upload Analysis Results</h1>
        <p className="text-muted-foreground">Enter and upload laboratory analysis results</p>
      </div>

      <Suspense fallback={<FormSkeleton />}>
        <UploadResultsForm searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

