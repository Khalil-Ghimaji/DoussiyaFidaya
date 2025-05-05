"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import type { Locale } from "@/lib/i18n"

export function LanguageToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentLocale, setCurrentLocale] = useState<Locale>("fr")

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale | null
    if (savedLocale && (savedLocale === "fr" || savedLocale === "ar")) {
      setCurrentLocale(savedLocale)
      document.documentElement.lang = savedLocale
      document.documentElement.dir = savedLocale === "ar" ? "rtl" : "ltr"
    }
  }, [])

  const setLocale = (locale: Locale) => {
    setCurrentLocale(locale)
    localStorage.setItem("locale", locale)
    document.documentElement.lang = locale
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Changer de langue</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLocale("fr")}>Français {currentLocale === "fr" && "✓"}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale("ar")}>العربية {currentLocale === "ar" && "✓"}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

