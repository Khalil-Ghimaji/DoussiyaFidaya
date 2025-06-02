"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useToast } from "@/hooks/use-toast"
import { createConsultation } from "@/app/doctor/actions"

// Define the appointment type
type Appointment = {
  _id: string
  date: string
  time: string
  duration: number
  status: string
  reason: string
  notes: string
  patient: {
    _id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    bloodType: string
    allergies: string[]
    profileImage: string
  }
  doctor: {
    _id: string
    firstName: string
    lastName: string
    speciality: string
  }
}

// Define form schema
const formSchema = z.object({
  reason: z.string().min(3, "Le motif doit comporter au moins 3 caractères"),
  notes: z.string().optional(),
  diagnosis: z.string().min(3, "Le diagnostic doit comporter au moins 3 caractères"),
  vitalSigns: z.object({
    bloodPressure: z.string().optional(),
    heartRate: z.string().optional(),
    temperature: z.string().optional(),
    respiratoryRate: z.string().optional(),
    oxygenSaturation: z.string().optional(),
    weight: z.string().optional(),
  }),
  prescriptions: z
    .array(
      z.object({
        name: z.string().min(1, "Le nom du médicament est requis"),
        dosage: z.string().min(1, "La posologie est requise"),
        frequency: z.string().min(1, "La fréquence est requise"),
        duration: z.string().min(1, "La durée est requise"),
        quantity: z.string().min(1, "La quantité est requise"),
      }),
    )
    .optional(),
  labRequests: z
    .array(
      z.object({
        type: z.string().min(1, "Le type d'analyse est requis"),
        priority: z.string().min(1, "La priorité est requise"),
        laboratory: z.string().optional(),
      }),
    )
    .optional(),
})

export function ConsultationForm({ appointment }: { appointment: Appointment }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: appointment.reason || "",
      notes: appointment.notes || "",
      diagnosis: "",
      vitalSigns: {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        weight: "",
      },
      prescriptions: [],
      labRequests: [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const consultationData = {
        appointmentId: appointment._id,
        patientId: appointment.patient._id,
        doctorId: appointment.doctor._id,
        ...values,
      }

      const result = await createConsultation(consultationData)

      if (result.success) {
        toast({
          title: "Consultation enregistrée",
          description: "La consultation a été enregistrée avec succès.",
        })
        router.push("/doctor/consultations")
      } else {
        throw new Error(result.message || "Une erreur est survenue")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la consultation. Veuillez réessayer.",
        variant: "destructive",
      })
      console.error("Error creating consultation:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle consultation</CardTitle>
        <CardDescription>
          Rendez-vous du {new Date(appointment.date).toLocaleDateString("fr-FR")} à {appointment.time}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motif de consultation</FormLabel>
                    <FormControl>
                      <Input placeholder="Motif de la consultation..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Tabs defaultValue="main" className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="main">Principal</TabsTrigger>
                  <TabsTrigger value="vital-signs">Signes vitaux</TabsTrigger>
                  <TabsTrigger value="prescriptions">Ordonnances</TabsTrigger>
                  <TabsTrigger value="lab-requests">Analyses</TabsTrigger>
                </TabsList>

                <TabsContent value="main" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnostic</FormLabel>
                        <FormControl>
                          <Input placeholder="Diagnostic..." {...field} />
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
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Notes supplémentaires..." className="min-h-[150px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="vital-signs">
                  <VitalSignsForm form={form} />
                </TabsContent>

                <TabsContent value="prescriptions">
                  <PrescriptionForm form={form} />
                </TabsContent>

                <TabsContent value="lab-requests">
                  <LabRequestForm form={form} />
                </TabsContent>
              </Tabs>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer la consultation
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

