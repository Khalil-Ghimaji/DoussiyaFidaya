"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { AnalysesTable } from "./page"

export function SearchAndFilterClient({
  analyses,
  getStatusLabel,
}: {
  analyses: any[]
  getStatusLabel: (status: string) => { label: string; variant: string }
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filter analyses based on criteria
  const filteredAnalyses = analyses.filter((analysis) => {
    const matchesSearch =
      analysis.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.laboratory.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || analysis.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par type ou laboratoire..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="completed">Complétés</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="processing">En cours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredAnalyses.length > 0 ? (
        <AnalysesTable filteredAnalyses={filteredAnalyses} getStatusLabel={getStatusLabel} />
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {analyses && analyses.length > 0
              ? "Aucune analyse ne correspond à votre recherche"
              : "Aucune analyse trouvée"}
          </p>
        </div>
      )}
    </>
  )
}

