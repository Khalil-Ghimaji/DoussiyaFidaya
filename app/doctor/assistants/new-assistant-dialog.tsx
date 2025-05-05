"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createAssistant } from "@/app/doctor/actions"
import { useRouter } from "next/navigation"

// New assistant form schema
const formSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  permissions: z
    .object({
      manageAppointments: z.boolean().default(false),
      viewPatientDetails: z.boolean().default(false),
      editPatientDetails: z.boolean().default(false),
      cancelAppointments: z.boolean().default(false),
      rescheduleAppointments: z.boolean().default(false),
    })
    .default({
      manageAppointments: false,
      viewPatientDetails: false,
      editPatientDetails: false,
      cancelAppointments: false,
      rescheduleAppointments: false,
    }),
  accessLevel: z.enum(["limited", "standard", "full"]),
})

export function NewAssistantDialog() {
  const router = useRouter()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      accessLevel: "limited",
      permissions: {
        manageAppointments: false,
        viewPatientDetails: false,
        editPatientDetails: false,
        cancelAppointments: false,
        rescheduleAppointments: false,
      },
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const assistantData = {
        ...values,
      }

      const result = await createAssistant(assistantData)

      if (result.success) {
        toast({
          title: "Assistant créé",
          description: "L'assistant a été créé avec succès.",
        })
        setIsDialogOpen(false)
        form.reset()
        router.refresh()
      } else {
        throw new Error(result.message || "Une erreur est survenue")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'assistant. Veuillez réessayer.",
        variant: "destructive",
      })
      console.error("Error creating assistant:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to set permissions based on access level
  function handleAccessLevelChange(value: string) {
    switch (value) {
      case "limited":
        form.setValue("permissions.manageAppointments", false)
        form.setValue("permissions.viewPatientDetails", false)
        form.setValue("permissions.editPatientDetails", false)
        form.setValue("permissions.cancelAppointments", false)
        form.setValue("permissions.rescheduleAppointments", false)
        break
      case "standard":
        form.setValue("permissions.manageAppointments", true)
        form.setValue("permissions.viewPatientDetails", true)
        form.setValue("permissions.editPatientDetails", false)
        form.setValue("permissions.cancelAppointments", true)
        form.setValue("permissions.rescheduleAppointments", true)
        break
      case "full":
        form.setValue("permissions.manageAppointments", true)
        form.setValue("permissions.viewPatientDetails", true)
        form.setValue("permissions.editPatientDetails", true)
        form.setValue("permissions.cancelAppointments", true)
        form.setValue("permissions.rescheduleAppointments", true)
        break
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un assistant</DialogTitle>
          <DialogDescription>Saisissez les informations pour créer un nouvel assistant</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom complet</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="assistant@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="+213 555 123 456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accessLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau d'accès</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleAccessLevelChange(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un niveau d'accès" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="limited">Limité</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="full">Complet</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Ajouter l'assistant
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

