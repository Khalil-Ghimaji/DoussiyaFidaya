"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { executeGraphQL } from "@/lib/graphql-client"
import { gql } from "graphql-request"

// Define GraphQL queries/mutations here
const SEARCH_DOCTORS = gql`
  query SearchDoctors($query: String!) {
    searchDoctors(query: $query) {
      id
      name
      specialty
      title
    }
  }
`

export async function bookAppointment(formData: FormData) {
  const doctorId = formData.get("doctorId") as string

  try {
    // In a real application, we would create an appointment request here
    // or redirect to the appointment booking page with the doctor pre-selected

    // For now, we'll just redirect to the appointment booking page
    redirect(`/patient/appointments/new?doctorId=${doctorId}`)
  } catch (error) {
    console.error("Error booking appointment:", error)
    throw new Error("Failed to book appointment. Please try again.")
  }
}

export async function searchDoctors(query: string) {
  try {
    const { searchDoctors } = await executeGraphQL({
      query: SEARCH_DOCTORS,
      variables: { query },
    })

    return searchDoctors || []
  } catch (error) {
    console.error("Error searching doctors:", error)
    return []
  }
}

export async function requestDoctorInfo(formData: FormData) {
  const doctorId = formData.get("doctorId") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const message = formData.get("message") as string

  try {
    // In a real application, we would send this information to the backend
    // For now, we'll just simulate a successful request

    // Revalidate the doctor's page to show the updated request status
    revalidatePath(`/doctors/${doctorId}`)

    return { success: true, message: "Your request has been sent successfully." }
  } catch (error) {
    console.error("Error requesting doctor information:", error)
    return {
      success: false,
      message: "Failed to send your request. Please try again.",
    }
  }
}

