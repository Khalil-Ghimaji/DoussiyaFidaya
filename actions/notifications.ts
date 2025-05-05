"use server"

import { executeGraphQL } from "@/lib/graphql-client"
import { DELETE_NOTIFICATION, MARK_ALL_NOTIFICATIONS_AS_READ, MARK_NOTIFICATION_AS_READ } from "@/lib/graphql/mutations"
import { GET_NOTIFICATIONS } from "@/lib/graphql/queries"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function getNotifications() {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour accéder aux notifications")
  }

  try {
    const data = await executeGraphQL(GET_NOTIFICATIONS, { userId: session.user.id })
    return { success: true, data: data.notifications }
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error)
    return { success: false, message: "Erreur lors de la récupération des notifications" }
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour marquer une notification comme lue")
  }

  try {
    const result = await executeGraphQL(MARK_NOTIFICATION_AS_READ, { notificationId })

    revalidatePath("/")

    return {
      success: result.markNotificationAsRead.success,
      message: result.markNotificationAsRead.message,
    }
  } catch (error) {
    console.error("Erreur lors du marquage de la notification comme lue:", error)
    return { success: false, message: "Erreur lors du marquage de la notification comme lue" }
  }
}

export async function markAllNotificationsAsRead() {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour marquer les notifications comme lues")
  }

  try {
    const result = await executeGraphQL(MARK_ALL_NOTIFICATIONS_AS_READ, { userId: session.user.id })

    revalidatePath("/")

    return {
      success: result.markAllNotificationsAsRead.success,
      message: result.markAllNotificationsAsRead.message,
    }
  } catch (error) {
    console.error("Erreur lors du marquage des notifications comme lues:", error)
    return { success: false, message: "Erreur lors du marquage des notifications comme lues" }
  }
}

export async function deleteNotification(notificationId: string) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour supprimer une notification")
  }

  try {
    const result = await executeGraphQL(DELETE_NOTIFICATION, { notificationId })

    revalidatePath("/")

    return {
      success: result.deleteNotification.success,
      message: result.deleteNotification.message,
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de la notification:", error)
    return { success: false, message: "Erreur lors de la suppression de la notification" }
  }
}

export async function createNotification({ recipientId, type, content, relatedPatientId = null }) {
  try {
    // This would be a GraphQL mutation in the real implementation
    // For now, we'll just return a success message
    return { success: true, message: "Notification créée avec succès" }
  } catch (error) {
    console.error("Erreur lors de la création de la notification:", error)
    return { success: false, message: "Erreur lors de la création de la notification" }
  }
}

