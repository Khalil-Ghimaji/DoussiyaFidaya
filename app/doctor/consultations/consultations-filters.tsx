"use client"

import { useState } from "react"
import { CalendarIcon, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { fr } from "date-fns/locale"
import { ConsultationsTable } from "./consultations-table"
import type { Consultation } from "./page"

export function ConsultationsFilters({ initialConsultations }: { initialConsultations: Consultation[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  })
  const [dateFilter, setDateFilter] = useState<string | null>("all")

  // Filter consultations based on search term and date range
  const filteredConsultations = initialConsultations.filter((consultation) => {
    const patientName = `${consultation.patient.firstName} ${consultation.patient.lastName}`.toLowerCase()
    const matchesSearch =
      patientName.includes(searchTerm.toLowerCase()) ||
      consultation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.reason.toLowerCase().includes(searchTerm.toLowerCase())

    // If no date filter is applied, just check the search term
    if (dateFilter === "all" || (!dateRange.startDate && !dateRange.endDate)) {
      return matchesSearch
    }

    // Otherwise, check both search term and date range
    const consultationDate = new Date(consultation.date)
    const isInDateRange =
      (!dateRange.startDate || consultationDate >= dateRange.startDate) &&
      (!dateRange.endDate || consultationDate <= dateRange.endDate)

    return matchesSearch && isInDateRange
  })

  // Handle predefined date filters
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value)
    const today = new Date()
    let start: Date | null = null
    let end: Date | null = null

    switch (value) {
      case "today":
        start = today
        end = today
        break
      case "yesterday":
        start = new Date(today)
        start.setDate(start.getDate() - 1)
        end = start
        break
      case "thisWeek":
        start = new Date(today)
        start.setDate(start.getDate() - start.getDay())
        end = today
        break
      case "thisMonth":
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = today
        break
      case "lastMonth":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        end = new Date(today.getFullYear(), today.getMonth(), 0)
        break
      case "custom":
        // Keep current selection for custom range
        return
      case "all":
      default:
        // Reset date range
        start = null
        end = null
        break
    }

    setDateRange({ startDate: start, endDate: end })
  }

  // Clear search and filters
  const clearFilters = () => {
    setSearchTerm("")
    setDateFilter("all")
    setDateRange({ startDate: null, endDate: null })
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par patient ou diagnostic..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={dateFilter || "all"} onValueChange={handleDateFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les dates</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="yesterday">Hier</SelectItem>
              <SelectItem value="thisWeek">Cette semaine</SelectItem>
              <SelectItem value="thisMonth">Ce mois-ci</SelectItem>
              <SelectItem value="lastMonth">Mois dernier</SelectItem>
              <SelectItem value="custom">Période personnalisée</SelectItem>
            </SelectContent>
          </Select>

          {dateFilter === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button id="date" variant={"outline"} className={"w-[280px] justify-start text-left font-normal"}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.startDate ? (
                    dateRange.endDate ? (
                      <>
                        {format(dateRange.startDate, "dd/MM/yyyy")} - {format(dateRange.endDate, "dd/MM/yyyy")}
                      </>
                    ) : (
                      format(dateRange.startDate, "dd/MM/yyyy")
                    )
                  ) : (
                    <span>Sélectionner une période</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  locale={fr}
                  defaultMonth={dateRange.startDate || undefined}
                  selected={{
                    from: dateRange.startDate || undefined,
                    to: dateRange.endDate || undefined,
                  }}
                  onSelect={(range) =>
                    setDateRange({
                      startDate: range?.from || null,
                      endDate: range?.to || null,
                    })
                  }
                />
              </PopoverContent>
            </Popover>
          )}

          <Button variant="outline" onClick={clearFilters}>
            Effacer les filtres
          </Button>
        </div>
      </div>

      {filteredConsultations.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <ConsultationsTable consultations={filteredConsultations} />
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full">
          <CardContent className="py-10 text-center">
            <p className="mb-4 text-muted-foreground">
              {searchTerm || dateFilter !== "all"
                ? "Aucune consultation ne correspond à votre recherche."
                : "Il n'y a pas encore de consultations enregistrées."}
            </p>
            <Button asChild>
              <Link href="/doctor/appointments">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle consultation
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}

