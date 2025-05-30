"use client"

import React from "react"

import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Heart, Brain, TreesIcon as Lungs, Stethoscope, Eye, Bone, Shield, Loader2 } from "lucide-react"
import Link from "next/link"
import { fetchGraphQL } from "@/lib/server/graphql-client"
import { GET_PATIENT_MEDICAL_RECORD } from "@/lib/server/patient-queries"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"

// Using ISR with a 5-minute revalidation period for medical records
export const revalidate = 300

// Map icon names to components
const iconMap: Record<string, React.ElementType> = {
  heart: Heart,
  brain: Brain,
  lungs: Lungs,
  stethoscope: Stethoscope,
  eye: Eye,
  bone: Bone,
}

type MedicalRecordData = {
  patientInfo: {
    _id: string
    firstName: string
    lastName: string
    medicalRecord: {
      birthDate: string
      bloodType: string
      allergies: string[]
      medicalHistory: Array<{
        condition: string
        since: string
      }>
      currentTreatments: Array<{
        name: string
        dosage: string
        frequency: string
        prescribedBy: string
      }>
    }
  }
  medicalSegments: Array<{
    id: string
    name: string
    iconName: string
    doctor: {
      firstName: string
      lastName: string
    }
    lastVisit: string
    notes: string
    data: Array<{
      name: string
      value: string
      date: string
    }>
    documents: Array<{
      id: string
      name: string
      date: string
      type: string
    }>
    consultations: Array<{
      id: string
      date: string
      doctor: {
        firstName: string
        lastName: string
      }
      reason: string
    }>
  }>
}

async function MedicalRecordContent() {
  const session = await auth()
  if (!session?.user?.id) {
    notFound()
  }

  try {
    const data = await fetchGraphQL<MedicalRecordData>(
      GET_PATIENT_MEDICAL_RECORD,
      { patientId: session.user.id },
      "no-store",
    )

    const { patientInfo, medicalSegments } = data

    return (
      <>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dossier médical</h1>
            <p className="text-muted-foreground">Consultez votre dossier médical complet, segmenté par spécialité</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/patient/authorizations">
                <Shield className="mr-2 h-4 w-4" />
                Gérer les autorisations
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/patient/medical-record/export">
                <FileText className="mr-2 h-4 w-4" />
                Exporter le dossier
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            {medicalSegments.map((segment) => (
              <TabsTrigger key={segment.id} value={segment.id} className="flex items-center">
                {iconMap[segment.iconName] &&
                  React.createElement(iconMap[segment.iconName], { className: "mr-2 h-4 w-4" })}
                {segment.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                  <CardDescription>Vos informations médicales de base</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
                      <p>
                        {patientInfo.firstName} {patientInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date de naissance</p>
                      <p>{new Date(patientInfo.medicalRecord.birthDate).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Groupe sanguin</p>
                      <p>{patientInfo.medicalRecord.bloodType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                      <p>{patientInfo.medicalRecord.allergies.join(", ") || "Aucune"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Antécédents médicaux</CardTitle>
                  <CardDescription>Historique de vos conditions médicales</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1">
                    {patientInfo.medicalRecord.medicalHistory.map((item, index) => (
                      <li key={index}>
                        {item.condition} (depuis {item.since})
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Traitements en cours</CardTitle>
                  <CardDescription>Médicaments et traitements actuels</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Médicament</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Fréquence</TableHead>
                        <TableHead>Prescrit par</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientInfo.medicalRecord.currentTreatments.map((treatment, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{treatment.name}</TableCell>
                          <TableCell>{treatment.dosage}</TableCell>
                          <TableCell>{treatment.frequency}</TableCell>
                          <TableCell>{treatment.prescribedBy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Segments médicaux</CardTitle>
                  <CardDescription>Aperçu de vos dossiers par spécialité</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {medicalSegments.map((segment) => {
                      const SegmentIcon = iconMap[segment.iconName] || FileText
                      return (
                        <Card key={segment.id} className="overflow-hidden">
                          <CardHeader className="bg-muted/50 p-4">
                            <div className="flex items-center gap-2">
                              <SegmentIcon className="h-5 w-5" />
                              <CardTitle className="text-lg">{segment.name}</CardTitle>
                            </div>
                            <CardDescription>
                              Dernière visite: {new Date(segment.lastVisit).toLocaleDateString("fr-FR")}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4">
                            <p className="text-sm mb-4 line-clamp-2">{segment.notes}</p>
                            <Button variant="outline" size="sm" className="w-full">
                              Voir les détails
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {medicalSegments.map((segment) => {
            const SegmentIcon = iconMap[segment.iconName] || FileText
            return (
              <TabsContent key={segment.id} value={segment.id}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <SegmentIcon className="h-5 w-5" />
                        <CardTitle>{segment.name}</CardTitle>
                      </div>
                      <CardDescription>
                        Dernière consultation: {new Date(segment.lastVisit).toLocaleDateString("fr-FR")} - Dr.{" "}
                        {segment.doctor.firstName} {segment.doctor.lastName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">Notes du spécialiste</h3>
                          <p>{segment.notes}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Paramètres médicaux</CardTitle>
                      <CardDescription>Dernières mesures et résultats</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Paramètre</TableHead>
                            <TableHead>Valeur</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {segment.data.map((item, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>{item.value}</TableCell>
                              <TableCell>{new Date(item.date).toLocaleDateString("fr-FR")}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Documents médicaux</CardTitle>
                      <CardDescription>Examens, rapports et autres documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Document</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {segment.documents.map((doc, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{doc.name}</TableCell>
                              <TableCell>{new Date(doc.date).toLocaleDateString("fr-FR")}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{doc.type.toUpperCase()}</Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/patient/medical-record/document/${doc.id}`}>Visualiser</Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Historique des consultations</CardTitle>
                      <CardDescription>Vos visites précédentes dans cette spécialité</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Médecin</TableHead>
                            <TableHead>Motif</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {segment.consultations.map((consultation, i) => (
                            <TableRow key={i}>
                              <TableCell>{new Date(consultation.date).toLocaleDateString("fr-FR")}</TableCell>
                              <TableCell>
                                Dr. {consultation.doctor.firstName} {consultation.doctor.lastName}
                              </TableCell>
                              <TableCell>{consultation.reason}</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/patient/medical-record/consultation/${consultation.id}`}>Détails</Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </>
    )
  } catch (error) {
    console.error("Error fetching medical record:", error)
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Une erreur est survenue</h3>
            <p className="text-muted-foreground">Impossible de charger le dossier médical</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
}

export default function PatientMedicalRecordPage() {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement du dossier médical...</p>
            </div>
          </div>
        }
      >
        <MedicalRecordContent />
      </Suspense>
    </div>
  )
}

