"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getAuthenticatedClient } from "@/lib/graphql/client"
import { UPDATE_USER_PROFILE } from "@/lib/graphql/mutations/user"
import { GET_CURRENT_USER } from "@/lib/graphql/queries/user"

export async function getCurrentUser() {
  const token = cookies().get("auth_token")?.value

  if (!token) {
    return null
  }

  try {
    const client = getAuthenticatedClient(token)
    const { currentUser } = await client.request(GET_CURRENT_USER)
    return currentUser
  } catch (error) {
    // If there's an error fetching the user, clear the token and return null
    cookies().delete("auth_token")
    return null
  }
}

export async function updateUserProfile(_, formData: FormData) {
  const token = cookies().get("auth_token")?.value

  if (!token) {
    redirect("/auth/login")
  }

  try {
    const client = getAuthenticatedClient(token)
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      redirect("/auth/login")
    }

    const input = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: {
        street: formData.get("street") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        postalCode: formData.get("postalCode") as string,
        country: formData.get("country") as string,
      },
      dateOfBirth: formData.get("dateOfBirth") as string,
      gender: formData.get("gender") as string,
    }

    const { updateUserProfile } = await client.request(UPDATE_USER_PROFILE, {
      userId: currentUser.id,
      input,
    })

    return {
      success: true,
      user: updateUserProfile,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while updating your profile",
    }
  }
}

