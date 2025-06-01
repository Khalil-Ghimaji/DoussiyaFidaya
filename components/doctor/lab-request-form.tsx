"use client"

import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"

type LabRequestFormProps = {
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

export default function LabRequestForm({ form }: LabRequestFormProps) {
  const labRequests = form.watch("labRequests") || []

  const addLabRequest = () => {
    form.setValue("labRequests", [
      ...labRequests,
      {
        type: "",
        description: "",
        priority: "",
        laboratory: "",
        status: "",
        resultId: "",
      },
    ])
  }

  const removeLabRequest = (index: number) => {
    form.setValue(
      "labRequests",
      labRequests.filter((_, i) => i !== index)
    )
  }

  return (
    <div className="space-y-6">
      {labRequests.map((_, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Analyse {index + 1}</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeLabRequest(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <FormField
            control={form.control}
            name={`labRequests.${index}.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type d'analyse</FormLabel>
                <FormControl>
                  <Input placeholder="Prise de sang, Radiographie, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`labRequests.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Détails de l'analyse demandée..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addLabRequest} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une analyse
      </Button>
    </div>
  )
} 