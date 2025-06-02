import { sendNotificationToUser, broadcastNotification } from "@/app/api/sse/route"

export interface NotificationData {
    recipientId?: string
    type: string
    content: string
    relatedPatientId?: string
    relatedAppointmentId?: string
    relatedPrescriptionId?: string
}

export async function createAndSendNotification(data: NotificationData) {
    try {
        // Create notification in database (you would implement this with your GraphQL mutation)
        const notification = {
            _id: generateId(),
            type: data.type,
            content: data.content,
            read: false,
            createdAt: new Date().toISOString(),
            recipientId: data.recipientId,
            relatedPatient: data.relatedPatientId ? { _ref: data.relatedPatientId } : undefined,
        }

        // Send real-time notification
        if (data.recipientId) {
            sendNotificationToUser(data.recipientId, notification)
        } else {
            broadcastNotification(notification)
        }

        return { success: true, notification }
    } catch (error) {
        console.error("Error creating and sending notification:", error)
        return { success: false, error: error.message }
    }
}

function generateId(): string {
    return Math.random().toString(36).substr(2, 9)
}

// Predefined notification templates
export const NotificationTemplates = {
    appointmentConfirmed: (patientName: string, date: string) => ({
        type: "appointment",
        content: `Rendez-vous confirmé avec ${patientName} le ${date}`,
    }),

    appointmentCancelled: (patientName: string, date: string) => ({
        type: "appointment",
        content: `Rendez-vous annulé avec ${patientName} le ${date}`,
    }),

    newPrescription: (doctorName: string) => ({
        type: "prescription",
        content: `Nouvelle prescription reçue du Dr. ${doctorName}`,
    }),

    labResultReady: (patientName: string) => ({
        type: "lab_result",
        content: `Résultats d'analyse disponibles pour ${patientName}`,
    }),

    emergencyAccess: (doctorName: string) => ({
        type: "emergency_access",
        content: `Demande d'accès d'urgence du Dr. ${doctorName}`,
    }),

    accessGranted: (patientName: string) => ({
        type: "access_granted",
        content: `Accès autorisé au dossier médical de ${patientName}`,
    }),

    newMessage: (senderName: string) => ({
        type: "message",
        content: `Nouveau message de ${senderName}`,
    }),
}
