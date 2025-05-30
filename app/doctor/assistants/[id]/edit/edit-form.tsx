"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { updateAssistant } from "@/app/doctor/actions"

// Define the assistant type
type Assistant = {
  _id: string
  name: string
  email: string
  phone: string
  status: string
  createdAt: string
  permissions: {
    manageAppointments: boolean
    viewPatientDetails: boolean
    editPatientDetails: boolean
    cancelAppointments: boolean
    rescheduleAppointments: boolean
  }
}

export function EditAssistantForm({ assistant }: { assistant: Assistant }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form state with assistant data
  const [formData, setFormData] = useState({
    name: assistant.name,
    email: assistant.email,
    phone: assistant.phone,
    permissions: {
      ...assistant.permissions,
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePermissionChange = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission as keyof typeof prev.permissions],
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)

      const result = await updateAssistant(assistant._id, formData)

      if (result.success) {
        toast({
          title: "Assistant mis à jour",
          description: "Les informations de l'assistant ont été mises à jour avec succès.",
        })
        router.push("/doctor/assistants")
        router.refresh()
      } else {
        throw new Error(result.message || "Une erreur est survenue")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'assistant. Veuillez réessayer.",
        variant: "destructive",
      })
      console.error("Error updating assistant:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>

        <div className="grid w-full items-center gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
        </div>

        <div className="grid w-full items-center gap-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
        </div>

        <div className="space-y-3">
          <Label>Permissions</Label>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="manageAppointments"
                checked={formData.permissions.manageAppointments}
                onCheckedChange={() => handlePermissionChange("manageAppointments")}
              />
              <Label htmlFor="manageAppointments">Gérer les rendez-vous</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="viewPatientDetails"
                checked={formData.permissions.viewPatientDetails}
                onCheckedChange={() => handlePermissionChange("viewPatientDetails")}
              />
              <Label htmlFor="viewPatientDetails">Voir les détails des patients</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="editPatientDetails"
                checked={formData.permissions.editPatientDetails}
                onCheckedChange={() => handlePermissionChange("editPatientDetails")}
              />
              <Label htmlFor="editPatientDetails">Modifier les détails des patients</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cancelAppointments"
                checked={formData.permissions.cancelAppointments}
                onCheckedChange={() => handlePermissionChange("cancelAppointments")}
              />
              <Label htmlFor="cancelAppointments">Annuler des rendez-vous</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rescheduleAppointments"
                checked={formData.permissions.rescheduleAppointments}
                onCheckedChange={() => handlePermissionChange("rescheduleAppointments")}
              />
              <Label htmlFor="rescheduleAppointments">Reprogrammer des rendez-vous</Label>
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enregistrer les modifications
      </Button>
    </form>
  )
}

