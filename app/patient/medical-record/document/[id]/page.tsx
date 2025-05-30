import { Suspense } from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Printer, Share2, Loader2 } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchGraphQL } from "@/lib/server/graphql-client"
import { GET_MEDICAL_DOCUMENT } from "@/lib/server/patient-queries"
import { notFound } from "next/navigation"

// Using ISR with a 5-minute revalidation period for medical documents
export const revalidate = 300

async function MedicalDocumentContent({ documentId }: { documentId: string }) {
  try {
    const data = await fetchGraphQL<{
      medicalDocument: {
        id: string
        name: string
        type: string
        date: string
        doctor: {
          firstName: string
          lastName: string
        }
        specialty: string
        description: string
        notes: string
        url: string
      }
    }>(GET_MEDICAL_DOCUMENT, { documentId })

    if (!data.medicalDocument) {
      notFound()
    }

    const document = data.medicalDocument

    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/patient/medical-record">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au dossier médical
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{document.name}</h1>
            <p className="text-muted-foreground">
              {new Date(document.date).toLocaleDateString("fr-FR")} - {document.doctor.firstName}{" "}
              {document.doctor.lastName}
            </p>
          </div>
          <div className="flex gap-2">
            <ShareDocumentButton />
            <PrintDocumentButton />
            <Button variant="outline" asChild>
              <Link href={document.url} target="_blank" download>
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Aperçu du document</CardTitle>
              <CardDescription>Visualisation du document médical</CardDescription>
            </CardHeader>
            <CardContent>
              {document.type === "dicom" ? (
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Aperçu DICOM (Électrocardiogramme)</p>
                  {/* Dans une application réelle, vous utiliseriez une bibliothèque comme Cornerstone.js pour afficher les images DICOM */}
                  <div className="w-full h-full p-4">
                    <div className="w-full h-full bg-black rounded-md flex items-center justify-center">
                      <img
                        src="/placeholder.svg?height=400&width=600"
                        alt="Aperçu ECG"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              ) : document.type === "pdf" ? (
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Aperçu PDF</p>
                  {/* Dans une application réelle, vous utiliseriez une bibliothèque comme react-pdf pour afficher les PDFs */}
                  <div className="w-full h-full p-4">
                    <div className="w-full h-full bg-white rounded-md flex items-center justify-center border">
                      <img
                        src="/placeholder.svg?height=400&width=600"
                        alt="Aperçu PDF"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Aperçu du document</p>
                  <div className="w-full h-full p-4">
                    <div className="w-full h-full bg-white rounded-md flex items-center justify-center border">
                      <img
                        src="/placeholder.svg?height=400&width=600"
                        alt="Aperçu du document"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
              <CardDescription>Détails du document médical</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Type de document</h3>
                  <p>
                    {document.type === "dicom" ? "Image DICOM" : document.type === "pdf" ? "Document PDF" : "Document"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Date</h3>
                  <p>{new Date(document.date).toLocaleDateString("fr-FR")}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Médecin</h3>
                  <p>
                    {document.doctor.firstName} {document.doctor.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Spécialité</h3>
                  <p>{document.specialty}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                  <p>{document.description}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Notes</h3>
                  <p>{document.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  } catch (error) {
    console.error("Error fetching medical document:", error)
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/patient/medical-record">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au dossier médical
            </Link>
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-xl font-semibold mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">Impossible de charger le document médical.</p>
          <Button asChild>
            <Link href="/patient/medical-record">Retour au dossier médical</Link>
          </Button>
        </div>
      </>
    )
  }
}
// Client components for interactive features
;("use client")

import type React from "react"

function ShareDocumentButton() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSharing(true)

    // Simuler le partage
    setTimeout(() => {
      setIsSharing(false)
      setOpen(false)
      // In a real app, we would use a toast notification here
      alert(`Document partagé avec ${email}`)
      setEmail("")
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Partager
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleShare}>
          <DialogHeader>
            <DialogTitle>Partager le document</DialogTitle>
            <DialogDescription>Envoyez ce document par email à un médecin ou à vous-même</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse email du destinataire"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSharing}>
              {isSharing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Envoi en cours...
                </>
              ) : (
                "Envoyer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PrintDocumentButton() {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)

    // Simuler l'impression
    setTimeout(() => {
      setIsPrinting(false)
      // In a real app, we would use a toast notification here
      alert("Document envoyé à l'impression")
    }, 1500)
  }

  return (
    <Button variant="outline" onClick={handlePrint} disabled={isPrinting}>
      {isPrinting ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          Impression...
        </>
      ) : (
        <>
          <Printer className="mr-2 h-4 w-4" />
          Imprimer
        </>
      )}
    </Button>
  )
}

export default function MedicalDocumentPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement du document...</p>
            </div>
          </div>
        }
      >
        <MedicalDocumentContent documentId={params.id} />
      </Suspense>
    </div>
  )
}

