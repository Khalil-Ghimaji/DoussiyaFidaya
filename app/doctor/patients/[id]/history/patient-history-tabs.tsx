"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Pill, ClipboardList, Search, Filter, Download, Printer, Eye } from "lucide-react"

type PatientHistory = {
  patientConsultations: {
    _id: string
    date: string
    time: string
    reason: string
    diagnosis: string
    doctor: {
      _id: string
      firstName: string
      lastName: string
      speciality: string
    }
  }[]
  patientPrescriptions: {
    _id: string
    date: string
    medications: {
      name: string
      dosage: string
      frequency: string
      duration: string
    }[]
    doctor: {
      firstName: string
      lastName: string
    }
  }[]
  patientLabResults: {
    _id: string
    date: string
    type: string
    status: string
    resultSummary: string
  }[]
}

type PatientHistoryTabsProps = {
  history: PatientHistory
  patientId: string
}

export function PatientHistoryTabs({ history, patientId }: PatientHistoryTabsProps) {
  const [activeTab, setActiveTab] = useState("consultations")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return format(date, "d MMMM yyyy", { locale: fr })
  }

  const filterByDate = (items: any[]) => {
    if (dateFilter === "all") return items

    const now = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(now.getMonth() - 1)

    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(now.getMonth() - 3)

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(now.getMonth() - 6)

    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(now.getFullYear() - 1)

    switch (dateFilter) {
      case "1m":
        return items.filter((item) => new Date(item.date) >= oneMonthAgo)
      case "3m":
        return items.filter((item) => new Date(item.date) >= threeMonthsAgo)
      case "6m":
        return items.filter((item) => new Date(item.date) >= sixMonthsAgo)
      case "1y":
        return items.filter((item) => new Date(item.date) >= oneYearAgo)
      default:
        return items
    }
  }

  const filterBySearch = (items: any[], fields: string[]) => {
    if (!searchQuery) return items

    return items.filter((item) => {
      return fields.some((field) => {
        const value = field.split(".").reduce((obj, key) => obj?.[key], item)
        return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      })
    })
  }

  const filteredConsultations = filterByDate(
    filterBySearch(history.patientConsultations, [
      "reason",
      "diagnosis",
      "doctor.firstName",
      "doctor.lastName",
      "doctor.speciality",
    ]),
  )

  const filteredPrescriptions = filterByDate(
    filterBySearch(history.patientPrescriptions, [
      "medications.name",
      "medications.dosage",
      "doctor.firstName",
      "doctor.lastName",
    ]),
  )

  const filteredLabResults = filterByDate(filterBySearch(history.patientLabResults, ["type", "resultSummary"]))

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les dates</SelectItem>
              <SelectItem value="1m">Dernier mois</SelectItem>
              <SelectItem value="3m">3 derniers mois</SelectItem>
              <SelectItem value="6m">6 derniers mois</SelectItem>
              <SelectItem value="1y">Dernière année</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="consultations" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="consultations">
              <FileText className="h-4 w-4 mr-2" />
              Consultations
            </TabsTrigger>
            <TabsTrigger value="prescriptions">
              <Pill className="h-4 w-4 mr-2" />
              Ordonnances
            </TabsTrigger>
            <TabsTrigger value="lab-results">
              <ClipboardList className="h-4 w-4 mr-2" />
              Analyses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultations" className="p-4 border-t">
            {filteredConsultations.length > 0 ? (
              <div className="space-y-4">
                {filteredConsultations.map((consultation) => (
                  <Card key={consultation._id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">Consultation du {formatDate(consultation.date)}</CardTitle>
                          <CardDescription>
                            Dr. {consultation.doctor.firstName} {consultation.doctor.lastName} (
                            {consultation.doctor.speciality})
                          </CardDescription>
                        </div>
                        <Badge variant="outline">{consultation.time}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Motif de consultation</p>
                          <p className="text-sm text-muted-foreground">{consultation.reason}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Diagnostic</p>
                          <p className="text-sm text-muted-foreground">{consultation.diagnosis}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || dateFilter !== "all"
                    ? "Aucune consultation ne correspond à vos critères"
                    : "Aucune consultation enregistrée"}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setDateFilter("all")
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="p-4 border-t">
            {filteredPrescriptions.length > 0 ? (
              <div className="space-y-4">
                {filteredPrescriptions.map((prescription) => (
                  <Card key={prescription._id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">Ordonnance du {formatDate(prescription.date)}</CardTitle>
                          <CardDescription>
                            Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost">
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Médicaments prescrits</p>
                        <ul className="space-y-2">
                          {prescription.medications.map((medication, index) => (
                            <li key={index} className="text-sm">
                              <div className="flex items-center gap-2">
                                <Pill className="h-4 w-4 text-primary" />
                                <span className="font-medium">{medication.name}</span>
                              </div>
                              <p className="text-muted-foreground ml-6">
                                {medication.dosage}, {medication.frequency}, pendant {medication.duration}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || dateFilter !== "all"
                    ? "Aucune ordonnance ne correspond à vos critères"
                    : "Aucune ordonnance enregistrée"}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setDateFilter("all")
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="lab-results" className="p-4 border-t">
            {filteredLabResults.length > 0 ? (
              <div className="space-y-4">
                {filteredLabResults.map((result) => (
                  <Card key={result._id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{result.type}</CardTitle>
                          <CardDescription>Effectué le {formatDate(result.date)}</CardDescription>
                        </div>
                        <Badge
                          className={
                            result.status === "completed"
                              ? "bg-green-500"
                              : result.status === "pending"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                          }
                        >
                          {result.status === "completed"
                            ? "Complété"
                            : result.status === "pending"
                              ? "En attente"
                              : "En cours"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Résumé</p>
                        <p className="text-sm text-muted-foreground">{result.resultSummary}</p>
                      </div>
                    </CardContent>
                    <div className="px-6 pb-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/doctor/lab-results/${result._id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir les détails
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || dateFilter !== "all"
                    ? "Aucun résultat d'analyse ne correspond à vos critères"
                    : "Aucun résultat d'analyse enregistré"}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("")
                    setDateFilter("all")
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

