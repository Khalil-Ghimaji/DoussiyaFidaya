"use server"

import { executeGraphQL } from "@/lib/graphql-client"
import { SEND_MESSAGE, SHARE_PATIENT_ACCESS } from "@/lib/graphql/mutations"
import { GET_CONVERSATIONS, GET_PATIENTS } from "@/lib/graphql/queries"
import { auth } from "@/lib/auth"

export async function getConversations() {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour accéder aux conversations")
  }

  try {
    const data = await executeGraphQL(GET_CONVERSATIONS, { userId: session.user.id })
    return { success: true, data: data.conversations }
  } catch (error) {
    console.error("Erreur lors de la récupération des conversations:", error)
    return { success: false, message: "Erreur lors de la récupération des conversations" }
  }
}

export async function sendMessage(data: { recipientId: string; content: string }) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour envoyer un message")
  }

  try {
    const result = await executeGraphQL(SEND_MESSAGE, {
      recipientId: data.recipientId,
      content: data.content,
    })

    return {
      success: result.sendMessage.success,
      message: result.sendMessage.message,
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error)
    return { success: false, message: "Erreur lors de l'envoi du message" }
  }
}

export async function sharePatientAccess(data: { doctorId: string; patientId: string }) {
  const session = await auth()

  if (!session?.user || session.user.role !== "doctor") {
    throw new Error("Vous devez être un médecin pour partager l'accès à un dossier patient")
  }

  try {
    const result = await executeGraphQL(SHARE_PATIENT_ACCESS, {
      doctorId: data.doctorId,
      patientId: data.patientId,
    })

    return {
      success: result.sharePatientAccess.success,
      message: result.sharePatientAccess.message,
      patientName: result.sharePatientAccess.patientName,
    }
  } catch (error) {
    console.error("Erreur lors du partage d'accès:", error)
    return { success: false, message: "Erreur lors du partage d'accès" }
  }
}

export async function getPatients() {
  const session = await auth()

  if (!session?.user || session.user.role !== "doctor") {
    throw new Error("Vous devez être un médecin pour accéder à la liste des patients")
  }

  try {
    const data = await executeGraphQL(GET_PATIENTS, {})
    return { success: true, data: data.patients }
  } catch (error) {
    console.error("Erreur lors de la récupération des patients:", error)
    return { success: false, message: "Erreur lors de la récupération des patients" }
  }
}

