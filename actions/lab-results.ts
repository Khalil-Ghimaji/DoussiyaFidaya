"use server"

import { executeGraphQL } from "@/lib/graphql-client"
import { CREATE_LAB_REQUEST, MARK_LAB_RESULT_AS_VIEWED, UPLOAD_LAB_RESULT } from "@/lib/graphql/mutations"
import { GET_LABORATORY_REQUESTS, GET_PATIENT_LAB_RESULTS } from "@/lib/graphql/queries"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function createLabRequest(_, formData: FormData) {
  const session = await auth()

  if (!session?.user || session.user.role !== "doctor") {
    throw new Error("Vous devez être un médecin pour créer une demande d'analyse")
  }

  const patientId = formData.get("patientId") as string
  const doctorId = session.user.id as string
  const type = formData.get("type") as string
  const priority = formData.get("priority") as string
  const laboratoryId = formData.get("laboratoryId") as string

  try {
    const result = await executeGraphQL(CREATE_LAB_REQUEST, {
      labRequest: {
        patient: patientId,
        doctor: doctorId,
        laboratory: laboratoryId,
        requestDate: new Date().toISOString().split("T")[0],
        type: type,
        priority: priority,
        status: "received",
      },
    })

    revalidatePath(`/patient/lab-results`)
    revalidatePath(`/doctor/patients/${patientId}`)
    revalidatePath(`/laboratory/dashboard`)

    return { success: true, message: "Demande d'analyse créée avec succès" }
  } catch (error) {
    console.error("Erreur lors de la création de la demande d'analyse:", error)
    return { success: false, message: "Erreur lors de la création de la demande d'analyse" }
  }
}

export async function uploadLabResult(_, formData: FormData) {
  const session = await auth()

  if (!session?.user || session.user.role !== "laboratory") {
    throw new Error("Vous devez être un laboratoire pour téléverser un résultat")
  }

  const requestId = formData.get("requestId") as string
  const status = formData.get("status") as string
  const dataJson = formData.get("data") as string
  const data = JSON.parse(dataJson)
  const notes = formData.get("notes") as string

  try {
    const result = await executeGraphQL(UPLOAD_LAB_RESULT, {
      labResult: {
        requestId,
        laboratoryId: session.user.id,
        completionDate: new Date().toISOString().split("T")[0],
        status,
        data,
        notes,
        viewed: false,
      },
    })

    revalidatePath(`/patient/lab-results`)
    revalidatePath(`/doctor/patients/${result.uploadLabResult.patientId}`)
    revalidatePath(`/laboratory/dashboard`)

    return { success: true, message: "Résultat d'analyse téléversé avec succès" }
  } catch (error) {
    console.error("Erreur lors du téléversement du résultat:", error)
    return { success: false, message: "Erreur lors du téléversement du résultat" }
  }
}

export async function getPatientLabResults(patientId: string) {
  try {
    const data = await executeGraphQL(GET_PATIENT_LAB_RESULTS, { patientId })
    return { success: true, data: data.patientLabResults }
  } catch (error) {
    console.error("Erreur lors de la récupération des résultats:", error)
    return { success: false, message: "Erreur lors de la récupération des résultats" }
  }
}

export async function getLaboratoryRequests(laboratoryId: string) {
  try {
    const data = await executeGraphQL(GET_LABORATORY_REQUESTS, { laboratoryId })
    return { success: true, data: data.laboratoryRequests }
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes:", error)
    return { success: false, message: "Erreur lors de la récupération des demandes" }
  }
}

export async function markLabResultAsViewed(resultId: string) {
  try {
    await executeGraphQL(MARK_LAB_RESULT_AS_VIEWED, { resultId })

    revalidatePath("/patient/lab-results")
    revalidatePath("/doctor/dashboard")
    revalidatePath("/laboratory/dashboard")

    return { success: true, message: "Résultat marqué comme consulté" }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error)
    return { success: false, message: "Erreur lors de la mise à jour du statut" }
  }
}

