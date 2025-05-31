"use client"

import { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type VitalSignsFormProps = {
  form: UseFormReturn<{
    section: string
    notes?: string
    measures: {
      bloodPressure?: string
      heartRate?: string
      temperature?: string
      respiratoryRate?: string
      oxygenSaturation?: string
      weight?: string
    }
    prescriptions?: {
      medications: {
        name: string
        dosage: string
        frequency: string
        duration: string
        quantity: string
      }[]
    }[]
    lab_requests?: {
      type: string
      description: string
    }[]
  }>
}

export default function VitalSignsForm({ form }: VitalSignsFormProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="measures.bloodPressure"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tension artérielle (mmHg)</FormLabel>
            <FormControl>
              <Input placeholder="120/80" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="measures.heartRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fréquence cardiaque (bpm)</FormLabel>
            <FormControl>
              <Input placeholder="80" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="measures.temperature"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Température (°C)</FormLabel>
            <FormControl>
              <Input placeholder="37.0" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="measures.respiratoryRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fréquence respiratoire (rpm)</FormLabel>
            <FormControl>
              <Input placeholder="16" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="measures.oxygenSaturation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Saturation en oxygène (%)</FormLabel>
            <FormControl>
              <Input placeholder="98" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="measures.weight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Poids (kg)</FormLabel>
            <FormControl>
              <Input placeholder="70" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
} 