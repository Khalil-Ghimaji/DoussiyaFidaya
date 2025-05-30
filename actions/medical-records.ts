"use server"

import { executeGraphQL } from "@/lib/graphql-client"
import { AUTHORIZE_DOCTOR, REVOKE_DOCTOR, UPDATE_MEDICAL_RECORD } from "@/lib/graphql/mutations"
import { GET_MEDICAL_RECORD } from "@/lib/graphql/queries"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function getMedicalRecord(patientId: string) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour accéder au dossier médical")
  }

  try {
    const data = await executeGraphQL(GET_MEDICAL_RECORD, { patientId })

    // If no data returned, the user might not have access
    if (!data.medicalRecord) {
      throw new Error("Vous n'êtes pas autorisé à accéder à ce dossier médical")
    }

    return { success: true, data: data.medicalRecord }
  } catch (error) {
    console.error("Erreur lors de la récupération du dossier médical:", error)
    return { success: false, message: "Erreur lors de la récupération du dossier médical" }
  }
}

export async function updateMedicalRecord(_, formData: FormData) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "doctor" && session.user.role !== "admin")) {
    throw new Error("Vous devez être un médecin pour mettre à jour un dossier médical")
  }

  const recordId = formData.get("recordId") as string
  const allergiesJson = formData.get("allergies") as string
  const allergies = JSON.parse(allergiesJson)
  const medicalHistoryJson = formData.get("medicalHistory") as string
  const medicalHistory = JSON.parse(medicalHistoryJson)
  const bloodType = formData.get("bloodType") as string

  try {
    const result = await executeGraphQL(UPDATE_MEDICAL_RECORD, {
      recordId,
      data: {
        allergies,
        medicalHistory,
        bloodType,
      },
    })

    const patientId = result.updateMedicalRecord.patient._id

    revalidatePath(`/patient/dashboard`)
    revalidatePath(`/doctor/patients/${patientId}`)

    return { success: true, message: "Dossier médical mis à jour avec succès" }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du dossier médical:", error)
    return { success: false, message: "Erreur lors de la mise à jour du dossier médical" }
  }
}

export async function authorizeDoctor(patientId: string, doctorId: string) {
  const session = await auth()

  if (
    !session?.user ||
    (session.user.role !== "patient" && session.user.id !== patientId && session.user.role !== "admin")
  ) {
    throw new Error("Vous n'êtes pas autorisé à modifier les autorisations")
  }

  try {
    const result = await executeGraphQL(AUTHORIZE_DOCTOR, {
      patientId,
      doctorId,
    })

    revalidatePath(`/patient/dashboard`)

    return {
      success: result.authorizeDoctor.success,
      message: result.authorizeDoctor.message,
    }
  } catch (error) {
    console.error("Erreur lors de l'autorisation du médecin:", error)
    return { success: false, message: "Erreur lors de l'autorisation du médecin" }
  }
}

export async function revokeDoctor(patientId: string, doctorId: string) {
  const session = await auth()

  if (
    !session?.user ||
    (session.user.role !== "patient" && session.user.id !== patientId && session.user.role !== "admin")
  ) {
    throw new Error("Vous n'êtes pas autorisé à modifier les autorisations")
  }

  try {
    const result = await executeGraphQL(REVOKE_DOCTOR, {
      patientId,
      doctorId,
    })

    revalidatePath(`/patient/dashboard`)

    return {
      success: result.revokeDoctor.success,
      message: result.revokeDoctor.message,
    }
  } catch (error) {
    console.error("Erreur lors de la révocation de l'autorisation:", error)
    return { success: false, message: "Erreur lors de la révocation de l'autorisation" }
  }
}

