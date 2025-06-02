"use client"

import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"

type PrescriptionFormProps = {
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

export default function PrescriptionForm({ form }: PrescriptionFormProps) {
  const medications = form.watch("prescriptions") || []
  console.log("these are the medications", medications)
  const addMedication = () => {
    form.setValue("prescriptions", [
      ...medications,
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        quantity: "",
      },
    ])
  }

  const removeMedication = (medicationIndex: number) => {
    form.setValue(
      "prescriptions",
      medications.filter((_, i) => i !== medicationIndex)
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="text-lg font-medium">Ordonnance</h3>

        {medications.map((_, medicationIndex) => (
          <div key={medicationIndex} className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Médicament {medicationIndex + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeMedication(medicationIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <FormField
              control={form.control}
              name={`prescriptions.${medicationIndex}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du médicament</FormLabel>
                  <FormControl>
                    <Input placeholder="Paracétamol" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`prescriptions.${medicationIndex}.dosage`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posologie</FormLabel>
                  <FormControl>
                    <Input placeholder="1000mg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`prescriptions.${medicationIndex}.frequency`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fréquence</FormLabel>
                  <FormControl>
                    <Input placeholder="3 fois par jour" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`prescriptions.${medicationIndex}.duration`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée</FormLabel>
                  <FormControl>
                    <Input placeholder="7 jours" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`prescriptions.${medicationIndex}.quantity`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité</FormLabel>
                  <FormControl>
                    <Input placeholder="1 boîte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addMedication}
          className="w-full mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un médicament
        </Button>
      </div>
    </div>
  )
}
