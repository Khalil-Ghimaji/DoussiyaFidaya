"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, Trash, Upload, FileText, Check } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { FileUpload } from "@/components/file-upload"
import { Switch } from "@/components/ui/switch"

export default function RenewPrescriptionPage({ params }: { params: { id: string } }) {
  const prescriptionId = params.id
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string } | null>(null)
  const [isSigned, setIsSigned] = useState(false)

  // Exemple de données de prescription (dans une application réelle, ces données seraient chargées depuis une API)
  const [prescription, setPrescription] = useState({
    id: prescriptionId,
    patient: {
      id: "101",
      name: "Ahmed Ben Salem",
      birthDate: "15/05/1985",
      age: 38,
    },
    date: "2023-03-15",
    expiryDate: "2023-06-15",
    medications: [
      {
        id: 1,
        name: "Amlodipine",
        dosage: "5mg",
        frequency: "1 comprimé par jour",
        duration: "3 mois",
        quantity: "90",
      },
      {
        id: 2,
        name: "Aspirine",
        dosage: "100mg",
        frequency: "1 comprimé par jour",
        duration: "3 mois",
        quantity: "90",
      },
    ],
    instructions: "Prendre les médicaments après le repas. Éviter la consommation d'alcool.",
    status: "active",
    isSigned: true,
    renewals: "0",
    validity: "3",
  })

  const addMedication = () => {
    setPrescription({
      ...prescription,
      medications: [
        ...prescription.medications,
        { id: Date.now(), name: "", dosage: "", frequency: "", duration: "", quantity: "" },
      ],
    })
  }

  const removeMedication = (id: number) => {
    if (prescription.medications.length > 1) {
      setPrescription({
        ...prescription,
        medications: prescription.medications.filter((med) => med.id !== id),
      })
    }
  }

  const updateMedication = (id: number, field: string, value: string) => {
    setPrescription({
      ...prescription,
      medications: prescription.medications.map((med) => (med.id === id ? { ...med, [field]: value } : med)),
    })
  }

  const updateInstructions = (value: string) => {
    setPrescription({
      ...prescription,
      instructions: value,
    })
  }

  const updateField = (field: string, value: string) => {
    setPrescription({
      ...prescription,
      [field]: value,
    })
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Si une ordonnance a été téléchargée, pas besoin de vérifier les médicaments
    if (!isUploaded) {
      // Vérifier si tous les médicaments ont au moins un nom
      const isValid = prescription.medications.every((med) => med.name.trim() !== "")

      if (!isValid) {
        toast({
          title: "Formulaire incomplet",
          description: "Veuillez remplir au moins le nom de chaque médicament",
          variant: "destructive",
        })
        return
      }
    }

    // Vérifier si l'ordonnance est signée
    if (!isSigned) {
      toast({
        title: "Signature manquante",
        description: "Veuillez signer électroniquement l'ordonnance avant de l'enregistrer",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    // Simuler l'envoi de l'ordonnance
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Ordonnance renouvelée",
        description: "L'ordonnance a été renouvelée avec succès",
      })
      router.push("/doctor/prescriptions")
    }, 1500)
  }

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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Renouveler l'ordonnance</h1>
          <p className="text-muted-foreground">
            Patient: {prescription.patient.name} - {prescription.patient.age} ans
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
                Renouveler l'ordonnance
              </>
            )}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informations sur le renouvellement</CardTitle>
          <CardDescription>
            Vous êtes sur le point de renouveler une ordonnance existante. Vous pouvez modifier les médicaments et les
            instructions si nécessaire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md">
            <p>
              <span className="font-medium">Ordonnance d'origine:</span> Créée le{" "}
              {new Date(prescription.date).toLocaleDateString("fr-FR")}
            </p>
            <p>
              <span className="font-medium">Expiration:</span>{" "}
              {new Date(prescription.expiryDate).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </CardContent>
      </Card>

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
                <CardDescription>Vérifiez et modifiez les médicaments si nécessaire</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {prescription.medications.map((medication, index) => (
                  <div key={medication.id} className="space-y-4 border rounded-md p-4 relative">
                    {prescription.medications.length > 1 && (
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
                  <CardDescription>Vérifiez et modifiez les instructions si nécessaire</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes et instructions</Label>
                    <Textarea
                      id="notes"
                      value={prescription.instructions}
                      onChange={(e) => updateInstructions(e.target.value)}
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
                    <Select value={prescription.renewals} onValueChange={(value) => updateField("renewals", value)}>
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
                    <Select value={prescription.validity} onValueChange={(value) => updateField("validity", value)}>
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
                  Renouveler l'ordonnance
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

