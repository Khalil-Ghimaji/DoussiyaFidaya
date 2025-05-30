"use server"

import { revalidatePath } from "next/cache"
import { getClient } from "@/lib/apollo-server"
import {
  CREATE_APPOINTMENT,
  UPDATE_APPOINTMENT,
  DECLINE_APPOINTMENT_REQUEST,
  SCHEDULE_APPOINTMENT_REQUEST,
  CANCEL_APPOINTMENT,
} from "@/lib/graphql/mutations/assistant"

export async function createAppointmentAction(formData: FormData) {
  try {
    const input = {
      patientId: formData.get("patientId"),
      doctorId: formData.get("doctorId"),
      date: formData.get("date"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      reason: formData.get("reason"),
      notes: formData.get("notes"),
    }

    const client = getClient()
    const { data } = await client.mutate({
      mutation: CREATE_APPOINTMENT,
      variables: { input },
    })

    revalidatePath("/assistant/appointments")
    revalidatePath("/assistant/dashboard")

    return { success: true, data: data.createAppointment }
  } catch (error) {
    console.error("Error creating appointment:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function updateAppointmentAction(id: string, formData: FormData) {
  try {
    const input = {
      patientId: formData.get("patientId"),
      doctorId: formData.get("doctorId"),
      date: formData.get("date"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      reason: formData.get("reason"),
      notes: formData.get("notes"),
      status: formData.get("status"),
    }

    const client = getClient()
    const { data } = await client.mutate({
      mutation: UPDATE_APPOINTMENT,
      variables: { id, input },
    })

    revalidatePath("/assistant/appointments")
    revalidatePath(`/assistant/appointments/${id}`)
    revalidatePath("/assistant/dashboard")

    return { success: true, data: data.updateAppointment }
  } catch (error) {
    console.error("Error updating appointment:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function declineAppointmentRequestAction(id: string, formData: FormData) {
  try {
    const reason = formData.get("reason") as string

    const client = getClient()
    const { data } = await client.mutate({
      mutation: DECLINE_APPOINTMENT_REQUEST,
      variables: { id, reason },
    })

    revalidatePath("/assistant/appointments")
    revalidatePath("/assistant/dashboard")

    return { success: true, data: data.declineAppointmentRequest }
  } catch (error) {
    console.error("Error declining appointment request:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function scheduleAppointmentRequestAction(id: string, formData: FormData) {
  try {
    const date = formData.get("date") as string
    const startTime = formData.get("startTime") as string
    const endTime = formData.get("endTime") as string

    const client = getClient()
    const { data } = await client.mutate({
      mutation: SCHEDULE_APPOINTMENT_REQUEST,
      variables: { id, date, startTime, endTime },
    })

    revalidatePath("/assistant/appointments")
    revalidatePath("/assistant/dashboard")

    return { success: true, data: data.scheduleAppointmentRequest }
  } catch (error) {
    console.error("Error scheduling appointment request:", error)
    return { success: false, error: (error as Error).message }
  }
}

export async function cancelAppointmentAction(id: string, formData: FormData) {
  try {
    const reason = formData.get("reason") as string

    const client = getClient()
    const { data } = await client.mutate({
      mutation: CANCEL_APPOINTMENT,
      variables: { id, reason },
    })

    revalidatePath("/assistant/appointments")
    revalidatePath("/assistant/dashboard")

    return { success: true, data: data.cancelAppointment }
  } catch (error) {
    console.error("Error canceling appointment:", error)
    return { success: false, error: (error as Error).message }
  }
}

