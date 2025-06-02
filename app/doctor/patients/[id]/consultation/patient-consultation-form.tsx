"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Stethoscope, Pill, FlaskConical, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createConsultationAction } from "./actions"
import { PatientExtended } from "@/lib/graphql/types/patient"
import { useRouter } from 'next/navigation';


type PatientConsultationFormProps = {
  patient: PatientExtended
}

type Medication = {
  name: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
}

export function PatientConsultationForm({ patient }: PatientConsultationFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("patient-info")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  
  // Form state
  const [formData, setFormData] = useState({
    reason: '',
    symptoms: '',
    examination: '',
    diagnosis: '',
    treatment: '',
    notes: '',
    labRequestReason: '',
    requestedTests: '',
    labNotes: '',
  });

  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "", duration: "", quantity: 1 },
  ])
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

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "", quantity: 1 }])
  }

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index))
    }
  }

  const updateMedication = (index: number, field: keyof Medication, value: string | number) => {
    const updated = medications.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    setMedications(updated)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formDataToSubmit = new FormData();
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSubmit.append(key, value);
      });
      
      // Add medications
      medications.forEach((medication, index) => {
        Object.entries(medication).forEach(([key, value]) => {
          formDataToSubmit.append(`medications.${index}.${key}`, value.toString());
        });
      });

      // Add priority
      formDataToSubmit.append('priority', priority);

      const result = await createConsultationAction(patient.id, formDataToSubmit);

      if (result && !result.success) {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive",
        })
      } else {
        router.push(`/doctor/patients/${patient.id}`)
      }
    } catch (error) {
      console.error("Error submitting consultation:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de la consultation.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const tabs = [
    { value: "patient-info", label: "Informations", icon: FileText },
    { value: "consultation", label: "Consultation", icon: Stethoscope },
    { value: "prescription", label: "Ordonnance", icon: Pill },
    { value: "lab-request", label: "Analyses", icon: FlaskConical },
  ]

  return (
    <div className="space-y-6">
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
                {patient.gender === "male" ? "Homme" : "Femme"}, {calculateAge(patient.dateOfBirth)} ans
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="patient-info" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Patient Info Tab - Doesn't need form state as it's read-only */}
          <TabsContent value="patient-info" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations médicales</CardTitle>
                <CardDescription>Informations médicales importantes du patient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Groupe sanguin</Label>
                  <p className="text-sm mt-1">{patient.bloodType || "Non renseigné"}</p>
                </div>

                <div>
                  <Label>Allergies</Label>
                  {patient.allergies && patient.allergies.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                      {patient.allergies.map((allergy, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-destructive" />
                          {allergy}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm mt-1">Aucune allergie connue</p>
                  )}
                </div>

                <div>
                  <Label>Médicaments actuels</Label>
                  {patient.medications && patient.medications.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                      {patient.medications.map((medication, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          {medication}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm mt-1">Aucun médicament en cours</p>
                  )}
                </div>

                <div>
                  <Label>Antécédents médicaux</Label>
                  <p className="text-sm mt-1 whitespace-pre-line">
                    {patient.medicalHistory || "Aucun antécédent médical renseigné"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consultation Tab */}
          <TabsContent value="consultation" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Détails de la consultation</CardTitle>
                <CardDescription>Informations sur la consultation actuelle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reason">Motif de consultation *</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Motif de la visite du patient"
                    className="min-h-[80px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="symptoms">Symptômes *</Label>
                  <Textarea
                    id="symptoms"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    placeholder="Symptômes rapportés par le patient"
                    className="min-h-[80px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="examination">Examen clinique *</Label>
                  <Textarea
                    id="examination"
                    name="examination"
                    value={formData.examination}
                    onChange={handleInputChange}
                    placeholder="Résultats de l'examen clinique"
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="diagnosis">Diagnostic *</Label>
                  <Textarea
                    id="diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Diagnostic établi"
                    className="min-h-[80px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="treatment">Traitement *</Label>
                  <Textarea
                    id="treatment"
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleInputChange}
                    placeholder="Traitement recommandé"
                    className="min-h-[80px]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes additionnelles</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Notes supplémentaires (optionnel)"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescription Tab */}
          <TabsContent value="prescription" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ordonnance</CardTitle>
                <CardDescription>Médicaments à prescrire (optionnel)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {medications.map((medication, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Médicament {index + 1}</h4>
                      {medications.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeMedication(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Nom du médicament</Label>
                        <Input
                          value={medication.name}
                          onChange={(e) => updateMedication(index, "name", e.target.value)}
                          placeholder="Nom du médicament"
                        />
                      </div>

                      <div>
                        <Label>Dosage</Label>
                        <Input
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                          placeholder="ex: 500mg"
                        />
                      </div>

                      <div>
                        <Label>Quantité</Label>
                        <Input
                          type="number"
                          value={medication.quantity}
                          onChange={(e) => updateMedication(index, "quantity", Number.parseFloat(e.target.value) || 1)}
                          placeholder="1"
                          min="1"
                          step="0.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Fréquence</Label>
                        <Select
                          value={medication.frequency}
                          onValueChange={(value) => updateMedication(index, "frequency", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner la fréquence" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1 fois par jour">1 fois par jour</SelectItem>
                            <SelectItem value="2 fois par jour">2 fois par jour</SelectItem>
                            <SelectItem value="3 fois par jour">3 fois par jour</SelectItem>
                            <SelectItem value="4 fois par jour">4 fois par jour</SelectItem>
                            <SelectItem value="Toutes les 4 heures">Toutes les 4 heures</SelectItem>
                            <SelectItem value="Toutes les 6 heures">Toutes les 6 heures</SelectItem>
                            <SelectItem value="Toutes les 8 heures">Toutes les 8 heures</SelectItem>
                            <SelectItem value="Toutes les 12 heures">Toutes les 12 heures</SelectItem>
                            <SelectItem value="Au besoin">Au besoin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Durée</Label>
                        <Select
                          value={medication.duration}
                          onValueChange={(value) => updateMedication(index, "duration", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner la durée" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3 jours">3 jours</SelectItem>
                            <SelectItem value="5 jours">5 jours</SelectItem>
                            <SelectItem value="7 jours">7 jours</SelectItem>
                            <SelectItem value="10 jours">10 jours</SelectItem>
                            <SelectItem value="14 jours">14 jours</SelectItem>
                            <SelectItem value="21 jours">21 jours</SelectItem>
                            <SelectItem value="1 mois">1 mois</SelectItem>
                            <SelectItem value="2 mois">2 mois</SelectItem>
                            <SelectItem value="3 mois">3 mois</SelectItem>
                            <SelectItem value="Jusqu'à amélioration">Jusqu'à amélioration</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addMedication} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un médicament
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Request Tab */}
          <TabsContent value="lab-request" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Demande d'analyses</CardTitle>
                <CardDescription>Analyses de laboratoire à demander (optionnel)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="labRequestReason">Motif de la demande</Label>
                  <Textarea
                    id="labRequestReason"
                    name="labRequestReason"
                    value={formData.labRequestReason}
                    onChange={handleInputChange}
                    placeholder="Motif de la demande d'analyses"
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="requestedTests">Analyses demandées</Label>
                  <Textarea
                    id="requestedTests"
                    name="requestedTests"
                    value={formData.requestedTests}
                    onChange={handleInputChange}
                    placeholder="Liste des analyses à effectuer"
                    className="min-h-[100px]"
                  />
                </div>
                <div>
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

                <div>
                  <Label htmlFor="labNotes">Notes pour le laboratoire</Label>
                  <Textarea
                    id="labNotes"
                    name="labNotes"
                    value={formData.labNotes}
                    onChange={handleInputChange}
                    placeholder="Instructions spéciales pour le laboratoire (optionnel)"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer la consultation"}
          </Button>
        </div>
      </form>
    </div>
  )
}