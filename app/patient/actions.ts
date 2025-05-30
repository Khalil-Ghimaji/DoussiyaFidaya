"use server"

import { fetchGraphQL } from "@/lib/server/graphql-client"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

// Authorization mutations
const AUTHORIZE_DOCTOR = `
  mutation AuthorizeDoctor($patientId: ID!, $doctorId: ID!, $accessLevel: String!) {
    authorizeDoctor(patientId: $patientId, doctorId: $doctorId, accessLevel: $accessLevel) {
      success
      message
    }
  }
`

const REVOKE_DOCTOR_ACCESS = `
  mutation RevokeDoctorAccess($authorizationId: ID!) {
    revokeDoctorAccess(authorizationId: $authorizationId) {
      success
      message
    }
  }
`

const UPDATE_DOCTOR_ACCESS_LEVEL = `
  mutation UpdateDoctorAccessLevel($authorizationId: ID!, $accessLevel: String!) {
    updateDoctorAccessLevel(authorizationId: $authorizationId, accessLevel: $accessLevel) {
      success
      message
    }
  }
`

const REVOKE_EMERGENCY_ACCESS = `
  mutation RevokeEmergencyAccess($accessId: ID!) {
    revokeEmergencyAccess(accessId: $accessId) {
      success
      message
    }
  }
`

const SUBMIT_EMERGENCY_ACCESS_COMPLAINT = `
  mutation SubmitEmergencyAccessComplaint($accessId: ID!, $reason: String!) {
    submitEmergencyAccessComplaint(accessId: $accessId, reason: $reason) {
      success
      message
    }
  }
`

// Export medical record mutation
const EXPORT_MEDICAL_RECORD = `
  mutation ExportMedicalRecord($patientId: ID!, $format: String!, $encrypt: Boolean!, $sections: [String!]!) {
    exportMedicalRecord(patientId: $patientId, format: $format, encrypt: $encrypt, sections: $sections) {
      success
      message
      downloadUrl
    }
  }
`

export async function authorizeDoctor(doctorId: string, accessLevel: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("User not authenticated")
  }

  try {
    const result = await fetchGraphQL<{
      authorizeDoctor: { success: boolean; message: string }
    }>(AUTHORIZE_DOCTOR, {
      patientId: session.user.id,
      doctorId,
      accessLevel,
    })

    if (result.authorizeDoctor.success) {
      revalidatePath("/patient/authorized-doctors")
      revalidatePath("/patient/authorizations")
      return { success: true, message: result.authorizeDoctor.message }
    } else {
      return { success: false, message: result.authorizeDoctor.message }
    }
  } catch (error) {
    console.error("Error authorizing doctor:", error)
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" }
  }
}

export async function revokeDoctorAccess(authorizationId: string) {
  try {
    const result = await fetchGraphQL<{
      revokeDoctorAccess: { success: boolean; message: string }
    }>(REVOKE_DOCTOR_ACCESS, {
      authorizationId,
    })

    if (result.revokeDoctorAccess.success) {
      revalidatePath("/patient/authorized-doctors")
      revalidatePath("/patient/authorizations")
      return { success: true, message: result.revokeDoctorAccess.message }
    } else {
      return { success: false, message: result.revokeDoctorAccess.message }
    }
  } catch (error) {
    console.error("Error revoking doctor access:", error)
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" }
  }
}

export async function updateDoctorAccessLevel(authorizationId: string, accessLevel: string) {
  try {
    const result = await fetchGraphQL<{
      updateDoctorAccessLevel: { success: boolean; message: string }
    }>(UPDATE_DOCTOR_ACCESS_LEVEL, {
      authorizationId,
      accessLevel,
    })

    if (result.updateDoctorAccessLevel.success) {
      revalidatePath("/patient/authorized-doctors")
      revalidatePath("/patient/authorizations")
      return { success: true, message: result.updateDoctorAccessLevel.message }
    } else {
      return { success: false, message: result.updateDoctorAccessLevel.message }
    }
  } catch (error) {
    console.error("Error updating doctor access level:", error)
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" }
  }
}

export async function revokeEmergencyAccess(accessId: string) {
  try {
    const result = await fetchGraphQL<{
      revokeEmergencyAccess: { success: boolean; message: string }
    }>(REVOKE_EMERGENCY_ACCESS, {
      accessId,
    })

    if (result.revokeEmergencyAccess.success) {
      revalidatePath("/patient/authorizations")
      return { success: true, message: result.revokeEmergencyAccess.message }
    } else {
      return { success: false, message: result.revokeEmergencyAccess.message }
    }
  } catch (error) {
    console.error("Error revoking emergency access:", error)
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" }
  }
}

export async function submitEmergencyAccessComplaint(accessId: string, reason: string) {
  try {
    const result = await fetchGraphQL<{
      submitEmergencyAccessComplaint: { success: boolean; message: string }
    }>(SUBMIT_EMERGENCY_ACCESS_COMPLAINT, {
      accessId,
      reason,
    })

    if (result.submitEmergencyAccessComplaint.success) {
      revalidatePath("/patient/authorizations")
      return { success: true, message: result.submitEmergencyAccessComplaint.message }
    } else {
      return { success: false, message: result.submitEmergencyAccessComplaint.message }
    }
  } catch (error) {
    console.error("Error submitting emergency access complaint:", error)
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" }
  }
}

export async function exportMedicalRecord(format: string, encrypt: boolean, sections: string[]) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("User not authenticated")
  }

  try {
    const result = await fetchGraphQL<{
      exportMedicalRecord: { success: boolean; message: string; downloadUrl: string }
    }>(EXPORT_MEDICAL_RECORD, {
      patientId: session.user.id,
      format,
      encrypt,
      sections,
    })

    return {
      success: result.exportMedicalRecord.success,
      message: result.exportMedicalRecord.message,
      downloadUrl: result.exportMedicalRecord.downloadUrl,
    }
  } catch (error) {
    console.error("Error exporting medical record:", error)
    return { success: false, message: error instanceof Error ? error.message : "An unknown error occurred" }
  }
}

