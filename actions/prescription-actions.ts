"use server"

import { auth } from "@/lib/auth"
import { executeGraphQL } from "@/lib/graphql-client"
import { CREATE_PRESCRIPTION, UPDATE_PRESCRIPTION, RENEW_PRESCRIPTION } from "@/lib/graphql/mutations/prescriptions"
import {
  CREATE_QUICK_CONSULTATION,
  CREATE_CONSULTATION_PRESCRIPTION,
  CREATE_LAB_REQUEST,
} from "@/lib/graphql/mutations/consultations"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createPrescription(_, formData: FormData) {
  const session = await auth()

  if (!session?.user || session.user.role !== "doctor") {
    throw new Error("Vous devez être un médecin pour créer une ordonnance")
  }

  try {
    const patientId = formData.get("patientId") as string
    const doctorId = session.user.id

    // Parse medications from JSON string
    const medicationsJson = formData.get("medications") as string
    const medications = JSON.parse(medicationsJson)

    const instructions = formData.get("instructions") as string
    const renewals = formData.get("renewals") as string
    const validity = formData.get("validity") as string
    const isSigned = formData.get("isSigned") === "true"

    // Calculate expiry date based on validity
    const date = new Date()
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + Number.parseInt(validity))

    const input = {
      patient: patientId,
      doctor: doctorId,
      date: date.toISOString(),
      expiryDate: expiryDate.toISOString(),
      medications,
      instructions,
      renewals,
      validity,
      isSigned,
      status: "active",
    }

    const result = await executeGraphQL(CREATE_PRESCRIPTION, { input }, true)

    if (!result.createPrescription) {
      throw new Error("Erreur lors de la création de l'ordonnance")
    }

    // Revalidate the prescriptions list and redirect to the new prescription
    revalidatePath("/doctor/prescriptions")
    redirect(`/doctor/prescriptions/${result.createPrescription._id}`)
  } catch (error) {
    console.error("Error creating prescription:", error)
    throw new Error("Erreur lors de la création de l'ordonnance")
  }
}

export async function updatePrescription(prescriptionId: string, formData: FormData) {
  const session = await auth()

  if (!session?.user || session.user.role !== "doctor") {
    throw new Error("Vous devez être un médecin pour modifier une ordonnance")
  }

  try {
    const patientId = formData.get("patientId") as string
    const doctorId = session.user.id

    // Parse medications from JSON string
    const medicationsJson = formData.get("medications") as string
    const medications = JSON.parse(medicationsJson)

    const instructions = formData.get("instructions") as string
    const renewals = formData.get("renewals") as string
    const validity = formData.get("validity") as string
    const isSigned = formData.get("isSigned") === "true"

    // Calculate expiry date based on validity
    const date = new Date(formData.get("date") as string)
    const expiryDate = new Date(date)
    expiryDate.setMonth(expiryDate.getMonth() + Number.parseInt(validity))

    const input = {
      patient: patientId,
      doctor: doctorId,
      date: date.toISOString(),
      expiryDate: expiryDate.toISOString(),
      medications,
      instructions,
      renewals,
      validity,
      isSigned,
      status: "active",
    }

    const result = await executeGraphQL(
      UPDATE_PRESCRIPTION,
      {
        id: prescriptionId,
        input,
      },
      true,
    )

    if (!result.updatePrescription) {
      throw new Error("Erreur lors de la modification de l'ordonnance")
    }

    // Revalidate the prescriptions list and redirect to the updated prescription
    revalidatePath("/doctor/prescriptions")
    revalidatePath(`/doctor/prescriptions/${prescriptionId}`)
    redirect(`/doctor/prescriptions/${prescriptionId}`)
  } catch (error) {
    console.error("Error updating prescription:", error)
    throw new Error("Erreur lors de la modification de l'ordonnance")
  }
}

export async function renewPrescription(originalPrescriptionId: string, formData: FormData) {
  const session = await auth()

  if (!session?.user || session.user.role !== "doctor") {
    throw new Error("Vous devez être un médecin pour renouveler une ordonnance")
  }

  try {
    const patientId = formData.get("patientId") as string
    const doctorId = session.user.id

    // Parse medications from JSON string
    const medicationsJson = formData.get("medications") as string
    const medications = JSON.parse(medicationsJson)

    const instructions = formData.get("instructions") as string
    const renewals = formData.get("renewals") as string
    const validity = formData.get("validity") as string
    const isSigned = formData.get("isSigned") === "true"

    // Calculate new dates for the renewed prescription
    const date = new Date()
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + Number.parseInt(validity))

    const input = {
      patient: patientId,
      doctor: doctorId,
      date: date.toISOString(),
      expiryDate: expiryDate.toISOString(),
      medications,
      instructions,
      renewals,
      validity,
      isSigned,
      status: "active",
      originalPrescription: originalPrescriptionId,
    }

    const result = await executeGraphQL(
      RENEW_PRESCRIPTION,
      {
        id: originalPrescriptionId,
        input,
      },
      true,
    )

    if (!result.renewPrescription) {
      throw new Error("Erreur lors du renouvellement de l'ordonnance")
    }

    // Revalidate the prescriptions list and redirect to the new prescription
    revalidatePath("/doctor/prescriptions")
    redirect(`/doctor/prescriptions/${result.renewPrescription._id}`)
  } catch (error) {
    console.error("Error renewing prescription:", error)
    throw new Error("Erreur lors du renouvellement de l'ordonnance")
  }
}

export async function createQuickConsultation(_, formData: FormData) {
  const session = await auth()

  if (!session?.user || session.user.role !== "doctor") {
    throw new Error("Vous devez être un médecin pour créer une consultation")
  }

  try {
    const patientId = formData.get("patientId") as string
    const doctorId = session.user.id
    const notes = formData.get("notes") as string
    const diagnosis = formData.get("diagnosis") as string

    // Parse vital signs
    const vitalSignsJson = formData.get("vitalSigns") as string
    const vitalSigns = JSON.parse(vitalSignsJson)

    // Create consultation
    const consultationInput = {
      patient: patientId,
      doctor: doctorId,
      date: new Date().toISOString(),
      notes,
      diagnosis,
      vitalSigns,
      status: "completed",
    }

    const result = await executeGraphQL(
      CREATE_QUICK_CONSULTATION,
      {
        input: consultationInput,
      },
      true,
    )

    if (!result.createConsultation) {
      throw new Error("Erreur lors de la création de la consultation")
    }

    // If prescription data is provided, create a prescription
    const hasPrescription = formData.get("hasPrescription") === "true"
    if (hasPrescription) {
      const medicationsJson = formData.get("medications") as string
      const medications = JSON.parse(medicationsJson)
      const prescriptionInstructions = formData.get("prescriptionInstructions") as string

      if (medications && medications.length > 0) {
        const prescriptionInput = {
          patient: patientId,
          doctor: doctorId,
          consultation: result.createConsultation._id,
          date: new Date().toISOString(),
          medications,
          instructions: prescriptionInstructions,
          renewals: "0",
          validity: "3",
          isSigned: true,
          status: "active",
        }

        await executeGraphQL(
          CREATE_CONSULTATION_PRESCRIPTION,
          {
            consultationId: result.createConsultation._id,
            input: prescriptionInput,
          },
          true,
        )
      }
    }

    // If lab request data is provided, create lab requests
    const hasLabRequests = formData.get("hasLabRequests") === "true"
    if (hasLabRequests) {
      const labRequestsJson = formData.get("labRequests") as string
      const labRequests = JSON.parse(labRequestsJson)

      if (labRequests && labRequests.length > 0) {
        for (const request of labRequests) {
          const labRequestInput = {
            patient: patientId,
            doctor: doctorId,
            consultation: result.createConsultation._id,
            requestDate: new Date().toISOString(),
            type: request.type,
            priority: request.priority,
            laboratory: request.laboratory,
            status: "pending",
          }

          await executeGraphQL(
            CREATE_LAB_REQUEST,
            {
              input: labRequestInput,
            },
            true,
          )
        }
      }
    }

    // Revalidate relevant paths and redirect to patient page
    revalidatePath(`/doctor/patients/${patientId}`)
    redirect(`/doctor/patients/${patientId}`)
  } catch (error) {
    console.error("Error creating quick consultation:", error)
    throw new Error("Erreur lors de la création de la consultation rapide")
  }
}

