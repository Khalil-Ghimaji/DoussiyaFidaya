"use client"

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { ExportMedicalRecordForm } from "./export-form"

export default function ExportMedicalRecordPage() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/patient/medical-record">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au dossier médical
          </Link>
        </Button>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exporter mon dossier médical</h1>
            <p className="text-muted-foreground">
              Sélectionnez les sections et le format d'export de votre dossier médical
            </p>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Chargement du formulaire d'export...</p>
              </div>
            </div>
          }
        >
          <ExportMedicalRecordForm />
        </Suspense>
      </div>
    </div>
  )
}

