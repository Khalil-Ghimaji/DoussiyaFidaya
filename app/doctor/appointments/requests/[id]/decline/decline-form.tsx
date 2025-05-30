"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { declineAppointmentRequest } from "@/app/doctor/actions"

// Define form schema
const formSchema = z.object({
  declineReason: z.enum(["unavailable", "inappropriate", "otherDoctor", "other"], {
    required_error: "Veuillez sélectionner une raison",
  }),
  alternativeSlot: z.string().optional(),
  message: z.string().min(10, "Le message doit comporter au moins 10 caractères").max(500).optional(),
})

export function DeclineAppointmentForm({ appointmentId }: { appointmentId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      declineReason: undefined,
      alternativeSlot: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const result = await declineAppointmentRequest(
        appointmentId,
        values.declineReason,
        values.message,
        values.alternativeSlot,
      )

      if (result.success) {
        toast({
          title: "Demande refusée",
          description: "La demande de rendez-vous a été refusée avec succès.",
        })
        router.push("/doctor/appointments")
      } else {
        throw new Error(result.message || "Une erreur est survenue")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de refuser la demande de rendez-vous. Veuillez réessayer.",
        variant: "destructive",
      })
      console.error("Error declining appointment request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refuser la demande de rendez-vous</CardTitle>
        <CardDescription>Veuillez fournir une raison pour le refus et éventuellement une alternative</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="declineReason"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Raison du refus</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="unavailable" />
                        </FormControl>
                        <FormLabel className="font-normal">Je ne suis pas disponible à cette date</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="inappropriate" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Cette demande n'est pas appropriée pour une consultation
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="otherDoctor" />
                        </FormControl>
                        <FormLabel className="font-normal">Je recommande un autre médecin</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">Autre raison</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alternativeSlot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proposer une alternative (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: Lundi 15 Mai, 10h-12h" {...field} />
                  </FormControl>
                  <FormDescription>Suggérez une date et heure alternative pour le rendez-vous</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ajoutez des informations supplémentaires ici..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le refus
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

