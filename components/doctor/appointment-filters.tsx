"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, SearchIcon, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function AppointmentFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [date, setDate] = useState<Date | undefined>(
    searchParams.get("date") ? new Date(searchParams.get("date") as string) : undefined,
  )

  // Apply filters when they change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }

    if (date) {
      params.set("date", format(date, "yyyy-MM-dd"))
    } else {
      params.delete("date")
    }

    router.push(`?${params.toString()}`)
  }, [search, date, router, searchParams])

  // Reset all filters
  const resetFilters = () => {
    setSearch("")
    setDate(undefined)
    router.push("/doctor/appointments")
  }

  // Check if any filters are applied
  const hasFilters = search || date

  return (
    <div className="bg-muted/40 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="search" className="mb-2 block">
            Recherche
          </Label>
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Nom du patient..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="date" className="mb-2 block">
            Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="date" variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd MMMM yyyy", { locale: fr }) : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={fr} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {hasFilters && (
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <X className="mr-2 h-4 w-4" />
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  )
}

