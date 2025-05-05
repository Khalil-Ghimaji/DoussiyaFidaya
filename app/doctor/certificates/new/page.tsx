"use client"

import { Suspense } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { NewCertificateForm } from "./certificate-form"

export default function NewMedicalCertificatePage() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/doctor/certificates">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux certificats
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Nouveau certificat médical</CardTitle>
            <CardDescription>Créez un certificat médical pour un patient</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="flex justify-center items-center py-10">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Chargement du formulaire...</p>
                  </div>
                </div>
              }
            >
              <NewCertificateForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

