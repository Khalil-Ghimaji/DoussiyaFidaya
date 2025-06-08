"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Save, ArrowLeft, Upload, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createPrescriptionAction } from "./actions"
import { PatientExtended } from "@/lib/graphql/types/patient"
import { prescriptionOCRService } from './service'
import Image from 'next/image'

interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
}

interface PrescriptionFormProps {
  patient: PatientExtended
  onSubmit: (data: { medications: Medication[]; instructions: string }) => void
  initialData?: { medications: Medication[]; instructions: string }
}

export function PrescriptionForm({ patient, onSubmit, initialData }: PrescriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [medications, setMedications] = useState<Medication[]>(
      initialData?.medications || [{ name: '', dosage: '', frequency: '', duration: '', quantity: 1 }]
  )
  const [instructions, setInstructions] = useState(initialData?.instructions || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<{ medications: Medication[]; instructions: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', quantity: 1 }])
  }

  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const handleMedicationChange = (index: number, field: keyof Medication, value: string | number) => {
    const newMedications = [...medications]
    newMedications[index] = { ...newMedications[index], [field]: value }
    setMedications(newMedications)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    medications.forEach((med, index) => {
      if (!med.name.trim()) {
        newErrors[`medication-${index}-name`] = "Le nom du médicament est requis"
      }
      if (!med.dosage.trim()) {
        newErrors[`medication-${index}-dosage`] = "Le dosage est requis"
      }
      if (!med.frequency.trim()) {
        newErrors[`medication-${index}-frequency`] = "La fréquence est requise"
      }
      if (!med.duration.trim()) {
        newErrors[`medication-${index}-duration`] = "La durée est requise"
      }
      if (!med.quantity || med.quantity <= 0) {
        newErrors[`medication-${index}-quantity`] = "La quantité doit être supérieure à 0"
      }
    })

    const validMedications = medications.filter(
        (med) => med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim() && med.quantity > 0,
    )

    if (validMedications.length === 0) {
      newErrors.general = "Au moins un médicament complet doit être prescrit"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()

      // Add medications to form data
      medications.forEach((med, index) => {
        formData.append(`medications.${index}.name`, med.name)
        formData.append(`medications.${index}.dosage`, med.dosage)
        formData.append(`medications.${index}.frequency`, med.frequency)
        formData.append(`medications.${index}.duration`, med.duration)
        formData.append(`medications.${index}.quantity`, med.quantity.toString())
      })

      // Add notes
      formData.append("instructions", instructions)

      const result = await createPrescriptionAction(patient.id, formData)

      if (!result?.success) {
        toast({
          title: "Erreur",
          description: result?.message || "Une erreur est survenue lors de la création de l'ordonnance.",
          variant: "destructive",
        })
      } else {
        // Réinitialiser le formulaire après succès
        setMedications([{ name: '', dosage: '', frequency: '', duration: '', quantity: 1 }])
        setInstructions('')
        setErrors({})
      }
      // Success case is handled by redirect in server action
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('📝 Début du traitement du fichier')
    console.log('📁 Fichier sélectionné:', file.name)

    // Créer une prévisualisation de l'image
    const reader = new FileReader()
    reader.onloadend = () => {
      console.log('🖼️ Prévisualisation créée')
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploading(true)
    console.log('⏳ Début de l\'upload')

    try {
      console.log('📤 Envoi au service OCR')
      const formData = await prescriptionOCRService.uploadAndExtractPrescription(file)
      console.log('📥 Données reçues du service:', formData)

      setExtractedData(formData)
      console.log('✅ Données extraites mises à jour dans l\'état')

      toast({
        title: "Succès",
        description: "L'ordonnance a été analysée avec succès.",
      })
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload:', error)
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'ordonnance. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      console.log('🏁 Fin du processus d\'upload')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleConfirmUpload = () => {
    console.log('🔄 Début de la confirmation des données')
    if (extractedData) {
      console.log('📋 Données à confirmer:', extractedData)
      setMedications(extractedData.medications)
      setInstructions(extractedData.instructions)
      setPreviewImage(null)
      setExtractedData(null)
      console.log('✅ Données confirmées et appliquées au formulaire')
      toast({
        title: "Succès",
        description: "Les données ont été importées dans le formulaire.",
      })
    }
  }

  const handleCancelUpload = () => {
    setPreviewImage(null)
    setExtractedData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Nouvelle Ordonnance</h2>
            <p className="text-sm text-muted-foreground">
              Pour {patient.firstName} {patient.lastName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={handleUploadClick}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Chargement...' : 'Upload Ordonnance'}
            </Button>
            <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
            />
          </div>
        </div>

        {previewImage && extractedData && (
            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24">
                  <Image
                      src={previewImage}
                      alt="Prévisualisation de l'ordonnance"
                      fill
                      className="object-contain rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-2">Données extraites</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {extractedData.medications.length} médicaments trouvés
                  </p>
                  <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="default"
                        onClick={handleConfirmUpload}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirmer
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelUpload}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du patient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                <p className="text-lg font-semibold">
                  {patient.firstName} {patient.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de naissance</p>
                <p className="text-lg">{new Date(patient.dateOfBirth).toLocaleDateString("fr-FR")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Groupe sanguin</p>
                <p className="text-lg">{patient.bloodType}</p>
              </div>
            </div>

            {Array.isArray(patient.allergies) && patient.allergies.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Allergies connues</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                        <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm">
                    {allergy}
                  </span>
                    ))}
                  </div>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Medications */}
        <Card>
          <CardHeader>
            <CardTitle>Médicaments prescrits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {errors.general && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{errors.general}</div>}

            {medications.map((medication, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Médicament {index + 1}</h4>
                    {medications.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveMedication(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`name-${index}`}>Nom</Label>
                      <Input
                          id={`name-${index}`}
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`dosage-${index}`}>Dosage</Label>
                      <Input
                          id={`dosage-${index}`}
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`frequency-${index}`}>Fréquence</Label>
                      <Input
                          id={`frequency-${index}`}
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`duration-${index}`}>Durée</Label>
                      <Input
                          id={`duration-${index}`}
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`quantity-${index}`}>Quantité</Label>
                      <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="1"
                          value={medication.quantity}
                          onChange={(e) => handleMedicationChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </div>
            ))}

            <Button type="button" variant="outline" onClick={handleAddMedication}>
              Ajouter un médicament
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="instructions">Instructions Générales</Label>
              <Textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instructions générales pour le patient..."
                  className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Création en cours...
                </>
            ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Créer l'ordonnance
                </>
            )}
          </Button>
        </div>
      </form>
  )
}
