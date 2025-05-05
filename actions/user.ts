"use server"

import { executeGraphQL } from "@/lib/graphql-client"
import { CHANGE_PASSWORD, UPDATE_NOTIFICATION_PREFERENCES, UPDATE_USER_PROFILE } from "@/lib/graphql/mutations"
import { GET_USER_PROFILE } from "@/lib/graphql/queries"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function getUserProfile() {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour accéder à votre profil")
  }

  try {
    const data = await executeGraphQL(GET_USER_PROFILE, { userId: session.user.id })

    // Add mock sessions for demonstration
    const mockSessions = [
      {
        id: "current-session",
        device: "Chrome sur Windows",
        location: "Paris, France",
        lastActive: new Date().toISOString(),
        isCurrent: true,
      },
      {
        id: "session-2",
        device: "Firefox sur MacOS",
        location: "Lyon, France",
        lastActive: new Date(Date.now() - 86400000).toISOString(),
        isCurrent: false,
      },
    ]

    return { success: true, data: data.user, sessions: mockSessions }
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    return { success: false, message: "Erreur lors de la récupération du profil" }
  }
}

export async function updateUserProfile(_, formData) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour mettre à jour votre profil")
  }

  const userId = formData.get("userId")

  // Vérifier que l'utilisateur modifie bien son propre profil
  if (userId !== session.user.id) {
    throw new Error("Vous n'êtes pas autorisé à modifier ce profil")
  }

  try {
    const userData = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone") || null,
    }

    // Ajouter des champs spécifiques au rôle
    if (session.user.role === "doctor") {
      userData.speciality = formData.get("speciality") || null
    }

    if (session.user.role === "patient") {
      userData.birthDate = formData.get("birthDate") ? new Date(formData.get("birthDate")).toISOString() : null
      userData.address = formData.get("address") || null
    }

    const result = await executeGraphQL(UPDATE_USER_PROFILE, {
      userId,
      userData,
    })

    revalidatePath("/profile")

    return { success: true, message: "Profil mis à jour avec succès" }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    return { success: false, message: "Erreur lors de la mise à jour du profil" }
  }
}

export async function changePassword({ currentPassword, newPassword }) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour changer votre mot de passe")
  }

  try {
    const result = await executeGraphQL(CHANGE_PASSWORD, {
      userId: session.user.id,
      currentPassword,
      newPassword,
    })

    return {
      success: result.changePassword.success,
      message: result.changePassword.message,
    }
  } catch (error) {
    console.error("Erreur lors de la modification du mot de passe:", error)
    return { success: false, message: "Erreur lors de la modification du mot de passe" }
  }
}

export async function updateNotificationPreferences(preferences) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour mettre à jour vos préférences")
  }

  try {
    const result = await executeGraphQL(UPDATE_NOTIFICATION_PREFERENCES, {
      userId: session.user.id,
      preferences,
    })

    revalidatePath("/profile")

    return {
      success: result.updateNotificationPreferences.success,
      message: result.updateNotificationPreferences.message,
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour des préférences:", error)
    return { success: false, message: "Erreur lors de la mise à jour des préférences" }
  }
}

