"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  FileText,
  Phone,
  Mail,
  MapPin,
  User,
  Droplets,
  AlertTriangle,
  Pill,
  ClipboardList,
  FileCheck,
  FilePlus,
  FileEdit,
} from "lucide-react"
import { PatientExtended } from "@/lib/graphql/types/patient"



type PatientDetailsProps = {
  patient: PatientExtended
}

export function PatientDetails({ patient }: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Non disponible"
    const date = new Date(dateStr)
    return format(date, "d MMMM yyyy", { locale: fr })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 mb-2">
                <AvatarImage
                  src={patient.profileImage || "/placeholder.svg?height=96&width=96"}
                  alt={`${patient.firstName} ${patient.lastName}`}
                />
                <AvatarFallback className="text-2xl">
                  {patient.firstName[0]}
                  {patient.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center md:items-start">
                <h2 className="text-2xl font-bold">
                  {patient.firstName} {patient.lastName}
                </h2>
                <p className="text-muted-foreground">
                  {patient.gender === "male" ? "Homme" : "Femme"}, {calculateAge(patient.dateOfBirth)} ans
                </p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Date de naissance: {formatDate(patient.dateOfBirth)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient.address}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Groupe sanguin: {patient.bloodType || "Non renseigné"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Allergies:{" "}
                    {patient.allergies && patient.allergies.length > 0
                      ? patient.allergies.join(", ")
                      : "Aucune allergie connue"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Dernière consultation: {formatDate(patient.lastConsultation)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Contact d'urgence:{" "}
                    {patient.emergencyContact?.name
                      ? `${patient.emergencyContact.name} (${patient.emergencyContact.relationship}) - ${patient.emergencyContact.phone}`
                      : "Non renseigné"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href={`/doctor/patients/${patient.id}/consultation`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Nouvelle consultation
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/doctor/patients/${patient.id}/prescription`}>
                  <Pill className="mr-2 h-4 w-4" />
                  Nouvelle ordonnance
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/doctor/patients/${patient.id}/lab-request`}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Demande d'analyses
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <User className="h-4 w-4 mr-2" />
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="history">
            <FileCheck className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="medications">
            <Pill className="h-4 w-4 mr-2" />
            Traitements
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Antécédents médicaux</CardTitle>
              <CardDescription>Historique médical du patient</CardDescription>
            </CardHeader>
            <CardContent>
              {patient.medicalHistory ? (
                <p className="whitespace-pre-line">{patient.medicalHistory}</p>
              ) : (
                <p className="text-muted-foreground">Aucun antécédent médical renseigné</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/doctor/patients/${patient.id}/history`}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Voir l'historique complet
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Allergies</CardTitle>
                <CardDescription>Allergies connues du patient</CardDescription>
              </CardHeader>
              <CardContent>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <ul className="space-y-2">
                    {patient.allergies.map((allergy, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span>{allergy}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Aucune allergie connue</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Médicaments actuels</CardTitle>
                <CardDescription>Traitements en cours</CardDescription>
              </CardHeader>
              <CardContent>
                {patient.medications && patient.medications.length > 0 ? (
                  <ul className="space-y-2">
                    {patient.medications.map((medication, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-primary" />
                        <span>{medication}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Aucun médicament en cours</p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/doctor/patients/${patient.id}/prescription`}>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Nouvelle ordonnance
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique médical</CardTitle>
              <CardDescription>Consultations et interventions précédentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Consultez l'historique complet du patient pour voir toutes les consultations, ordonnances et analyses.
                </p>
                <Button className="mt-4" asChild>
                  <Link href={`/doctor/patients/${patient.id}/history`}>Voir l'historique complet</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Traitements</CardTitle>
              <CardDescription>Médicaments prescrits au patient</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Consultez et gérez les ordonnances du patient.</p>
                <div className="flex justify-center gap-2 mt-4">
                  <Button asChild>
                    <Link href={`/doctor/patients/${patient.id}/prescription`}>Nouvelle ordonnance</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/doctor/patients/${patient.id}/history`}>Voir les ordonnances</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Documents médicaux du patient</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Consultez et gérez les documents médicaux du patient.</p>
                <div className="flex justify-center gap-2 mt-4">
                  <Button asChild>
                    <Link href={`/doctor/patients/${patient.id}/lab-request`}>Demande d'analyses</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/doctor/patients/${patient.id}/history`}>Voir les documents</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

