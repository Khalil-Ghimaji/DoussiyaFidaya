import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { executeGraphQL } from "@/lib/graphql-client"
import { GET_PRESCRIPTION_BY_ID } from "@/lib/graphql/queries/prescriptions"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { updatePrescription } from "@/actions/prescription-actions"

// Loading component for Suspense
function EditPrescriptionLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 bg-muted animate-pulse rounded"></div>
      <div className="h-[600px] bg-muted animate-pulse rounded"></div>
    </div>
  )
}
// Client component for the form
;("use client")
import { useState } from "react"
import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Plus, Trash, Upload, FileText, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FileUpload } from "@/components/file-upload"
import { Switch } from "@/components/ui/switch"

function EditPrescriptionForm({ prescription }: { prescription: any }) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string } | null>(null)
  const [isSigned, setIsSigned] = useState(prescription.isSigned)

  // Initialize state with prescription data
  const [medications, setMedications] = useState(
    prescription.medications.map((med: any, index: number) => ({
      id: index + 1,
      name: med.name || "",
      dosage: med.dosage || "",
      frequency: med.frequency || "",
      duration: med.duration || "",
      quantity: med.quantity || "",
    })),
  )

  const [instructions, setInstructions] = useState(prescription.instructions || "")
  const [renewals, setRenewals] = useState(prescription.renewals || "0")
  const [validity, setValidity] = useState(prescription.validity || "3")

  const addMedication = () => {
    setMedications([
      ...medications,
      { id: Date.now(), name: "", dosage: "", frequency: "", duration: "", quantity: "" },
    ])
  }

  const removeMedication = (id: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((med) => med.id !== id))
    }
  }

  const updateMedication = (id: number, field: string, value: string) => {
    setMedications(medications.map((med) => (med.id === id ? { ...med, [field]: value } : med)))
  }

  const handleFileUpload = (file: File) => {
    setUploadedFile({
      name: file.name,
      type: file.type,
    })
    setIsUploaded(true)
    setShowUpload(false)
    toast({
      title: "Fichier téléchargé",
      description: `Le fichier ${file.name} a été téléchargé avec succès`,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!isUploaded) {
      const isValid = medications.every((med) => med.name.trim() !== "")
      if (!isValid) {
        toast({
          title: "Formulaire incomplet",
          description: "Veuillez remplir au moins le nom de chaque médicament",
          variant: "destructive",
        })
        return
      }
    }

    if (!isSigned) {
      toast({
        title: "Signature manquante",
        description: "Veuillez signer électroniquement l'ordonnance avant de l'enregistrer",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Prepare form data for server action
      const formData = new FormData()
      formData.append("patientId", prescription.patient._id)
      formData.append("date", prescription.date)

      // Clean medications data for submission (remove id which is only for UI)
      const cleanedMedications = medications.map(({ id, ...rest }) => rest)
      formData.append("medications", JSON.stringify(cleanedMedications))

      formData.append("instructions", instructions)
      formData.append("renewals", renewals)
      formData.append("validity", validity)
      formData.append("isSigned", isSigned.toString())

      // Call the server action
      await updatePrescription(prescription._id, formData)

      toast({
        title: "Ordonnance modifiée",
        description: "L'ordonnance a été modifiée avec succès",
      })
    } catch (error) {
      console.error("Error updating prescription:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification de l'ordonnance",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modifier l'ordonnance</h1>
          <p className="text-muted-foreground">
            Patient: {prescription.patient.firstName} {prescription.patient.lastName} - {prescription.patient.age} ans
          </p>
        </div>
        <div className="flex gap-2">
          {!isUploaded && (
            <Button variant="outline" onClick={() => setShowUpload(!showUpload)}>
              <Upload className="mr-2 h-4 w-4" />
              {showUpload ? "Masquer" : "Télécharger une ordonnance"}
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </div>
      </div>

      {showUpload && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Télécharger une ordonnance</CardTitle>
            <CardDescription>
              Téléchargez une image ou un PDF de l'ordonnance au lieu de la saisir manuellement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload onUpload={handleFileUpload} acceptedFileTypes=".jpg,.jpeg,.png,.pdf" maxSizeMB={5} />
          </CardContent>
        </Card>
      )}

      {isUploaded && uploadedFile && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ordonnance téléchargée</CardTitle>
            <CardDescription>L'ordonnance a été téléchargée avec succès</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 border rounded-md">
              <div className="bg-primary/10 p-3 rounded-md">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">{uploadedFile.type}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsUploaded(false)
                  setUploadedFile(null)
                }}
              >
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        {!isUploaded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Médicaments</CardTitle>
                <CardDescription>Modifiez les médicaments prescrits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {medications.map((medication, index) => (
                  <div key={medication.id} className="space-y-4 border rounded-md p-4 relative">
                    {medications.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-destructive"
                        onClick={() => removeMedication(medication.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`medication-${index}`}>Médicament</Label>
                        <Input
                          id={`medication-${index}`}
                          value={medication.name}
                          onChange={(e) => updateMedication(medication.id, "name", e.target.value)}
                          placeholder="Nom du médicament"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`dosage-${index}`}>Dosage</Label>
                        <Input
                          id={`dosage-${index}`}
                          value={medication.dosage}
                          onChange={(e) => updateMedication(medication.id, "dosage", e.target.value)}
                          placeholder="Ex: 500mg, 5ml, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`frequency-${index}`}>Fréquence</Label>
                        <Input
                          id={`frequency-${index}`}
                          value={medication.frequency}
                          onChange={(e) => updateMedication(medication.id, "frequency", e.target.value)}
                          placeholder="Ex: 1 comprimé 3 fois par jour"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`duration-${index}`}>Durée</Label>
                        <Input
                          id={`duration-${index}`}
                          value={medication.duration}
                          onChange={(e) => updateMedication(medication.id, "duration", e.target.value)}
                          placeholder="Ex: 7 jours, 1 mois, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`quantity-${index}`}>Quantité</Label>
                        <Input
                          id={`quantity-${index}`}
                          value={medication.quantity}
                          onChange={(e) => updateMedication(medication.id, "quantity", e.target.value)}
                          placeholder="Ex: 30 comprimés, 1 boîte, etc."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addMedication} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un médicament
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                  <CardDescription>Modifiez les instructions supplémentaires</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes et instructions</Label>
                    <Textarea
                      id="notes"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Instructions particulières pour le patient ou le pharmacien..."
                      className="min-h-[150px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="renewals">Renouvellements</Label>
                    <Select value={renewals} onValueChange={setRenewals}>
                      <SelectTrigger id="renewals">
                        <SelectValue placeholder="Nombre de renouvellements" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0 - Non renouvelable</SelectItem>
                        <SelectItem value="1">1 fois</SelectItem>
                        <SelectItem value="2">2 fois</SelectItem>
                        <SelectItem value="3">3 fois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="validity">Validité</Label>
                    <Select value={validity} onValueChange={setValidity}>
                      <SelectTrigger id="validity">
                        <SelectValue placeholder="Durée de validité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 mois</SelectItem>
                        <SelectItem value="3">3 mois</SelectItem>
                        <SelectItem value="6">6 mois</SelectItem>
                        <SelectItem value="12">12 mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Signature électronique</CardTitle>
            <CardDescription>Signez électroniquement l'ordonnance pour la valider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${isSigned ? "bg-green-100" : "bg-muted"}`}>
                  {isSigned ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {isSigned ? "Document signé électroniquement" : "Signature électronique"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isSigned
                      ? `Signé le ${new Date().toLocaleDateString()} par Dr. Karim Malouli`
                      : "Veuillez signer électroniquement ce document pour le valider"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="sign" checked={isSigned} onCheckedChange={setIsSigned} />
                <Label htmlFor="sign" className="cursor-pointer">
                  {isSigned ? "Signé" : "Signer"}
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  )
}

// Server component that fetches data and renders the form
async function EditPrescriptionContent({ prescriptionId }: { prescriptionId: string }) {
  const session = await auth()

  if (!session?.user || session.user.role !== "doctor") {
    return <div className="text-center p-4">Accès non autorisé</div>
  }

  try {
    const data = await executeGraphQL(GET_PRESCRIPTION_BY_ID, { prescriptionId }, true)
    const prescription = data.prescription

    if (!prescription) {
      notFound()
    }

    return <EditPrescriptionForm prescription={prescription} />
  } catch (error) {
    console.error("Error fetching prescription:", error)
    return (
      <div className="text-center p-4 text-destructive">Une erreur est survenue lors du chargement de l'ordonnance</div>
    )
  }
}

export default function EditPrescriptionPage({ params }: { params: { id: string } }) {
  const prescriptionId = params.id

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/doctor/prescriptions/${prescriptionId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux détails de l'ordonnance
          </Link>
        </Button>
      </div>

      <Suspense fallback={<EditPrescriptionLoading />}>
        <EditPrescriptionContent prescriptionId={prescriptionId} />
      </Suspense>
    </div>
  )
}

