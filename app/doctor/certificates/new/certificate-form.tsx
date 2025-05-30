"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createMedicalCertificate, searchPatients } from "@/app/doctor/actions"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"

// Initial state for the form
const initialState = {
  message: "",
  errors: {
    patientId: "",
    patientName: "",
    diagnose: "",
    startDate: "",
    endDate: "",
    duration: "",
    restType: "",
  },
  success: false,
}

// Form action with validation
async function createCertificateAction(prevState: any, formData: FormData) {
  // Extract form data
  const patientId = formData.get("patientId") as string
  const patientName = formData.get("patientName") as string
  const diagnose = formData.get("diagnose") as string
  const startDateStr = formData.get("startDate") as string
  const endDateStr = formData.get("endDate") as string
  const duration = Number.parseInt(formData.get("duration") as string)
  const restType = formData.get("restType") as string
  const notes = formData.get("notes") as string

  // Validate form data
  const errors = {
    patientId: !patientId ? "Veuillez sélectionner un patient" : "",
    patientName: !patientName ? "Veuillez sélectionner un patient" : "",
    diagnose: !diagnose || diagnose.length < 3 ? "Le diagnostic est requis" : "",
    startDate: !startDateStr ? "La date de début est requise" : "",
    endDate: !endDateStr ? "La date de fin est requise" : "",
    duration: isNaN(duration) || duration < 1 ? "La durée est requise" : "",
    restType: !restType ? "Le type de repos est requis" : "",
  }

  // Check if there are any errors
  if (Object.values(errors).some((error) => error)) {
    return {
      message: "Veuillez corriger les erreurs dans le formulaire",
      errors,
      success: false,
    }
  }

  // Convert date strings to Date objects
  const startDate = new Date(startDateStr)
  const endDate = new Date(endDateStr)

  // Create certificate data
  const certificateData = {
    patientId,
    patientName,
    diagnose,
    startDate,
    endDate,
    duration,
    restType,
    notes,
  }

  // Submit the form
  const result = await createMedicalCertificate(certificateData)

  if (result.success) {
    return {
      message: "Le certificat médical a été créé avec succès",
      errors: {},
      success: true,
      certificateId: result.certificateId,
    }
  } else {
    return {
      message: result.message || "Une erreur est survenue lors de la création du certificat",
      errors: {},
      success: false,
    }
  }
}

// Submit button component
function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Créer le certificat
    </Button>
  )
}

export function NewCertificateForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [state, formAction] = useActionState(createCertificateAction, initialState)
  const [searchTerm, setSearchTerm] = useState("")
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  const [duration, setDuration] = useState(7)

  // Handle patient search
  const handleSearch = async (term: string) => {
    setSearchTerm(term)

    if (term.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const result = await searchPatients(term)
      if (result.success) {
        setSearchResults(result.patients)
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Impossible de rechercher des patients",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error searching patients:", error)
      toast({
        title: "Erreur",
        description: "Impossible de rechercher des patients",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Handle patient selection
  const handleSelectPatient = (patientId: string, patientName: string) => {
    setSelectedPatient({ id: patientId, name: patientName })
    setIsPopoverOpen(false)
  }

  // Calculate duration when either date changes
  const updateDuration = (start: Date, end: Date) => {
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // Include both start and end dates
    setDuration(diffDays)
  }

  // Update end date when duration changes
  const updateEndDate = (newDuration: number) => {
    const newEndDate = new Date(startDate)
    newEndDate.setDate(startDate.getDate() + newDuration - 1) // -1 because we include start date
    setEndDate(newEndDate)
  }

  // Handle start date change
  const handleStartDateChange = (date: Date) => {
    setStartDate(date)
    updateDuration(date, endDate)
  }

  // Handle end date change
  const handleEndDateChange = (date: Date) => {
    setEndDate(date)
    updateDuration(startDate, date)
  }

  // Handle duration change
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = Number.parseInt(e.target.value)
    if (!isNaN(newDuration) && newDuration > 0) {
      setDuration(newDuration)
      updateEndDate(newDuration)
    }
  }

  // Handle form success
  if (state.success) {
    toast({
      title: "Certificat créé",
      description: "Le certificat médical a été créé avec succès.",
    })
    router.push("/doctor/certificates")
    router.refresh()
  }

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden inputs for dates */}
      <input type="hidden" name="startDate" value={startDate.toISOString()} />
      <input type="hidden" name="endDate" value={endDate.toISOString()} />

      <div className="space-y-2">
        <Label htmlFor="patientName">Patient</Label>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={isPopoverOpen} className="w-full justify-between">
              {selectedPatient?.name || "Sélectionner un patient"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Rechercher un patient..." value={searchTerm} onValueChange={handleSearch} />
              <CommandList>
                <CommandEmpty>Aucun patient trouvé.</CommandEmpty>
                <CommandGroup>
                  {isSearching ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  ) : (
                    searchResults.map((patient) => (
                      <CommandItem
                        key={patient._id}
                        value={patient._id}
                        onSelect={() => handleSelectPatient(patient._id, `${patient.firstName} ${patient.lastName}`)}
                      >
                        {patient.firstName} {patient.lastName} - {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </CommandItem>
                    ))
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {state.errors.patientId && <p className="text-sm text-red-500">{state.errors.patientId}</p>}
        <input type="hidden" name="patientId" value={selectedPatient?.id || ""} />
        <input type="hidden" name="patientName" value={selectedPatient?.name || ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnose">Diagnostic</Label>
        <Input name="diagnose" placeholder="Diagnostic..." />
        {state.errors.diagnose && <p className="text-sm text-red-500">{state.errors.diagnose}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Date de début</Label>
          <DatePicker date={startDate} setDate={handleStartDateChange} />
          {state.errors.startDate && <p className="text-sm text-red-500">{state.errors.startDate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">Date de fin</Label>
          <DatePicker date={endDate} setDate={handleEndDateChange} />
          {state.errors.endDate && <p className="text-sm text-red-500">{state.errors.endDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Durée (jours)</Label>
          <Input name="duration" type="number" min={1} value={duration} onChange={handleDurationChange} />
          {state.errors.duration && <p className="text-sm text-red-500">{state.errors.duration}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="restType">Type de repos</Label>
          <Input name="restType" placeholder="ex: Repos total" />
          {state.errors.restType && <p className="text-sm text-red-500">{state.errors.restType}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes supplémentaires (optionnel)</Label>
        <Textarea name="notes" placeholder="Notes supplémentaires..." className="min-h-[100px]" />
      </div>

      {state.message && !state.success && <div className="bg-red-50 p-4 rounded-md text-red-800">{state.message}</div>}

      <SubmitButton />
    </form>
  )
}

