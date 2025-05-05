"use server"

import { graphqlClient } from "@/lib/graphql/client"
import { SUBMIT_CONTACT_FORM } from "@/lib/graphql/mutations/contact"

export async function submitContactForm(_, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string

  try {
    const { submitContactForm } = await graphqlClient.request(SUBMIT_CONTACT_FORM, {
      input: {
        name,
        email,
        subject,
        message,
      },
    })

    return {
      success: submitContactForm.success,
      message: submitContactForm.message,
      ticketId: submitContactForm.ticketId,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while submitting your message",
    }
  }
}

