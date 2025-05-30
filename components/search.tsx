"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { SearchIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchProps {
  placeholder?: string
  paramName?: string
  className?: string
}

export function Search({ placeholder = "Rechercher...", paramName = "search", className }: SearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get(paramName) || "")
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm)

  // Update search term when URL param changes
  useEffect(() => {
    setSearchTerm(searchParams.get(paramName) || "")
  }, [searchParams, paramName])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Update URL when debounced term changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (debouncedTerm) {
      params.set(paramName, debouncedTerm)
    } else {
      params.delete(paramName)
    }

    router.push(`${pathname}?${params.toString()}`)
  }, [debouncedTerm, router, pathname, searchParams, paramName])

  const handleClear = () => {
    setSearchTerm("")
  }

  return (
    <div className={`relative ${className}`}>
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        className="pl-8 pr-8"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" onClick={handleClear}>
          <X className="h-4 w-4" />
          <span className="sr-only">Effacer la recherche</span>
        </Button>
      )}
    </div>
  )
}

