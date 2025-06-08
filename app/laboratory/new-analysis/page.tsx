import { Suspense } from "react"
import { getClient } from "@/lib/apollo-client-server"
import { GET_ANALYSIS_TYPES } from "@/lib/graphql/queries/laboratory"
import { FormSkeleton } from "@/components/laboratory/form-skeleton"
import { createAnalysis } from "../actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// This page uses SSG with revalidation every 24 hours for analysis types
export const revalidate = 86400 // 24 hours

async function NewAnalysisForm() {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request New Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createAnalysis} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientId">Patient ID</Label>
            <Input id="patientId" name="patientId" placeholder="Enter patient ID" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="analysisType">Analysis Type</Label>
            <Input 
              id="analysisType"
              name="analysisType" 
              type="text" 
              placeholder="Enter analysis type" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select name="priority" defaultValue="NORMAL">
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Additional information or instructions" />
          </div>

          <Button type="submit" className="w-full">
            Request Analysis
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function NewAnalysisPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New Analysis Request</h1>
        <p className="text-muted-foreground">Create a new laboratory analysis request</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<FormSkeleton />}>
          <NewAnalysisForm />
        </Suspense>
      </div>
    </div>
  )
}

