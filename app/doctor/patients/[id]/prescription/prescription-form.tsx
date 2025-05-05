"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"

type Patient = {
  _id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  bloodType: string
  allergies: string[]
  medications: string[]
  profileImage: string
}

type PrescriptionFormProps = {
  patient: Patient
}

// Define the form schema
const prescriptionFormSchema = z.object({
  diagnosis: z.string().min(3, "Le diagnostic doit contenir au moins 3 caractères"),
  medications: z
    .array(
      z.object({
        name: z.string().min(1, "Le nom du médicament est requis"),
        dosage: z.string().min(1, "Le dosage est requis"),
        frequency: z.string().min(1, "La fréquence est requise"),
        duration: z.string().min(1, "La durée est requise"),
        instructions: z.string().optional(),
      }),
    )
    .min(1, "Au moins un médicament doit être prescrit"),
  notes: z.string().optional(),
  renewable: z.boolean().default(false),
  renewalCount: z.string().optional(),
  longTermTreatment: z.boolean().default(false),
})

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>

export function PrescriptionForm({ patient }: PrescriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Initialize the form with default values
  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      diagnosis: "",
      medications: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
      notes: "",
      renewable: false,
      renewalCount: "0",
      longTermTreatment: false,
    },
  })

  // Handle form submission
}

