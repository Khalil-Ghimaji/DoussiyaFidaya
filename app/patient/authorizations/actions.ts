"use server"

import { getServerSession } from "next-auth"
import { executeGraphQL } from "@/lib/graphql-server"
import * as patientMutations from "@/lib/graphql/patient-mutations"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

type AuthorizeDoctorParams = {
  patientId: string
  doctorId: string
  accessLevel: string
}

export async function authorizeDoctor({ patientId, doctorId, accessLevel }: AuthorizeDoctorParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.id !== patientId) {
    return {
      success: false,
      message: "Non autorisé",
    }
  }

  try {
    const response = await executeGraphQL(patientMutations.AUTHORIZE_DOCTOR, {
      patientId,
      doctorId,
      accessLevel,
    })

    revalidatePath("/patient/authorizations")

    return {
      success: response.authorizeDoctor.success,
      message: response.authorizeDoctor.message,
    }
  } catch (err) {
    console.error("Error authorizing doctor:", err)
    return {
      success: false,
      message: err instanceof Error ? err.message : "Une erreur inconnue est survenue",
    }
  }
}

export async function revokeDoctorAccess(authorizationId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Non autorisé",
    }
  }

  try {
    const response = await executeGraphQL(patientMutations.REVOKE_DOCTOR_ACCESS, {
      authorizationId,
    })

    revalidatePath("/patient/authorizations")

    return {
      success: response.revokeDoctorAccess.success,
      message: response.revokeDoctorAccess.message,
    }
  } catch (err) {
    console.error("Error revoking doctor access:", err)
    return {
      success: false,
      message: err instanceof Error ? err.message : "Une erreur inconnue est survenue",
    }
  }
}

export async function revokeEmergencyAccess(accessId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Non autorisé",
    }
  }

  try {
    const response = await executeGraphQL(patientMutations.REVOKE_EMERGENCY_ACCESS, {
      accessId,
    })

    revalidatePath("/patient/authorizations")

    return {
      success: response.revokeEmergencyAccess.success,
      message: response.revokeEmergencyAccess.message,
    }
  } catch (err) {
    console.error("Error revoking emergency access:", err)
    return {
      success: false,
      message: err instanceof Error ? err.message : "Une erreur inconnue est survenue",
    }
  }
}

type SubmitComplaintParams = {
  accessId: string
  reason: string
}

export async function submitEmergencyAccessComplaint({ accessId, reason }: SubmitComplaintParams) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      success: false,
      message: "Non autorisé",
    }
  }

  try {
    const response = await executeGraphQL(patientMutations.SUBMIT_EMERGENCY_ACCESS_COMPLAINT, {
      accessId,
      reason,
    })

    revalidatePath("/patient/authorizations")

    return {
      success: response.submitEmergencyAccessComplaint.success,
      message: response.submitEmergencyAccessComplaint.message,
    }
  } catch (err) {
    console.error("Error submitting complaint:", err)
    return {
      success: false,
      message: err instanceof Error ? err.message : "Une erreur inconnue est survenue",
    }
  }
}

