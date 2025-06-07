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
import { gql } from "@apollo/client"
import { fetchGraphQL } from "@/lib/graphql-client"

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

const CREATE_CONSULTATION_WITH_PRESCRIPTION = gql`
  mutation CreateConsultationWithPrescription(
    $patientId: String!
    $doctorId: String!
    $prescriptionId: String!
    $date: DateTimeISO!
    $section: String
    $measures: JSON
    $notes: ConsultationsCreatenotesInput
  ) {
    createOneConsultations(
      data: {
        patients: { connect: { id: $patientId } }
        doctors: { connect: { id: $doctorId } }
        prescriptions: { connect: { id: $prescriptionId } }
        date: $date
        section: $section
        measures: $measures
        notes: $notes
      }
    ) {
      id
      date
      section
      measures
      notes
    }
  }
`

const CREATE_CONSULTATION_WITHOUT_PRESCRIPTION = gql`
  mutation CreateConsultationWithoutPrescription(
    $patientId: String!
    $doctorId: String!
    $date: DateTimeISO!
    $section: String
    $measures: JSON
    $notes: ConsultationsCreatenotesInput
  ) {
    createOneConsultations(
      data: {
        patients: { connect: { id: $patientId } }
        doctors: { connect: { id: $doctorId } }
        date: $date
        section: $section
        measures: $measures
        notes: $notes
      }
    ) {
      id
      date
      section
      measures
      notes
    }
  }
`

const CREATE_PRESCRIPTION = gql`
  mutation CreatePrescription(
    $patientId: String!
    $doctorId: String!
    $medications: [MedicationInput!]!
    $date: DateTimeISO!
  ) {
    createOnePrescriptions(
      data: {
        patients: { connect: { id: $patientId } }
        doctors: { connect: { id: $doctorId } }
        medications: $medications
        date: $date
      }
    ) {
      id
    }
  }
`

const CREATE_LAB_REQUEST = gql`
  mutation CreateLabRequest(
    $patientId: String!
    $doctorId: String!
    $type: String!
    $description: String
    $priority: lab_requests_priority_enum
  ) {
    createOneLab_requests(
      data: {
        patients: { connect: { id: $patientId } }
        doctors: { connect: { id: $doctorId } }
        type: $type
        description: $description
        priority: $priority
      }
    ) {
      id
    }
  }
`

// Define the form schema
const formSchema = z.object({
  reason: z.string().min(3, "Le motif doit comporter au moins 3 caractères"),
  symptoms: z.string().min(3, "Les symptômes doivent être décrits"),
  examination: z.string().min(3, "L'examen clinique doit être décrit"),
  diagnosis: z.string().min(3, "Le diagnostic doit être spécifié"),
  treatment: z.string().min(3, "Le traitement doit être spécifié"),
  notes: z.string().optional(),
  prescriptions: z.array(
    z.object({
      name: z.string().min(1, "Le nom du médicament est requis"),
      dosage: z.string().min(1, "La posologie est requise"),
      frequency: z.string().min(1, "La fréquence est requise"),
      duration: z.string().min(1, "La durée est requise"),
      quantity: z.string().min(1, "La quantité est requise"),
    })
  ).optional(),
  labRequest: z.object({
    reason: z.string().optional(),
    requestedTests: z.string().optional(),
    notes: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
  }).optional(),
})

// Define GraphQL response types
type PrescriptionData = {
  createOnePrescriptions: {
    id: string
  } | null
}

type ConsultationData = {
  createOneConsultations: {
    id: string
    date: string
    section: string
    measures: any
    notes: string[]
  } | null
}

type LabRequestData = {
  createOneLab_requests: {
    id: string
  } | null
}

type LinkLabRequestData = {
  updateOneConsultations: {
    id: string
  } | null
}

// VitalSigns Form Component
function VitalSignsForm({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="vitalSigns.bloodPressure"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tension artérielle</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 120/80 mmHg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="vitalSigns.heartRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fréquence cardiaque</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 75 bpm" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="vitalSigns.temperature"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Température</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 37.2 °C" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="vitalSigns.respiratoryRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fréquence respiratoire</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 16 rpm" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="vitalSigns.oxygenSaturation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Saturation en oxygène</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 98%" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="vitalSigns.weight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Poids</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 70 kg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

// Prescription Form Component
function PrescriptionForm({ form }: { form: any }) {
  const [prescriptions, setPrescriptions] = useState<Array<any>>([])

  const addPrescription = () => {
    setPrescriptions([...prescriptions, {}])
    const currentPrescriptions = form.getValues("prescriptions") || []
    form.setValue("prescriptions", [...currentPrescriptions, {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: ""
    }])
  }

  return (
    <div className="space-y-4">
      {prescriptions.map((_, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name={`prescriptions.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du médicament</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du médicament" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`prescriptions.${index}.dosage`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posologie</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 500mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`prescriptions.${index}.frequency`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fréquence</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 3 fois par jour" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`prescriptions.${index}.duration`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 7 jours" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`prescriptions.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1 boîte" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={addPrescription}>
        Ajouter un médicament
      </Button>
    </div>
  )
}

// Lab Request Form Component
function LabRequestForm({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="labRequest.reason"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Motif de l'analyse</FormLabel>
            <FormControl>
              <Input placeholder="Motif de l'analyse..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="labRequest.requestedTests"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tests demandés</FormLabel>
            <FormControl>
              <Textarea placeholder="Liste des tests demandés..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="labRequest.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes pour le laboratoire</FormLabel>
            <FormControl>
              <Textarea placeholder="Notes supplémentaires..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="labRequest.priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Priorité</FormLabel>
            <FormControl>
              <select {...field} className="w-full p-2 border rounded">
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export function ConsultationForm({ appointment }: { appointment: Appointment }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      symptoms: "",
      examination: "",
      diagnosis: "",
      treatment: "",
      notes: "",
      prescriptions: [],
      labRequest: {
        reason: "",
        requestedTests: "",
        notes: "",
        priority: "medium"
      }
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Step 1: Create prescription if medications exist
      let prescriptionId: string | undefined = undefined
      if (values.prescriptions && values.prescriptions.length > 0) {
        const response = await fetchGraphQL<PrescriptionData>(CREATE_PRESCRIPTION, {
          patientId: appointment.patient._id,
          doctorId: appointment.doctor._id,
          medications: values.prescriptions,
          date: new Date().toISOString()
        })

        if (response.data.createOnePrescriptions?.id) {
          prescriptionId = response.data.createOnePrescriptions.id
        }
      }

      // Step 2: Prepare consultation notes
      const consultationNotes = [
        `Motif: ${values.reason}`,
        `Symptômes: ${values.symptoms}`,
        `Examen clinique: ${values.examination}`,
        `Diagnostic: ${values.diagnosis}`,
        `Traitement: ${values.treatment}`,
        ...(values.notes ? [`Notes: ${values.notes}`] : [])
      ]

      // Step 3: Create consultation
      const baseConsultationData = {
        patientId: appointment.patient._id,
        doctorId: appointment.doctor._id,
        date: new Date().toISOString(),
        section: 'Consultation médicale',
        measures: { treatment: `Traitement: ${values.treatment}` },
        notes: { set: consultationNotes }
      }

      let consultationResponse;
      if (prescriptionId) {
        consultationResponse = await fetchGraphQL<ConsultationData>(
          CREATE_CONSULTATION_WITH_PRESCRIPTION,
          {
            ...baseConsultationData,
            prescriptionId
          }
        )
      } else {
        consultationResponse = await fetchGraphQL<ConsultationData>(
          CREATE_CONSULTATION_WITHOUT_PRESCRIPTION,
          baseConsultationData
        )
      }

      const consultationId = consultationResponse.data.createOneConsultations?.id
      if (!consultationId) {
        throw new Error('Échec de la création de la consultation')
      }

      // Step 4: Create lab request if needed
      if (values.labRequest?.reason && values.labRequest.requestedTests) {
        const labRequestResponse = await fetchGraphQL<LabRequestData>(CREATE_LAB_REQUEST, {
          patientId: appointment.patient._id,
          doctorId: appointment.doctor._id,
          type: values.labRequest.reason,
          description: `${values.labRequest.requestedTests}${values.labRequest.notes ? ` - Notes: ${values.labRequest.notes}` : ''}`,
          priority: values.labRequest.priority || 'medium'
        })

        // Link lab request to consultation if needed
        if (labRequestResponse.data.createOneLab_requests?.id) {
          const linkResponse = await fetchGraphQL<LinkLabRequestData>(gql`
            mutation LinkLabRequest($consultationId: String!, $labRequestId: String!) {
              updateOneConsultations(
                where: { id: $consultationId }
                data: { lab_requests: { connect: { id: $labRequestId } } }
              ) {
                id
              }
            }
          `, {
            consultationId,
            labRequestId: labRequestResponse.data.createOneLab_requests.id
          })

          if (!linkResponse.data.updateOneConsultations?.id) {
            console.warn('Failed to link lab request to consultation')
          }
        }
      }

      toast({
        title: "Consultation enregistrée",
        description: "La consultation a été enregistrée avec succès.",
      })
      router.push("/doctor/consultations")

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
          Rendez-vous du {new Date(appointment.date).toLocaleDateString("fr-FR")} à {new Date(appointment.time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
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

              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptômes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description des symptômes..." {...field} />
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
                      <Textarea placeholder="Résultats de l'examen clinique..." {...field} />
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
                      <Input placeholder="Diagnostic..." {...field} />
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
                      <Textarea placeholder="Plan de traitement..." {...field} />
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
                    <FormLabel>Notes supplémentaires</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Notes supplémentaires..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Tabs defaultValue="prescriptions" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="prescriptions">Ordonnances</TabsTrigger>
                  <TabsTrigger value="lab-requests">Analyses</TabsTrigger>
                </TabsList>

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

