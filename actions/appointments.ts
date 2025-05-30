"use server"

import { executeGraphQL } from "@/lib/graphql-client"
import {
  CONFIRM_APPOINTMENT,
  CREATE_APPOINTMENT_REQUEST,
  PROPOSE_NEW_TIME,
  UPDATE_APPOINTMENT_STATUS,
} from "@/lib/graphql/mutations"
import { GET_DOCTOR_APPOINTMENTS, GET_PATIENT_APPOINTMENTS } from "@/lib/graphql/queries"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function createAppointmentRequest(_, formData: FormData) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Vous devez être connecté pour créer une demande de rendez-vous")
  }

  const patientId = formData.get("patientId") as string
  const doctorId = formData.get("doctorId") as string
  const preferredDate = formData.get("preferredDate") as string
  const preferredTimeStart = formData.get("preferredTimeStart") as string
  const preferredTimeEnd = formData.get("preferredTimeEnd") as string
  const reason = formData.get("reason") as string

  try {
    const result = await executeGraphQL(CREATE_APPOINTMENT_REQUEST, {
      appointment: {
        patient: patientId,
        doctor: doctorId,
        preferredDate,
        preferredTimeStart,
        preferredTimeEnd,
        reason,
        status: "pending",
      },
    })

    revalidatePath("/patient/appointments")
    revalidatePath("/doctor/appointments")
    revalidatePath("/assistant/appointments")

    return { success: true, message: "Demande de rendez-vous créée avec succès" }
  } catch (error) {
    console.error("Erreur lors de la création de la demande de rendez-vous:", error)
    return { success: false, message: "Erreur lors de la création de la demande de rendez-vous" }
  }
}

export async function getPatientAppointments(patientId: string) {
  try {
    const data = await executeGraphQL(GET_PATIENT_APPOINTMENTS, { patientId })
    return { success: true, data: data.patientAppointments }
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error)
    return { success: false, message: "Erreur lors de la récupération des rendez-vous" }
  }
}

export async function getDoctorAppointments(doctorId: string) {
  try {
    const data = await executeGraphQL(GET_DOCTOR_APPOINTMENTS, { doctorId })
    return { success: true, data: data.doctorAppointments }
  } catch (error) {
    console.error("Erreur lors de la récupération des rendez-vous:", error)
    return { success: false, message: "Erreur lors de la récupération des rendez-vous" }
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: string, note?: string) {
  try {
    const result = await executeGraphQL(UPDATE_APPOINTMENT_STATUS, {
      appointmentId,
      status,
      note,
    })

    revalidatePath("/patient/appointments")
    revalidatePath("/doctor/appointments")
    revalidatePath("/assistant/appointments")

    return {
      success: result.updateAppointmentStatus.success,
      message: result.updateAppointmentStatus.message,
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error)
    return { success: false, message: "Erreur lors de la mise à jour du statut" }
  }
}

export async function confirmAppointment(appointmentId: string, confirmedDate: string, confirmedTime: string) {
  try {
    const result = await executeGraphQL(CONFIRM_APPOINTMENT, {
      appointmentId,
      confirmedDate,
      confirmedTime,
    })

    revalidatePath("/patient/appointments")
    revalidatePath("/doctor/appointments")
    revalidatePath("/assistant/appointments")

    return {
      success: result.confirmAppointment.success,
      message: result.confirmAppointment.message,
    }
  } catch (error) {
    console.error("Erreur lors de la confirmation du rendez-vous:", error)
    return { success: false, message: "Erreur lors de la confirmation du rendez-vous" }
  }
}

export async function proposeNewTime(
  appointmentId: string,
  proposedDate: string,
  proposedTimeStart: string,
  proposedTimeEnd: string,
) {
  try {
    const result = await executeGraphQL(PROPOSE_NEW_TIME, {
      appointmentId,
      proposedDate,
      proposedTimeStart,
      proposedTimeEnd,
    })

    revalidatePath("/patient/appointments")
    revalidatePath("/doctor/appointments")
    revalidatePath("/assistant/appointments")

    return {
      success: result.proposeNewTime.success,
      message: result.proposeNewTime.message,
    }
  } catch (error) {
    console.error("Erreur lors de la proposition d'un nouveau créneau:", error)
    return { success: false, message: "Erreur lors de la proposition d'un nouveau créneau" }
  }
}

