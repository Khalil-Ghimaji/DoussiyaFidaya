"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Trash2, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Patient = {
  _id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  bloodType: string
  allergies: string[]
  profileImage: string
}

type PatientLabRequestFormProps = {
  patient: Patient
}

// Define the form schema
const labRequestFormSchema = z.object({
  laboratory: z.string({
    required_error: "Veuillez sélectionner un laboratoire",
  }),
  priority: z.string().default("normal"),
  reason: z.string().min(3, "Le motif doit contenir au moins 3 caractères"),
  clinicalInfo: z.string().optional(),
  tests: z
    .array(
      z.object({
        name: z.string().min(1, "Le nom de l'analyse est requis"),
        instructions: z.string().optional(),
      }),
    )
    .min(1, "Au moins une analyse doit être demandée"),
  notes: z.string().optional(),
  fasting: z.boolean().default(false),
  urgent: z.boolean().default(false),
})

type LabRequestFormValues = z.infer<typeof labRequestFormSchema>

export function LabRequestForm({ patient }: PatientLabRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Initialize the form with default values
  const form = useForm<LabRequestFormValues>({
    resolver: zodResolver(labRequestFormSchema),
    defaultValues: {
      laboratory: "",
      priority: "normal",
      reason: "",
      clinicalInfo: "",
      tests: [{ name: "", instructions: "" }],
      notes: "",
      fasting: false,
      urgent: false,
    },
  })

  // Handle form submission
  const onSubmit = async (data: LabRequestFormValues) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("Lab request data to submit:", data)

      toast({
        title: "Demande d'analyses envoyée",
        description: "La demande d'analyses a été envoyée avec succès.",
      })

      // Redirect to patient profile
      router.push(`/doctor/patients/${patient._id}`)
    } catch (error) {
      console.error("Error sending lab request:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de la demande d'analyses.",
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

  const addTest = () => {
    const currentTests = form.getValues("tests")
    form.setValue("tests", [...currentTests, { name: "", instructions: "" }])
  }

  const removeTest = (index: number) => {
    const currentTests = form.getValues("tests")
    if (currentTests.length > 1) {
      form.setValue(
        "tests",
        currentTests.filter((_, i) => i !== index),
      )
    }
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>Informations de base pour la demande d'analyses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="laboratory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Laboratoire</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un laboratoire" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lab1">Laboratoire Central</SelectItem>
                          <SelectItem value="lab2">Laboratoire Médical Plus</SelectItem>
                          <SelectItem value="lab3">Centre d'Analyses Biomédicales</SelectItem>
                          <SelectItem value="lab4">Laboratoire Régional</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorité</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une priorité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="normal">Normale</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                          <SelectItem value="immediate">Immédiate</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motif de la demande</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Motif de la demande d'analyses" className="min-h-[80px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clinicalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Informations cliniques</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informations cliniques pertinentes (optionnel)"
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

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Analyses demandées</CardTitle>
                  <CardDescription>Liste des analyses à effectuer</CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addTest}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une analyse
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.allergies && patient.allergies.length > 0 && (
                <div className="bg-muted/50 p-3 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Allergies connues</p>
                    <p className="text-sm text-muted-foreground">{patient.allergies.join(", ")}</p>
                  </div>
                </div>
              )}

              {form.getValues("tests").map((_, index) => (
                <div key={index} className="border rounded-md p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Analyse {index + 1}</h4>
                    {form.getValues("tests").length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeTest(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name={`tests.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l'analyse</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une analyse" />
                            </SelectTrigger>
                          </FormControl>
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
                            <SelectItem value="other">Autre (préciser dans les instructions)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`tests.${index}.instructions`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions spécifiques</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Instructions spécifiques pour cette analyse (optionnel)"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Options supplémentaires</CardTitle>
              <CardDescription>Options additionnelles pour la demande d'analyses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes pour le laboratoire</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes supplémentaires pour le laboratoire (optionnel)"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <FormField
                  control={form.control}
                  name="fasting"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>À jeun</FormLabel>
                        <FormDescription>Le patient doit être à jeun pour ces analyses</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urgent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Résultats urgents</FormLabel>
                        <FormDescription>Les résultats sont requis en urgence</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/doctor/patients/${patient._id}`)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

