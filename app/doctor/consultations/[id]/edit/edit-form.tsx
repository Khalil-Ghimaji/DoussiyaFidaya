"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import VitalSignsForm from "@/components/doctor/vital-signs-form"
import PrescriptionForm from "@/components/doctor/prescription-form"
import LabRequestForm from "@/components/doctor/lab-request-form"
import { useToast } from "@/hooks/use-toast"
import { updateConsultation } from "@/app/doctor/actions"

// Define the consultation type
type Consultation = {
  _id: string
  date: string
  time: string
  duration: number
  reason: string
  notes: string
  diagnosis: string
  createdBy: string
  createdAt: string
  updatedAt: string
  vitalSigns: {
    bloodPressure: string
    heartRate: string
    temperature: string
    respiratoryRate: string
    oxygenSaturation: string
    weight: string
  }
  prescriptions: {
    _id: string
    name: string
    dosage: string
    frequency: string
    duration: string
    quantity: string
  }[]
  labRequests: {
    _id: string
    type: string
    priority: string
    laboratory: string
    status: string
    resultId: string
  }[]
  patient: {
    _id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    bloodType: string
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
        _id: z.string().optional(),
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
        _id: z.string().optional(),
        type: z.string().min(1, "Le type d'analyse est requis"),
        priority: z.string().min(1, "La priorité est requise"),
        description: z.string().min(1, "La description est requise"),
        laboratory: z.string().optional(),
        status: z.string().optional(),
        resultId: z.string().optional(),
      }),
    )
    .optional(),
})

export function EditConsultationForm({ consultation }: { consultation: Consultation }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: consultation.reason || "",
      notes: consultation.notes || "",
      diagnosis: consultation.diagnosis || "",
      vitalSigns: consultation.vitalSigns || {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        respiratoryRate: "",
        oxygenSaturation: "",
        weight: "",
      },
      prescriptions: consultation.prescriptions || [],
      labRequests: consultation.labRequests || [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      console.log("i arrived here in the form")
      const result = await updateConsultation(consultation._id, consultation.patient._id, values)
      console.log("this is theresult", result)
      if (result.success) {
        toast({
          title: "Consultation mise à jour",
          description: "La consultation a été mise à jour avec succès.",
        })
        router.push(`/doctor/consultations/${consultation._id}`)
        router.refresh()
      } else {
        throw new Error(result.message || "Une erreur est survenue")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la consultation. Veuillez réessayer.",
        variant: "destructive",
      })
      console.log("i arrived here in the form catch")
      console.error("Error updating consultation:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/doctor/consultations/${consultation._id}`)}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </Form>
  )
}

