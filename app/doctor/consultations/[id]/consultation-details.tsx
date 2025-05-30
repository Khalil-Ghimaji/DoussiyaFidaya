"use client"

import { useState } from "react"
import { Calendar, Edit, FileDown, Printer, User, Stethoscope, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { fr } from "date-fns/locale"
import { PatientProfile } from "@/components/patient/profile"

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

export function ConsultationDetails({ consultation }: { consultation: Consultation }) {
  const { toast } = useToast()
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const handleGeneratePdf = async () => {
    try {
      setIsGeneratingPdf(true)
      // In a real application, you would call an API to generate the PDF
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "PDF généré",
        description: "Le document a été généré avec succès",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const consultationDate = new Date(consultation.date)

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <PatientProfile patient={consultation.patient} />
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">
                  Consultation du {format(consultationDate, "dd MMMM yyyy", { locale: fr })}
                </CardTitle>
                <CardDescription>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(consultationDate, "EEEE dd MMMM yyyy", { locale: fr })} à {consultation.time}
                  </div>
                  <div className="flex items-center mt-1">
                    <User className="h-4 w-4 mr-1" />
                    Patient: {consultation.patient.firstName} {consultation.patient.lastName}
                  </div>
                  <div className="flex items-center mt-1">
                    <Stethoscope className="h-4 w-4 mr-1" />
                    Dr. {consultation.doctor.firstName} {consultation.doctor.lastName}, {consultation.doctor.speciality}
                  </div>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
                  {isGeneratingPdf ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="h-4 w-4 mr-2" />
                  )}
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/doctor/consultations/${consultation._id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Motif de consultation</h3>
              <p>{consultation.reason}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Diagnostic</h3>
              <p>{consultation.diagnosis}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Notes</h3>
              <p>{consultation.notes || "Aucune note"}</p>
            </div>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="vital-signs" className="border rounded-lg">
            <AccordionTrigger className="px-4">Signes vitaux</AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {consultation.vitalSigns ? (
                <Table>
                  <TableBody>
                    {consultation.vitalSigns.bloodPressure && (
                      <TableRow>
                        <TableCell className="font-medium">Tension artérielle</TableCell>
                        <TableCell>{consultation.vitalSigns.bloodPressure}</TableCell>
                      </TableRow>
                    )}
                    {consultation.vitalSigns.heartRate && (
                      <TableRow>
                        <TableCell className="font-medium">Fréquence cardiaque</TableCell>
                        <TableCell>{consultation.vitalSigns.heartRate} bpm</TableCell>
                      </TableRow>
                    )}
                    {consultation.vitalSigns.temperature && (
                      <TableRow>
                        <TableCell className="font-medium">Température</TableCell>
                        <TableCell>{consultation.vitalSigns.temperature} °C</TableCell>
                      </TableRow>
                    )}
                    {consultation.vitalSigns.respiratoryRate && (
                      <TableRow>
                        <TableCell className="font-medium">Fréquence respiratoire</TableCell>
                        <TableCell>{consultation.vitalSigns.respiratoryRate} resp/min</TableCell>
                      </TableRow>
                    )}
                    {consultation.vitalSigns.oxygenSaturation && (
                      <TableRow>
                        <TableCell className="font-medium">Saturation en oxygène</TableCell>
                        <TableCell>{consultation.vitalSigns.oxygenSaturation} %</TableCell>
                      </TableRow>
                    )}
                    {consultation.vitalSigns.weight && (
                      <TableRow>
                        <TableCell className="font-medium">Poids</TableCell>
                        <TableCell>{consultation.vitalSigns.weight} kg</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <p>Aucun signe vital enregistré</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="prescriptions" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              Ordonnances
              {consultation.prescriptions?.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {consultation.prescriptions.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {consultation.prescriptions && consultation.prescriptions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Médicament</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Fréquence</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Quantité</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultation.prescriptions.map((prescription, index) => (
                      <TableRow key={prescription._id || index}>
                        <TableCell className="font-medium">{prescription.name}</TableCell>
                        <TableCell>{prescription.dosage}</TableCell>
                        <TableCell>{prescription.frequency}</TableCell>
                        <TableCell>{prescription.duration}</TableCell>
                        <TableCell>{prescription.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>Aucune ordonnance</p>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="lab-requests" className="border rounded-lg">
            <AccordionTrigger className="px-4">
              Analyses prescrites
              {consultation.labRequests?.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {consultation.labRequests.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {consultation.labRequests && consultation.labRequests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type d'analyse</TableHead>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Laboratoire</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultation.labRequests.map((request, index) => (
                      <TableRow key={request._id || index}>
                        <TableCell className="font-medium">{request.type}</TableCell>
                        <TableCell>{request.priority}</TableCell>
                        <TableCell>{request.laboratory || "Non spécifié"}</TableCell>
                        <TableCell>
                          <Badge variant={request.status === "completed" ? "success" : "outline"}>
                            {request.status === "pending"
                              ? "En attente"
                              : request.status === "inProgress"
                                ? "En cours"
                                : "Terminé"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>Aucune analyse prescrite</p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

