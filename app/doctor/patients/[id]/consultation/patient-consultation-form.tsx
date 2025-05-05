"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { FileText, Stethoscope, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Patient = {
  _id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  bloodType: string
  allergies: string[]
  medicalHistory: string
  medications: string[]
  profileImage: string
}

type PatientConsultationFormProps = {
  patient: Patient
}

// Define the form schema
const consultationFormSchema = z.object({
  reason: z.string().min(3, "Le motif doit contenir au moins 3 caractères"),
  symptoms: z.string().min(3, "Les symptômes doivent contenir au moins 3 caractères"),
  examination: z.string().min(3, "L'examen doit contenir au moins 3 caractères"),
  diagnosis: z.string().min(3, "Le diagnostic doit contenir au moins 3 caractères"),
  treatment: z.string().min(3, "Le traitement doit contenir au moins 3 caractères"),
  notes: z.string().optional(),
  followUp: z.boolean().default(false),
  followUpDate: z.string().optional(),
  labTests: z.boolean().default(false),
  prescription: z.boolean().default(false),
})

type ConsultationFormValues = z.infer<typeof consultationFormSchema>

export function PatientConsultationForm({ patient }: PatientConsultationFormProps) {
  const [activeTab, setActiveTab] = useState("consultation")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Initialize the form with default values
  const form = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      reason: "",
      symptoms: "",
      examination: "",
      diagnosis: "",
      treatment: "",
      notes: "",
      followUp: false,
      followUpDate: "",
      labTests: false,
      prescription: false,
    },
  })

  // Handle form submission
  const onSubmit = async (data: ConsultationFormValues) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("Consultation data to submit:", data)

      toast({
        title: "Consultation enregistrée",
        description: "La consultation a été enregistrée avec succès.",
      })

      // Handle follow-up actions
      if (data.prescription) {
        router.push(`/doctor/patients/${patient._id}/prescription`)
        return
      }

      if (data.labTests) {
        router.push(`/doctor/patients/${patient._id}/lab-request`)
        return
      }

      // Redirect to patient profile
      router.push(`/doctor/patients/${patient._id}`)
    } catch (error) {
      console.error("Error saving consultation:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de la consultation.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="consultation" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="consultation">
                <Stethoscope className="h-4 w-4 mr-2" />
                Consultation
              </TabsTrigger>
              <TabsTrigger value="patient-info">
                <FileText className="h-4 w-4 mr-2" />
                Informations patient
              </TabsTrigger>
              <TabsTrigger value="follow-up">
                <Activity className="h-4 w-4 mr-2" />
                Suivi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="consultation" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Détails de la consultation</CardTitle>
                  <CardDescription>Informations sur la consultation actuelle</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motif de consultation</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Motif de la visite du patient" className="min-h-[80px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symptômes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Symptômes rapportés par le patient"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="examination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Examen clinique</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Résultats de l'examen clinique" className="min-h-[100px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnostic</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Diagnostic établi" className="min-h-[80px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="treatment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Traitement</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Traitement recommandé" className="min-h-[80px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes additionnelles</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Notes supplémentaires (optionnel)"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

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

            <TabsContent value="follow-up" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Suivi et actions</CardTitle>
                  <CardDescription>Définir les actions de suivi pour ce patient</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="followUp"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Programmer un rendez-vous de suivi</FormLabel>
                          <FormDescription>Cochez cette case si le patient doit revenir pour un suivi</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {form.watch("followUp") && (
                    <FormField
                      control={form.control}
                      name="followUpDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date de suivi</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Separator />

                  <FormField
                    control={form.control}
                    name="prescription"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Créer une ordonnance</FormLabel>
                          <FormDescription>
                            Cochez cette case pour créer une ordonnance après l'enregistrement de la consultation
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="labTests"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Demander des analyses</FormLabel>
                          <FormDescription>
                            Cochez cette case pour créer une demande d'analyses après l'enregistrement de la
                            consultation
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/doctor/patients/${patient._id}`)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer la consultation"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

