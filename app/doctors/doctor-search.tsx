"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, MapPin, Navigation } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {geocodeAddress} from "@/app/doctors/actions";

export default function DoctorSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [locationQuery, setLocationQuery] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          },
          (error) => console.error("Error getting location:", error),
      )
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearchParams({ search: searchQuery })
  }

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (locationQuery.trim()) {
      // i'd geocode the location query
      const {latitude, longitude} = await geocodeAddress(locationQuery.trim())
        if (latitude && longitude) {
            updateSearchParams({
            lat: latitude.toString(),
            lng: longitude.toString(),
              location: locationQuery.trim(),
            })
        } else {
            console.error("Could not geocode location:", locationQuery)
        }
    }
  }

  const useCurrentLocation = () => {
    if (userLocation) {
      updateSearchParams({
        lat: userLocation.lat.toString(),
        lng: userLocation.lng.toString(),
        location: undefined,
        radius: searchParams.radius || "10", // Default radius if not set
      })
    }
  }

  const updateSearchParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    if (!params.has("radius")) {
      params.set("radius", "10") // Default radius if not set
    }

    router.push(`/doctors?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearchQuery("")
    updateSearchParams({ search: undefined })
  }

  const clearLocation = () => {
    setLocationQuery("")
    updateSearchParams({ lat: undefined, lng: undefined,location:undefined })
  }

  const hasActiveFilters = (searchParams.get("lat") && searchParams.get("lng")) || searchParams.get("search")

  return (
      <div className="space-y-4 mb-6">
        {/* Main search */}
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search doctors by first name, last name"
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
                <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
            )}
          </div>
        </form>

        {/* Location search */}
        <div className="flex gap-2">
          <form onSubmit={handleLocationSearch} className="flex-1 relative">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                  placeholder="Enter city, address, or area..."
                  className="pl-10 pr-10"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
              />
              {locationQuery && (
                  <button
                      type="button"
                      onClick={clearLocation}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
              )}
            </div>
          </form>

          <Button
              type="button"
              variant="outline"
              onClick={useCurrentLocation}
              disabled={(!userLocation) || (
                    userLocation &&
                    userLocation.lat.toString() === searchParams.get("lat") &&
                    userLocation.lng.toString() === searchParams.get("lng")
                )
              }
              className="shrink-0"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Use My Location
          </Button>
        </div>

        {/* Active filters display */}
        {hasActiveFilters && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Active filters:</span>

                  {searchParams.get("search") && (
                      <Badge variant="secondary" className="gap-1">
                        Search: {searchParams.get("search")}
                        <button onClick={clearSearch} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                  )}

                  {searchParams.get("location") && (
                      <Badge variant="secondary" className="gap-1">
                        Location: {searchParams.get("location")}
                        <button onClick={clearLocation} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                  )}

                  {searchParams.get("lat") && !searchParams.get("location") && (
                      <Badge variant="secondary" className="gap-1">
                        Near you
                        <button onClick={clearLocation} className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
        )}
      </div>
  )
}
