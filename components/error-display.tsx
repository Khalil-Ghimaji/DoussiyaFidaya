"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ErrorDisplayProps {
  error: unknown
  retry?: () => void
}

export function ErrorDisplay({ error, retry }: ErrorDisplayProps) {
  const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"

  return (
    <Card className="border-red-200">
      <CardHeader className="bg-red-50 text-red-700">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <CardTitle>Error</CardTitle>
        </div>
        <CardDescription className="text-red-600">There was a problem loading the data</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-sm">{errorMessage}</p>
      </CardContent>
      {retry && (
        <CardFooter>
          <Button onClick={retry}>Retry</Button>
        </CardFooter>
      )}
    </Card>
  )
}

