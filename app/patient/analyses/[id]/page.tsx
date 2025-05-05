"use client"

import { Suspense } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, Loader2 } from "lucide-react"
import Link from "next/link"
import { getPatientAnalysisDetails } from "@/lib/server/patient-queries"
import { AnalysisTabsClient } from "./analysis-tabs-client"

// This page will be statically generated but revalidated every 60 seconds
export const revalidate = 60

export default async function AnalysisDetails({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" className="mb-4" asChild>
        <Link href="/patient/analyses">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Link>
      </Button>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement des détails de l'analyse...</p>
            </div>
          </div>
        }
      >
        <AnalysisContent id={params.id} />
      </Suspense>
    </div>
  )
}

async function AnalysisContent({ id }: { id: string }) {
  const analysis = await getPatientAnalysisDetails(id)

  if (!analysis) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Erreur</p>
        <p>Une erreur est survenue lors du chargement des détails de l'analyse. Veuillez réessayer plus tard.</p>
      </div>
    )
  }

  // Function to display the status of a result
  const getResultStatus = (status: string) => {
    switch (status) {
      case "normal":
        return { label: "Normal", variant: "success" as const }
      case "high":
        return { label: "Élevé", variant: "destructive" as const }
      case "low":
        return { label: "Bas", variant: "warning" as const }
      default:
        return { label: status, variant: "default" as const }
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{analysis.type}</h1>
          <p className="text-muted-foreground">
            {format(new Date(analysis.completionDate), "dd MMMM yyyy", { locale: fr })} - {analysis.laboratory.name}
          </p>
        </div>
        <AnalysisActionsClient />
      </div>

      <AnalysisTabsClient analysis={analysis} getResultStatus={getResultStatus} />
    </>
  )
}

// Client component for print and download actions
function AnalysisActionsClient() {
  return (
    <div className="flex gap-2 mt-4 md:mt-0">
      <Button variant="outline" onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimer
      </Button>
      <Button variant="outline" onClick={() => alert("Téléchargement du document PDF")}>
        <Download className="mr-2 h-4 w-4" />
        Télécharger
      </Button>
    </div>
  )
}

