"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPrescriptionAction } from "./actions"
import { PatientExtended } from "@/lib/graphql/types/patient"


type PrescriptionFormProps = {
  patient: PatientExtended
}

type Medication = {
  name: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
}

export function PrescriptionForm({ patient }: PrescriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "", duration: "", quantity: 1 },
  ])
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toast } = useToast()

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "", quantity: 1 }])
  }

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedication = (index: number, field: keyof Medication, value: string | number) => {
    const updatedMedications = medications.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    setMedications(updatedMedications)
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
      formData.append("notes", notes)

      const result = await createPrescriptionAction(patient.id, formData)

      if (!result?.success) {
        toast({
          title: "Erreur",
          description: result?.message || "Une erreur est survenue lors de la création de l'ordonnance.",
          variant: "destructive",
        })
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

          {patient.allergies.length > 0 && (
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
          <div className="flex items-center justify-between">
            <CardTitle>Médicaments prescrits</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addMedication}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un médicament
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {errors.general && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{errors.general}</div>}

          {medications.map((medication, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Médicament {index + 1}</h4>
                {medications.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeMedication(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`medication-${index}-name`}>Nom du médicament</Label>
                  <Input
                    id={`medication-${index}-name`}
                    placeholder="Ex: Paracétamol"
                    value={medication.name}
                    onChange={(e) => updateMedication(index, "name", e.target.value)}
                  />
                  {errors[`medication-${index}-name`] && (
                    <p className="text-sm text-red-600">{errors[`medication-${index}-name`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`medication-${index}-dosage`}>Dosage</Label>
                  <Input
                    id={`medication-${index}-dosage`}
                    placeholder="Ex: 500mg"
                    value={medication.dosage}
                    onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                  />
                  {errors[`medication-${index}-dosage`] && (
                    <p className="text-sm text-red-600">{errors[`medication-${index}-dosage`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`medication-${index}-quantity`}>Quantité</Label>
                  <Input
                    id={`medication-${index}-quantity`}
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Ex: 30"
                    value={medication.quantity}
                    onChange={(e) => updateMedication(index, "quantity", Number.parseInt(e.target.value) || 1)}
                  />
                  {errors[`medication-${index}-quantity`] && (
                    <p className="text-sm text-red-600">{errors[`medication-${index}-quantity`]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`medication-${index}-frequency`}>Fréquence</Label>
                  <Select
                    value={medication.frequency}
                    onValueChange={(value) => updateMedication(index, "frequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la fréquence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1x/jour">1 fois par jour</SelectItem>
                      <SelectItem value="2x/jour">2 fois par jour</SelectItem>
                      <SelectItem value="3x/jour">3 fois par jour</SelectItem>
                      <SelectItem value="4x/jour">4 fois par jour</SelectItem>
                      <SelectItem value="au_besoin">Au besoin</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors[`medication-${index}-frequency`] && (
                    <p className="text-sm text-red-600">{errors[`medication-${index}-frequency`]}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`medication-${index}-duration`}>Durée</Label>
                  <Input
                    id={`medication-${index}-duration`}
                    placeholder="Ex: 7 jours"
                    value={medication.duration}
                    onChange={(e) => updateMedication(index, "duration", e.target.value)}
                  />
                  {errors[`medication-${index}-duration`] && (
                    <p className="text-sm text-red-600">{errors[`medication-${index}-duration`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
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
