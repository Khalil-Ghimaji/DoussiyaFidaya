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
import { PatientHistory } from "@/lib/graphql/types/patient" // Assuming this path is correct

type PatientHistoryTabsProps = {
  history: PatientHistory
  patientId: string // This prop is available if needed for other actions
}
type Medication = {
  name: string
  dosage: string
  frequency: string
  duration: string
} 
export function PatientHistoryTabs({ history, patientId }: PatientHistoryTabsProps) {
  const [activeTab, setActiveTab] = useState("consultations")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Date inconnue"; // Basic guard against invalid date strings
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return "Date invalide";
      return format(date, "d MMMM yyyy", { locale: fr }) // Added yyyy for clarity
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return "Date invalide";
    }
  }

  const filterByDate = (items: any[]) => {
    if (!items) return [];
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

    return items.filter((item) => {
      if (!item.date) return false;
      try {
        const itemDate = new Date(item.date)
        if (isNaN(itemDate.getTime())) return false;

        switch (dateFilter) {
          case "1m":
            return itemDate >= oneMonthAgo
          case "3m":
            return itemDate >= threeMonthsAgo
          case "6m":
            return itemDate >= sixMonthsAgo
          case "1y":
            return itemDate >= oneYearAgo
          default:
            return true // Should be caught by "all" but as a fallback
        }
      } catch (error) {
        console.error("Error filtering by date for item:", item, error);
        return false;
      }
    })
  }

  const filterBySearch = (items: any[], fields: string[]) => {
    if (!items) return [];
    if (!searchQuery) return items;

    const lowerCaseSearchQuery = searchQuery.toLowerCase();

    return items.filter((item) => {
      return fields.some((field) => {
        const fieldParts = field.split(".");
        let currentValue = item;
        let isArraySearchFinalStep = false;
        let arrayToSearch = null;
        let propertyInArrayItem = null;

        for (let i = 0; i < fieldParts.length; i++) {
          const part = fieldParts[i];
          if (currentValue === null || typeof currentValue !== 'object') {
            currentValue = undefined;
            break;
          }

          const potentialArray = currentValue[part];
          if (Array.isArray(potentialArray) && i < fieldParts.length - 1) {
            // We are looking for a property within objects of this array
            arrayToSearch = potentialArray;
            propertyInArrayItem = fieldParts.slice(i + 1).join('.');
            isArraySearchFinalStep = true;
            break; 
          }
          currentValue = potentialArray;
        }

        if (isArraySearchFinalStep && arrayToSearch && propertyInArrayItem) {
          return (arrayToSearch as any[]).some(subItem => {
            // Resolve path within subItem
            const subValue = propertyInArrayItem.split(".").reduce((obj, key) => (obj && typeof obj === 'object' ? obj[key] : undefined), subItem);
            return subValue !== undefined && subValue !== null && subValue.toString().toLowerCase().includes(lowerCaseSearchQuery);
          });
        } else {
          // Direct value or last part of a nested path
          return currentValue !== undefined && currentValue !== null && currentValue.toString().toLowerCase().includes(lowerCaseSearchQuery);
        }
      });
    });
  };

  const filteredConsultations = filterByDate(
    filterBySearch(history.patientConsultations, [
      "notes", // Changed from reason/diagnosis
      "doctor.firstName",
      "doctor.lastName",
      "doctor.speciality",
    ]),
  )

  const filteredPrescriptions = filterByDate(
    filterBySearch(history.patientPrescriptions, [
      "medications.name",
      "medications.dosage", // Can also search by frequency or duration if needed
      "doctor.firstName",
      "doctor.lastName",
    ]),
  )

  const filteredLabResults = filterByDate(
    filterBySearch(history.patientLabResults, ["type", "resultSummary", "status"])
  );

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
          
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="consultations" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3"> {/* Responsive grid cols */}
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
            {filteredConsultations && filteredConsultations.length > 0 ? (
              <div className="space-y-4">
                {filteredConsultations.map((consultation) => (
                  <Card key={consultation.id}> {/* Changed from _id */}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">Consultation du {formatDate(consultation.date)}</CardTitle>
                          <CardDescription>
                            Dr. {consultation.doctor.firstName} {consultation.doctor.lastName} (
                            {consultation.doctor.speciality})
                          </CardDescription>
                        </div>
                        {/* consultation.time was here, removed as not in type */}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium">Notes de consultation</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{consultation.notes || "Aucune note"}</p>
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
                    ? "Aucune consultation ne correspond à vos critères."
                    : "Aucune consultation enregistrée."}
                </p>
                {(searchQuery || dateFilter !== "all") && (
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
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="p-4 border-t">
            {filteredPrescriptions && filteredPrescriptions.length > 0 ? (
              <div className="space-y-4">
                {filteredPrescriptions.map((prescription) => (
                  <Card key={prescription.id}> {/* Changed from _id */}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">Ordonnance du {formatDate(prescription.date)}</CardTitle>
                          <CardDescription>
                            Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Médicaments prescrits</p>
                        {prescription.medications && prescription.medications.length > 0 ? (
                          <ul className="space-y-2">
                            {prescription.medications.map((medication : Medication, index : string) => (
                              <li key={index} className="text-sm">
                                <div className="flex items-center gap-2">
                                  <Pill className="h-4 w-4 text-primary flex-shrink-0" />
                                  <span className="font-medium">{medication.name}</span>
                                </div>
                                <p className="text-muted-foreground ml-6">
                                  {medication.dosage}{medication.frequency && `, ${medication.frequency}`}{medication.duration && `, pendant ${medication.duration}`}
                                </p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                           <p className="text-sm text-muted-foreground">Aucun médicament listé.</p>
                        )}
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
                    ? "Aucune ordonnance ne correspond à vos critères."
                    : "Aucune ordonnance enregistrée."}
                </p>
                 {(searchQuery || dateFilter !== "all") && (
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
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="lab-results" className="p-4 border-t">
            {filteredLabResults && filteredLabResults.length > 0 ? (
              <div className="space-y-4">
                {filteredLabResults.map((result) => (
                  <Card key={result.id}> {/* Changed from _id */}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{result.type || "Type d'analyse inconnu"}</CardTitle>
                          <CardDescription>Effectué le {formatDate(result.date)}</CardDescription>
                        </div>
                        {result.status && (
                           <Badge
                            variant={
                              result.status.toLowerCase() === "completed" || result.status.toLowerCase() === "complété"
                                ? "default" // Or a custom success variant
                                : result.status.toLowerCase() === "pending" || result.status.toLowerCase() === "en attente"
                                  ? "outline" // Or a custom warning variant
                                  : "secondary" // Fallback for "en cours" or other statuses
                            }
                            className={
                              result.status.toLowerCase() === "completed" || result.status.toLowerCase() === "complété"
                                ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
                                : result.status.toLowerCase() === "pending" || result.status.toLowerCase() === "en attente"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700"
                                  : "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
                            }
                          >
                            {result.status === "completed" || result.status === "Complété"
                              ? "Complété"
                              : result.status === "pending" || result.status === "En attente"
                                ? "En attente"
                                : result.status} {/* Display status as is if not matched */}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Résumé</p>
                        <p className="text-sm text-muted-foreground">{result.resultSummary || "Aucun résumé disponible."}</p>
                      </div>
                    </CardContent>
                    <div className="px-6 pb-4 pt-2"> {/* Added pt-2 for spacing */}
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/doctor/lab-results/${result.id}`}> {/* Changed from _id and ensured template literal */}
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
                    ? "Aucun résultat d'analyse ne correspond à vos critères."
                    : "Aucun résultat d'analyse enregistré."}
                </p>
                {(searchQuery || dateFilter !== "all") && (
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
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}