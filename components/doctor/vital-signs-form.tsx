"use client"

import { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type VitalSignsFormProps = {
  form: UseFormReturn<{
    reason: string
    notes?: string
    diagnosis: string
    vitalSigns: {
      bloodPressure?: string
      heartRate?: string
      temperature?: string
      respiratoryRate?: string
      oxygenSaturation?: string
      weight?: string
    }
    prescriptions?: {
      _id?: string
      name: string
      dosage: string
      frequency: string
      duration: string
      quantity: string
    }[]
    labRequests?: {
      _id?: string
      type: string
      description: string
      priority: string
      laboratory?: string
      status?: string
      resultId?: string
    }[]
  }>  
}

export default function VitalSignsForm({ form }: VitalSignsFormProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="vitalSigns.bloodPressure"
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
        name="vitalSigns.heartRate"
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
        name="vitalSigns.temperature"
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
        name="vitalSigns.respiratoryRate"
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
        name="vitalSigns.oxygenSaturation"
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
        name="vitalSigns.weight"
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