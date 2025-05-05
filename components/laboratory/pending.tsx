"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileText, AlertCircle } from "lucide-react"
import Link from "next/link"

type LaboratoryAnalysis = {
  _id: string
  patient: {
    _id: string
    firstName: string
    lastName: string
  }
  doctor: {
    _id: string
    firstName: string
    lastName: string
  }
  type: string
  requestDate: string
  priority: string
  status: string
}
interface LaboratoryPendingProps {
  analyses?: LaboratoryAnalysis[]
}

export default function LaboratoryPending({ analyses = [] }: LaboratoryPendingProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter analyses based on search query
  const filteredAnalyses = analyses.filter((analysis) => {
    const patientName = `${analysis.patient.firstName} ${analysis.patient.lastName}`.toLowerCase()
    const doctorName = `${analysis.doctor.firstName} ${analysis.doctor.lastName}`.toLowerCase()
    const query = searchQuery.toLowerCase()

    return patientName.includes(query) || doctorName.includes(query) || analysis.type.toLowerCase().includes(query)
  })

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-100">
            Urgent
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100">
            Moyen
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100">
            Normal
          </Badge>
        )
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
            En cours
          </Badge>
        )
      case "received":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100">
            Reçu
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100">
            Terminé
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyses en attente</CardTitle>
        <CardDescription>Liste des analyses en attente de traitement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par patient, médecin ou type d'analyse..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredAnalyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucune analyse trouvée</h3>
            <p className="text-muted-foreground mt-2">
              {searchQuery
                ? "Aucune analyse ne correspond à votre recherche"
                : "Aucune analyse en attente pour le moment"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Médecin</TableHead>
                <TableHead>Type d'analyse</TableHead>
                <TableHead>Date de demande</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnalyses.map((analysis) => (
                <TableRow key={analysis._id}>
                  <TableCell className="font-medium">
                    {analysis.patient.firstName} {analysis.patient.lastName}
                  </TableCell>
                  <TableCell>
                    Dr. {analysis.doctor.firstName} {analysis.doctor.lastName}
                  </TableCell>
                  <TableCell>{analysis.type}</TableCell>
                  <TableCell>{new Date(analysis.requestDate).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>{getPriorityBadge(analysis.priority)}</TableCell>
                  <TableCell>{getStatusBadge(analysis.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/laboratory/upload?analysisId=${analysis._id}`}>
                        <FileText className="mr-2 h-4 w-4" />
                        Traiter
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

