// Doctor-related GraphQL mutations

// Create appointment
export const CREATE_APPOINTMENT = `
  mutation CreateAppointment($appointment: AppointmentInput!) {
    createAppointment(appointment: $appointment) {
      success
      message
      appointmentId
    }
  }
`

// Accept appointment request
export const ACCEPT_APPOINTMENT_REQUEST = `
  mutation AcceptAppointmentRequest($requestId: ID!, $date: String!, $time: String!, $duration: Int!) {
    acceptAppointmentRequest(requestId: $requestId, date: $date, time: $time, duration: $duration) {
      success
      message
      appointmentId
    }
  }
`

// Decline appointment request
export const DECLINE_APPOINTMENT_REQUEST = `
  mutation DeclineAppointmentRequest($requestId: ID!, $reason: String!, $message: String, $alternative: String) {
    declineAppointmentRequest(requestId: $requestId, reason: $reason, message: $message, alternative: $alternative) {
      success
      message
    }
  }
`

// Create consultation
export const CREATE_CONSULTATION = `
  mutation CreateConsultation($consultation: ConsultationInput!) {
    createConsultation(consultation: $consultation) {
      success
      message
      consultationId
    }
  }
`

// Update consultation
export const UPDATE_CONSULTATION = `
  mutation UpdateConsultation($consultationId: ID!, $consultation: ConsultationUpdateInput!) {
    updateConsultation(id: $consultationId, consultation: $consultation) {
      success
      message
    }
  }
`

// Create assistant
export const CREATE_ASSISTANT = `
  mutation CreateAssistant($assistant: AssistantInput!) {
    createAssistant(assistant: $assistant) {
      success
      message
      assistantId
      credentials {
        username
        password
      }
    }
  }
`

// Update assistant
export const UPDATE_ASSISTANT = `
  mutation UpdateAssistant($assistantId: ID!, $assistant: AssistantUpdateInput!) {
    updateAssistant(id: $assistantId, assistant: $assistant) {
      success
      message
    }
  }
`

// Regenerate assistant credentials
export const REGENERATE_ASSISTANT_CREDENTIALS = `
  mutation RegenerateAssistantCredentials($assistantId: ID!) {
    regenerateAssistantCredentials(assistantId: $assistantId) {
      success
      message
      credentials {
        username
        password
      }
    }
  }
`

// Create medical certificate
export const CREATE_MEDICAL_CERTIFICATE = `
  mutation CreateMedicalCertificate($certificate: MedicalCertificateInput!) {
    createMedicalCertificate(certificate: $certificate) {
      success
      message
      certificateId
    }
  }
`

// Request emergency access
export const REQUEST_EMERGENCY_ACCESS = `
  mutation RequestEmergencyAccess($patientId: ID!, $reason: String!, $urgencyLevel: String!, $duration: Int!) {
    requestEmergencyAccess(patientId: $patientId, reason: $reason, urgencyLevel: $urgencyLevel, duration: $duration) {
      success
      message
      accessGranted
      patientInfo {
        name
        age
      }
    }
  }
`

