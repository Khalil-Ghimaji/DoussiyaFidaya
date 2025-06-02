"use server"

import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { sendGraphQLMutation } from "@/lib/graphql-client"

export async function createPrescription(patientId: string, formData: FormData,session: any) {
const medications = []
  let index = 0

  while (formData.get(`medications.${index}.name`)) {
    const name = formData.get(`medications.${index}.name`) as string
    const dosage = formData.get(`medications.${index}.dosage`) as string
    const frequency = formData.get(`medications.${index}.frequency`) as string
    const duration = formData.get(`medications.${index}.duration`) as string
    const quantity = parseFloat(formData.get(`medications.${index}.quantity`) as string) || 1
    if (name && dosage && frequency && duration) {
      medications.push({ name, dosage, frequency, duration, quantity })
    }

    index++
  }

  if (medications.length === 0) {
    return false
  }

  const variableDefinitions = medications
    .map(
      (_, i) => `
        $medication${i + 1}Name: String!
        $medication${i + 1}Dosage: String!
        $medication${i + 1}Frequency: String!
        $medication${i + 1}Duration: String!
        $medication${i + 1}Quantity: Float!`
    )
    .join("\n")

  const medicationInputs = medications
    .map(
      (_, i) => `{
        name: $medication${i + 1}Name,
        dosage: $medication${i + 1}Dosage,
        frequency: $medication${i + 1}Frequency,
        duration: $medication${i + 1}Duration,
        quantity: $medication${i + 1}Quantity
      }`
    )
    .join(",\n")

  const mutation = `
    mutation CreatePrescriptionWithMedications(
      $patientId: String!
      $doctorId: String!
      $date: DateTimeISO!
      $isSigned: Boolean!
      $status: prescriptions_status_enum!
      ${variableDefinitions}
    ) {
      createOnePrescriptions(
        data: {
          date: $date
          is_signed: $isSigned
          status: $status
          patients: { connect: { id: $patientId } }
          doctors: { connect: { id: $doctorId } }
          medications: {
            create: [
              ${medicationInputs}
            ]
          }
        }
      ) {
        id
        date
        status
        patients { id }
        doctors { id }
        medications {
          id
          name
          dosage
          frequency
          duration
          quantity
        }
      }
    }
  `.trim()

  const variables: Record<string, any> = {
    patientId,
    doctorId: session.user.id,
    date: new Date().toISOString(),
    isSigned: true,
    status: "Pending",
  }

  medications.forEach((med, i) => {
    const idx = i + 1
    variables[`medication${idx}Name`] = med.name
    variables[`medication${idx}Dosage`] = med.dosage
    variables[`medication${idx}Frequency`] = med.frequency
    variables[`medication${idx}Duration`] = med.duration
    variables[`medication${idx}Quantity`] = med.quantity
  })

  // Wrap only the mutation and logic in try/catch
  let result
  try {
    result = await sendGraphQLMutation(mutation, variables)
    return result
  } catch (error) {
    console.error("Error during GraphQL mutation:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur inattendue est survenue",
    }
  }
}
export async function createPrescriptionAction(patientId: string, formData: FormData) {
  //TODO: Replace with actual session management
  const session = {
    user: {
      id: "fc6d9c2c-6ec6-48c1-b762-fe35c2894b30", // Simulated logged-in doctor
    },
  }

  const result = await createPrescription(patientId, formData, session)

  const prescription = await result?.data?.createOnePrescriptions

  if (prescription?.id) {
    revalidateTag("prescriptions")
    revalidateTag(`patient-${patientId}`)
    redirect(`/doctor/patients/${patientId}`) // throws NEXT_REDIRECT – do not catch
  }

  return { success: false, message: "Erreur lors de la création de l'ordonnance" }
}
