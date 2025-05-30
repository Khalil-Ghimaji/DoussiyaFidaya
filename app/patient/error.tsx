"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function PatientError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Patient page error:", error)
  }, [error])

  return (
    <div className="container py-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Une erreur est survenue</h3>
            <p className="text-muted-foreground mb-4">
              {error.message || "Une erreur inattendue s'est produite. Veuillez réessayer."}
            </p>
            <Button onClick={() => reset()}>Réessayer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

