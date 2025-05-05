import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string, formatStr = "dd MMMM yyyy"): string {
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString
    return format(date, formatStr, { locale: fr })
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString
    return format(date, "dd MMMM yyyy 'à' HH:mm", { locale: fr })
  } catch (error) {
    console.error("Error formatting date time:", error)
    return dateString
  }
}

export function formatTime(timeString: string): string {
  // Handle ISO strings with time component
  if (timeString.includes("T")) {
    try {
      const date = parseISO(timeString)
      return format(date, "HH:mm", { locale: fr })
    } catch (error) {
      console.error("Error formatting time from ISO string:", error)
    }
  }

  // Handle time strings like "14:30"
  return timeString
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export function truncateText(text: string, maxLength = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

