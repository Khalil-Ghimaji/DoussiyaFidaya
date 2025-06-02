"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Trash2, AlertTriangle, Loader2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createLabRequestAction } from "./actions"
import { Label } from "@/components/ui/label"
import { PatientExtended } from "@/lib/graphql/types/patient"


type LabRequestFormProps = {
  patient: PatientExtended
  doctorId: string
}

export function LabRequestForm({ patient, doctorId }: LabRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tests, setTests] = useState([{ name: "", instructions: "" }])
  const [type, setType] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [fasting, setFasting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const addTest = () => {
    setTests([...tests, { name: "", instructions: "" }])
  }

  const removeTest = (index: number) => {
    if (tests.length > 1) {
      setTests(tests.filter((_, i) => i !== index))
    }
  }

  const handleTestChange = (index: number, field: "name" | "instructions", value: string) => {
    const updatedTests = [...tests]
    updatedTests[index][field] = value
    setTests(updatedTests)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Basic validation
    if (!type) {
      setError("Le type d'analyse est requis")
      setIsSubmitting(false)
      return
    }

    try {
      // Filter out empty tests
      const validTests = tests.filter((test) => test.name.trim() !== "")

      const formData = {
        type,
        description,
        priority,
        tests: validTests,
      }

      // Include fasting information in description if checked
      const fastingInfo = fasting ? "\n\nPatient à jeun requis." : ""
      formData.description = `${description}${fastingInfo}`

      // Call server action
      const result = await createLabRequestAction(patient.id, formData)

      if (!result.success) {
        throw new Error(result.error || "Une erreur est survenue")
      }

      toast({
        title: "Demande d'analyses envoyée",
        description: "La demande d'analyses a été envoyée avec succès.",
      })

      // Redirect to patient profile
      router.push(`/doctor/patients/${patient.id}`)
    } catch (error) {
      console.error("Error submitting lab request:", error)
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la demande d'analyses.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => router.push(`/doctor/patients/${patient.id}`)}
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={patient.profileImage || "/placeholder.svg?height=48&width=48"}
                alt={`${patient.firstName} ${patient.lastName}`}
              />
              <AvatarFallback>
                {patient.firstName[0]}
                {patient.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {patient.gender === "Male" ? "Homme" : "Femme"}, {calculateAge(patient.dateOfBirth)} ans
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-md">{error}</div>
        )}

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">
                Type d'analyse<span className="text-destructive">*</span>
              </Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionner un type d'analyse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blood">Analyse sanguine</SelectItem>
                  <SelectItem value="urine">Analyse d'urine</SelectItem>
                  <SelectItem value="imaging">Imagerie médicale</SelectItem>
                  <SelectItem value="pathology">Analyse pathologique</SelectItem>
                  <SelectItem value="microbiology">Microbiologie</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select value={priority} onValueChange={(value: "low" | "medium" | "high") => setPriority(value)}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Sélectionner une priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Motif de la demande</Label>
              <Textarea
                id="description"
                placeholder="Motif détaillé de la demande d'analyses"
                className="min-h-[80px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Analyses demandées</h3>
              <Button type="button" variant="outline" size="sm" onClick={addTest}>
                <Plus className="h-4 w-4 mr-2" /> Ajouter une analyse
              </Button>
            </div>

            {patient.allergies && patient.allergies.length > 0 && (
              <div className="bg-muted/50 p-3 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Allergies connues</p>
                  <p className="text-sm text-muted-foreground">{patient.allergies.join(", ")}</p>
                </div>
              </div>
            )}

            {tests.map((test, index) => (
              <div key={index} className="border rounded-md p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Analyse {index + 1}</h4>
                  {tests.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeTest(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`test-name-${index}`}>Nom de l'analyse</Label>
                  <Select value={test.name} onValueChange={(value) => handleTestChange(index, "name", value)}>
                    <SelectTrigger id={`test-name-${index}`}>
                      <SelectValue placeholder="Sélectionner une analyse" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blood_count">Numération Formule Sanguine (NFS)</SelectItem>
                      <SelectItem value="biochemistry">Bilan biochimique</SelectItem>
                      <SelectItem value="lipid_profile">Bilan lipidique</SelectItem>
                      <SelectItem value="thyroid">Bilan thyroïdien</SelectItem>
                      <SelectItem value="liver">Bilan hépatique</SelectItem>
                      <SelectItem value="kidney">Bilan rénal</SelectItem>
                      <SelectItem value="glucose">Glycémie à jeun</SelectItem>
                      <SelectItem value="hba1c">Hémoglobine glyquée (HbA1c)</SelectItem>
                      <SelectItem value="crp">Protéine C-réactive (CRP)</SelectItem>
                      <SelectItem value="urine">Analyse d'urine</SelectItem>
                      <SelectItem value="culture">Culture bactérienne</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`test-instructions-${index}`}>Instructions spécifiques</Label>
                  <Textarea
                    id={`test-instructions-${index}`}
                    placeholder="Instructions spécifiques pour cette analyse (optionnel)"
                    className="min-h-[80px]"
                    value={test.instructions}
                    onChange={(e) => handleTestChange(index, "instructions", e.target.value)}
                  />
                </div>
              </div>
            ))}

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="fasting" checked={fasting} onCheckedChange={(checked) => setFasting(checked === true)} />
              <Label htmlFor="fasting" className="font-normal">
                Patient à jeun requis
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/doctor/patients/${patient.id}`)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours...
              </>
            ) : (
              "Envoyer la demande"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
