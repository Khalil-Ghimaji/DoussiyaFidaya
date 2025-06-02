"use server"

import { revalidateTag } from "next/cache"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { auth } from "@/lib/auth"
import { sendGraphQLMutation } from "@/lib/graphql-client"

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
export async function createMedicalCertificate(_,certificateData: any) {
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

    const result = await executeGraphQLServer<{ createMedicalCertificate: { _id: string; success: boolean; message?: string } }>(
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

export async function createAppointment(data: any) {
  try {
    interface CreateAppointmentResponse {
      createOneRdvs: {
        id: string;
      };
    }

    const result = await sendGraphQLMutation<CreateAppointmentResponse>(
      `mutation CreateAppointment($data: RdvsCreateInput!) {
        createOneRdvs(data: $data) {
          id
        }
      }`,
      { data }
    )

    return { success: true, appointmentId: result.data.createOneRdvs.id }
  } catch (error) {
    console.error("Error creating appointment:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred",
    }
  }
}

const UPDATE_CONSULTATION = `
  mutation UpdateConsutation($data1: ConsultationsUpdateInput!,$data2: ConsultationsUpdateInput!, $where: ConsultationsWhereUniqueInput!) {
  updateOneToOne:updateOneConsultations(where: $where, data: $data1) {
    id
  }
  updateOneToMany:updateOneConsultations(where:$where,data:$data2){
    id
  }
}
`

export async function updateConsultation(id: string, patientId: string, values: {
  reason: string
  notes?: string
  diagnosis: string
  vitalSigns: {
    bloodPressure?: string
    heartRate?: string
    temperature?: string
    respiratoryRate?: string
    oxygenSaturation?: string
    weight?: string
  }
  prescriptions?: {
    _id?: string
    name: string
    dosage: string
    frequency: string
    duration: string
    quantity: string
  }[]
  labRequests?: {
    _id?: string
    type: string
    priority: string
    description: string
    laboratory?: string
    status?: string
    resultId?: string
  }[]
}) {
  console.log("i arrived here in the action")
  try {
    console.log("i arrived there in the action")
    // Transform frontend values to backend format
    const data1 = {
      notes: {
        set: [values.reason, ...(values.notes?.split('\n').filter(note => note.trim()) || [] )]
      },
      measures: {
        set: {
          diagnosis: values.diagnosis,
          vital_signs: {
            blood_pressure: values.vitalSigns.bloodPressure,
            heart_rate: values.vitalSigns.heartRate,
            temperature: values.vitalSigns.temperature,
            respiratory_rate: values.vitalSigns.respiratoryRate,
            oxygen_saturation: values.vitalSigns.oxygenSaturation,
            weight: values.vitalSigns.weight
          }
        }
      },
      prescriptions: values.prescriptions ? {
        upsert:{
          update: {
            medications: {
              deleteMany: {}
            }
          },
          create: {
            date: new Date(),
            is_signed: false,
            status: "Pending",
            patients:{
              connect:{
                id: patientId
              }
            }
          }
        }
      } : undefined,
      lab_requests: values.labRequests ? {
        deleteMany: {}
      } : undefined
    }
    console.log("update consultation data1", data1)
    const data2 = {
      prescriptions: values.prescriptions? {
        update: {
          data: {
            medications: {
              createMany: {
                data:  values.prescriptions.map(medication => ({
                  name: medication.name,
                  dosage: medication.dosage,
                  frequency: medication.frequency,
                  duration: medication.duration,
                  quantity: medication.quantity
                }))
              }
            }
          }
        }
      }:{},
      lab_requests: values.labRequests ? {
        create: 
          values.labRequests.map(request => ({
            type: request.type,
            priority: request.priority,
            description: request.description,
            patients:{
              connect:{
                id: patientId
              }
            }
          }))
        
      }:{}
    }
    console.dir(data2,{depth:null})
    console.log("i arrived here before the mutation")
    const result = await sendGraphQLMutation<any>(
      UPDATE_CONSULTATION,
      {
        where: { id },
        data1,
        data2
      }
    )
    console.log("this is the result", result)

    return { success: true }
  } catch (error) {
    console.log("i arrived here in the catch")
    console.error("Error updating consultation:", error)
    return { success: false, message: error instanceof Error ? error.message : "Une erreur est survenue" }
  }
}