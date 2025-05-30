"use server"

import { revalidateTag } from "next/cache"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { auth } from "@/lib/auth"

// Appointment actions
export async function declineAppointmentRequest(
  appointmentId: string,
  declineReason: string,
  message?: string,
  alternativeSlot?: string,
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" }
    }

    const mutation = `
      mutation DeclineAppointment($input: DeclineAppointmentInput!) {
        declineAppointment(input: $input) {
          success
          message
        }
      }
    `

    const result = await executeGraphQLServer(
      mutation,
      {
        input: {
          appointmentId,
          doctorId: session.user.id,
          declineReason,
          message,
          alternativeSlot,
        },
      },
      { cache: "no-store" },
    )

    // Revalidate related data
    revalidateTag("appointments")

    return { success: true }
  } catch (error) {
    console.error("Error declining appointment:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    }
  }
}

// Consultation actions
export async function createConsultation(consultationData: any) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" }
    }

    const mutation = `
      mutation CreateConsultation($input: ConsultationInput!) {
        createConsultation(input: $input) {
          _id
          success
          message
        }
      }
    `

    const result = await executeGraphQLServer(
      mutation,
      {
        input: {
          ...consultationData,
          doctorId: session.user.id,
        },
      },
      { cache: "no-store" },
    )

    // Revalidate related data
    revalidateTag("consultations")
    revalidateTag("appointments")
    revalidateTag(`patient-${consultationData.patientId}`)

    return { success: true, consultationId: result.createConsultation._id }
  } catch (error) {
    console.error("Error creating consultation:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    }
  }
}

// Patient actions
export async function createPatient(patientData: any) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" }
    }

    const mutation = `
      mutation CreatePatient($input: PatientInput!) {
        createPatient(input: $input) {
          _id
          success
          message
        }
      }
    `

    const result = await executeGraphQLServer(
      mutation,
      {
        input: {
          ...patientData,
          doctorId: session.user.id,
        },
      },
      { cache: "no-store" },
    )

    // Revalidate related data
    revalidateTag("patients")

    return { success: true, patientId: result.createPatient._id }
  } catch (error) {
    console.error("Error creating patient:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    }
  }
}

export async function updatePatient(patientId: string, patientData: any) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" }
    }

    const mutation = `
      mutation UpdatePatient($input: UpdatePatientInput!) {
        updatePatient(input: $input) {
          success
          message
        }
      }
    `

    const result = await executeGraphQLServer(
      mutation,
      {
        input: {
          patientId,
          doctorId: session.user.id,
          ...patientData,
        },
      },
      { cache: "no-store" },
    )

    // Revalidate related data
    revalidateTag("patients")
    revalidateTag(`patient-${patientId}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating patient:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    }
  }
}

// Emergency access actions
export async function respondToEmergencyAccess(requestId: string, approved: boolean, notes?: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" }
    }

    const mutation = `
      mutation RespondToEmergencyAccess($input: EmergencyAccessResponseInput!) {
        respondToEmergencyAccess(input: $input) {
          success
          message
        }
      }
    `

    const result = await executeGraphQLServer(
      mutation,
      {
        input: {
          requestId,
          doctorId: session.user.id,
          approved,
          notes,
        },
      },
      { cache: "no-store" },
    )

    // Revalidate related data
    revalidateTag("emergency-access")

    return { success: true }
  } catch (error) {
    console.error("Error responding to emergency access:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    }
  }
}

// Message actions
export async function markMessageAsRead(messageId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" }
    }

    const mutation = `
      mutation MarkMessageAsRead($input: MarkMessageInput!) {
        markMessageAsRead(input: $input) {
          success
          message
        }
      }
    `

    const result = await executeGraphQLServer(
      mutation,
      {
        input: {
          messageId,
          userId: session.user.id,
        },
      },
      { cache: "no-store" },
    )

    // Revalidate related data
    revalidateTag("messages")

    return { success: true }
  } catch (error) {
    console.error("Error marking message as read:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    }
  }
}

export async function sendMessage(messageData: any) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" }
    }

    const mutation = `
      mutation SendMessage($input: MessageInput!) {
        sendMessage(input: $input) {
          _id
          success
          message
        }
      }
    `

    const result = await executeGraphQLServer(
      mutation,
      {
        input: {
          ...messageData,
          senderId: session.user.id,
        },
      },
      { cache: "no-store" },
    )

    // Revalidate related data
    revalidateTag("messages")

    return { success: true, messageId: result.sendMessage._id }
  } catch (error) {
    console.error("Error sending message:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    }
  }
}

// Lab request actions
export async function createLabRequest(labRequestData: any) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" }
    }

    const mutation = `
      mutation CreateLabRequest($input: LabRequestInput!) {
        createLabRequest(input: $input) {
          _id
          success
          message
        }
      }
    `

    const result = await executeGraphQLServer(
      mutation,
      {
        input: {
          ...labRequestData,
          doctorId: session.user.id,
        },
      },
      { cache: "no-store" },
    )

    // Revalidate related data
    revalidateTag("lab-requests")
    revalidateTag(`patient-${labRequestData.patientId}`)

    return { success: true, labRequestId: result.createLabRequest._id }
  } catch (error) {
    console.error("Error creating lab request:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    }
  }
}

// Prescription actions
export async function createPrescription(prescriptionData: any) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" }
    }

    const mutation = `
      mutation CreatePrescription($input: PrescriptionInput!) {
        createPrescription(input: $input) {
          _id
          success
          message
        }
      }
    `

    const result = await executeGraphQLServer(
      mutation,
      {
        input: {
          ...prescriptionData,
          doctorId: session.user.id,
        },
      },
      { cache: "no-store" },
    )

    // Revalidate related data
    revalidateTag("prescriptions")
    revalidateTag(`patient-${prescriptionData.patientId}`)

    return { success: true, prescriptionId: result.createPrescription._id }
  } catch (error) {
    console.error("Error creating prescription:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    }
  }
}

// Medical Certificate actions
export async function createMedicalCertificate(certificateData: any) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" }
    }

    const mutation = `
      mutation CreateMedicalCertificate($input: MedicalCertificateInput!) {
        createMedicalCertificate(input: $input) {
          _id
          success
          message
        }
      }
    `

    const result = await executeGraphQLServer(
      mutation,
      {
        input: {
          ...certificateData,
          doctorId: session.user.id,
        },
      },
      { cache: "no-store" },
    )

    // Revalidate related data
    revalidateTag("certificates")
    revalidateTag(`patient-${certificateData.patientId}`)

    return { success: true, certificateId: result.createMedicalCertificate._id }
  } catch (error) {
    console.error("Error creating medical certificate:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    }
  }
}

// Search patients
export async function searchPatients(searchTerm: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated", patients: [] }
    }

    if (!searchTerm || searchTerm.length < 2) {
      return { success: true, patients: [] }
    }

    const query = `
      query SearchPatients($searchTerm: String!) {
        searchPatients(searchTerm: $searchTerm) {
          _id
          firstName
          lastName
          dateOfBirth
        }
      }
    `

    const result = await executeGraphQLServer(
      query,
      {
        searchTerm,
      },
      { cache: "no-store" },
    )

    return {
      success: true,
      patients: result.searchPatients || [],
    }
  } catch (error) {
    console.error("Error searching patients:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
      patients: [],
    }
  }
}

