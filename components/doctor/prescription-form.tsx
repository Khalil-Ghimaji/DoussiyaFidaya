"use client"

import { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"

type PrescriptionFormProps = {
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

export default function PrescriptionForm({ form }: PrescriptionFormProps) {
  const prescriptions = form.watch("prescriptions") || []

  const addPrescription = () => {
    form.setValue("prescriptions", [
      ...prescriptions,
      {
        medications: [
          {
            name: "",
            dosage: "",
            frequency: "",
            duration: "",
            quantity: "",
          },
        ],
      },
    ])
  }

  const addMedication = (prescriptionIndex: number) => {
    const prescription = prescriptions[prescriptionIndex]
    form.setValue(`prescriptions.${prescriptionIndex}.medications`, [
      ...prescription.medications,
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        quantity: "",
      },
    ])
  }

  const removePrescription = (index: number) => {
    form.setValue(
      "prescriptions",
      prescriptions.filter((_, i) => i !== index)
    )
  }

  const removeMedication = (prescriptionIndex: number, medicationIndex: number) => {
    const prescription = prescriptions[prescriptionIndex]
    form.setValue(
      `prescriptions.${prescriptionIndex}.medications`,
      prescription.medications.filter((_, i) => i !== medicationIndex)
    )
  }

  return (
    <div className="space-y-6">
      {prescriptions.map((prescription, prescriptionIndex) => (
        <div key={prescriptionIndex} className="space-y-4 p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Ordonnance {prescriptionIndex + 1}</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removePrescription(prescriptionIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {prescription.medications.map((_, medicationIndex) => (
            <div key={medicationIndex} className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Médicament {medicationIndex + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMedication(prescriptionIndex, medicationIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <FormField
                control={form.control}
                name={`prescriptions.${prescriptionIndex}.medications.${medicationIndex}.name`}
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
                name={`prescriptions.${prescriptionIndex}.medications.${medicationIndex}.dosage`}
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
                name={`prescriptions.${prescriptionIndex}.medications.${medicationIndex}.frequency`}
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
                name={`prescriptions.${prescriptionIndex}.medications.${medicationIndex}.duration`}
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
                name={`prescriptions.${prescriptionIndex}.medications.${medicationIndex}.quantity`}
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
            onClick={() => addMedication(prescriptionIndex)}
            className="w-full mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un médicament
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addPrescription} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une ordonnance
      </Button>
    </div>
  )
} 