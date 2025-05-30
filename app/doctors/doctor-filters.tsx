"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

export default function DoctorFilters({ specialties }: { specialties: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    specialty: searchParams.get("specialty") || "",
    language: searchParams.get("language") || "",
    accepting: searchParams.get("accepting") === "true",
  })

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (filters.specialty) {
      params.set("specialty", filters.specialty)
    }

    if (filters.language) {
      params.set("language", filters.language)
    }

    if (filters.accepting) {
      params.set("accepting", "true")
    }

    // Preserve search query if it exists
    const query = searchParams.get("query")
    if (query) {
      params.set("query", query)
    }

    router.push(`/doctors?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      specialty: "",
      language: "",
      accepting: false,
    })

    // Preserve search query if it exists
    const query = searchParams.get("query")
    if (query) {
      router.push(`/doctors?query=${query}`)
    } else {
      router.push("/doctors")
    }
  }

  const hasActiveFilters = filters.specialty || filters.language || filters.accepting

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
              <X className="mr-1 h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="specialty">Specialty</Label>
            <Select value={filters.specialty} onValueChange={(value) => setFilters({ ...filters, specialty: value })}>
              <SelectTrigger id="specialty">
                <SelectValue placeholder="All specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.name}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language">Language</Label>
            <Select value={filters.language} onValueChange={(value) => setFilters({ ...filters, language: value })}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Any language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any language</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="Mandarin">Mandarin</SelectItem>
                <SelectItem value="Arabic">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="accepting"
              checked={filters.accepting}
              onCheckedChange={(checked) => setFilters({ ...filters, accepting: checked as boolean })}
            />
            <Label htmlFor="accepting" className="text-sm font-normal">
              Accepting new patients
            </Label>
          </div>
        </div>

        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  )
}

