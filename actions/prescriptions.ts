"use server"

import { executeGraphQL } from "@/lib/graphql-client"
import {
  CREATE_PRESCRIPTION,
  UPDATE_PRESCRIPTION,
  RENEW_PRESCRIPTION,
  DELETE_PRESCRIPTION,
} from "@/lib/graphql/mutations/prescriptions"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function createPrescription(_, formData: FormData) {
  const session = await auth()

  if (!session?.user || session.user.role !== "doctor") {
    throw new Error("Vous devez être un médecin pour créer une ordonnance")
  }

  const patientId = formData.get("patientId") as string
  const doctorId = session.user.id as string
  const date = new Date().toISOString().split("T")[0]
  const expiryDate = formData.get("expiryDate") as string
  const instructions = formData.get("instructions") as string
  const renewals = formData.get("renewals") as string
  const validity = formData.get("validity") as string
  const isSigned = formData.get("isSigned") === "true"

  // Récupération des médicaments (format JSON)
  const medicationsJson = formData.get("medications") as string
  const medications = JSON.parse(medicationsJson)

  try {
    const result = await executeGraphQL(
      CREATE_PRESCRIPTION,
      {
        input: {
          patient: patientId,
          doctor: doctorId,
          date,
          expiryDate,
          medications,
          instructions,
          status: "active",
          isSigned,
          renewals,
          validity,
        },
      },
      true,
    )

    revalidatePath(`/doctor/prescriptions`)
    revalidatePath(`/doctor/patients/${patientId}`)

    return { success: true, message: "Ordonnance créée avec succès", data: result.createPrescription }
  } catch (error) {
    console.error("Erreur lors de la création de l'ordonnance:", error)
    return { success: false, message: "Erreur lors de la création de l'ordonnance" }
  }
}

export async function updatePrescription(_, formData: FormData) {
  const session = await auth()

  if (!session?.user || session.user.role !== "doctor") {
    throw new Error("Vous devez être un médecin pour modifier une ordonnance")
  }

  const prescriptionId = formData.get("prescriptionId") as string
  const patientId = formData.get("patientId") as string
  const doctorId = session.user.id as string
  const instructions = formData.get("instructions") as string
  const renewals = formData.get("renewals") as string
  const validity = formData.get("validity") as string
  const isSigned = formData.get("isSigned") === "true"

  // Récupération des médicaments (format JSON)
  const medicationsJson = formData.get("medications") as string
  const medications = JSON.parse(medicationsJson)

  try {
    const result = await executeGraphQL(
      UPDATE_PRESCRIPTION,
      {
        id: prescriptionId,
        input: {
          patient: patientId,
          doctor: doctorId,
          medications,
          instructions,
          isSigned,
          renewals,
          validity,
        },
      },
      true,
    )

    revalidatePath(`/doctor/prescriptions`)
    revalidatePath(`/doctor/prescriptions/${prescriptionId}`)
    revalidatePath(`/doctor/patients/${patientId}`)

    return { success: true, message: "Ordonnance modifiée avec succès", data: result.updatePrescription }
  } catch (error) {
    console.error("Erreur lors de la modification de l'ordonnance:", error)
    return { success: false, message: "Erreur lors de la modification de l'ordonnance" }
  }
}

export async function renewPrescription(_, formData: FormData) {
  const session = await auth()

  if (!session?.user || session.user.role !== "doctor") {
    throw new Error("Vous devez être un médecin pour renouveler une ordonnance")
  }

  const prescriptionId = formData.get("prescriptionId") as string
  const patientId = formData.get("patientId") as string
  const doctorId = session.user.id as string
  const instructions = formData.get("instructions") as string
  const renewals = formData.get("renewals") as string
  const validity = formData.get("validity") as string
  const isSigned = formData.get("isSigned") === "true"

  // Récupération des médicaments (format JSON)
  const medicationsJson = formData.get("medications") as string
  const medications = JSON.parse(medicationsJson)

  try {
    const result = await executeGraphQL(
      RENEW_PRESCRIPTION,
      {
        id: prescriptionId,
        input: {
          patient: patientId,
          doctor: doctorId,
          medications,
          instructions,
          isSigned,
          renewals,
          validity,
          status: "active",
        },
      },
      true,
    )

    revalidatePath(`/doctor/prescriptions`)
    revalidatePath(`/doctor/patients/${patientId}`)

    return { success: true, message: "Ordonnance renouvelée avec succès", data: result.renewPrescription }
  } catch (error) {
    console.error("Erreur lors du renouvellement de l'ordonnance:", error)
    return { success: false, message: "Erreur lors du renouvellement de l'ordonnance" }
  }
}

export async function deletePrescription(_, formData: FormData) {
  const session = await auth()

  if (!session?.user || session.user.role !== "doctor") {
    throw new Error("Vous devez être un médecin pour supprimer une ordonnance")
  }

  const prescriptionId = formData.get("prescriptionId") as string

  try {
    const result = await executeGraphQL(
      DELETE_PRESCRIPTION,
      {
        id: prescriptionId,
      },
      true,
    )

    if (result.deletePrescription.success) {
      revalidatePath(`/doctor/prescriptions`)
      return { success: true, message: "Ordonnance supprimée avec succès" }
    } else {
      return { success: false, message: result.deletePrescription.message || "Erreur lors de la suppression" }
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'ordonnance:", error)
    return { success: false, message: "Erreur lors de la suppression de l'ordonnance" }
  }
}

export async function createAndRedirect(_, formData: FormData) {
  const result = await createPrescription(formData)

  if (result.success && result.data?._id) {
    redirect(`/doctor/prescriptions/${result.data._id}`)
  }

  return result
}

export async function updateAndRedirect(_, formData: FormData) {
  const result = await updatePrescription(formData)
  const prescriptionId = formData.get("prescriptionId") as string

  if (result.success) {
    redirect(`/doctor/prescriptions/${prescriptionId}`)
  }

  return result
}

export async function renewAndRedirect(_, formData: FormData) {
  const result = await renewPrescription(formData)

  if (result.success && result.data?._id) {
    redirect(`/doctor/prescriptions/${result.data._id}`)
  } else {
    redirect(`/doctor/prescriptions`)
  }

  return result
}

