"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { X } from "lucide-react"

export default function DoctorFilters({ specialties }: { specialties: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState({
    specialty: searchParams.get("specialty") || "all",
    language: searchParams.get("language") || "any",
    accepting: searchParams.get("accepting") === "true",
    radius: Number.parseInt(searchParams.get("radius") || "10"),
  })

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams)

    if (filters.specialty && filters.specialty !== "all") {
      params.set("specialty", filters.specialty)
    } else {
      params.delete("specialty")
    }

    if (filters.language && filters.language !== "any") {
      params.set("language", filters.language)
    } else {
      params.delete("language")
    }

    if (filters.radius) {
      params.set("radius", filters.radius.toString())
    } else {
      params.delete("radius")
    }

    router.push(`/doctors?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      specialty: "",
      language: "",
      accepting: false,
      radius: 10,
    })

    // Preserve search and location params
    const params = new URLSearchParams()
    const preserveParams = ["search", "location", "lat", "lng", "view"]

    preserveParams.forEach((param) => {
      const value = searchParams.get(param)
      if (value) {
        params.set(param, value)
      }
    })

    router.push(`/doctors?${params.toString()}`)
  }

  const hasActiveFilters = filters.specialty || filters.language || filters.accepting || filters.radius !== 10

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
                  <SelectItem value="Arabic">Arabic</SelectItem>
                  <SelectItem value="Mandarin">Mandarin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="radius">Search Radius: {filters.radius} km</Label>
              <div className="px-2 py-4">
                <Slider
                    id="radius"
                    min={1}
                    max={50}
                    step={1}
                    value={[filters.radius]}
                    onValueChange={(value) => setFilters({ ...filters, radius: value[0] })}
                    className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 km</span>
                <span>50 km</span>
              </div>
            </div>
          </div>

          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
        </CardContent>
      </Card>
  )
}
