// Patient appointment mutations
export const CREATE_APPOINTMENT_REQUEST = `
  mutation CreateAppointmentRequest($input: AppointmentRequestInput!) {
    createAppointmentRequest(input: $input) {
      success
      message
      appointmentId
    }
  }
`

export const CANCEL_APPOINTMENT = `
  mutation CancelAppointment($appointmentId: ID!, $reason: String!, $details: String!) {
    cancelAppointment(appointmentId: $appointmentId, reason: $reason, details: $details) {
      success
      message
    }
  }
`

// Patient authorization mutations
export const AUTHORIZE_DOCTOR = `
  mutation AuthorizeDoctor($patientId: ID!, $doctorId: ID!, $accessLevel: String!) {
    authorizeDoctor(patientId: $patientId, doctorId: $doctorId, accessLevel: $accessLevel) {
      success
      message
    }
  }
`

export const REVOKE_DOCTOR_ACCESS = `
  mutation RevokeDoctorAccess($authorizationId: ID!) {
    revokeDoctorAccess(authorizationId: $authorizationId) {
      success
      message
    }
  }
`

export const UPDATE_DOCTOR_ACCESS_LEVEL = `
  mutation UpdateDoctorAccessLevel($authorizationId: ID!, $accessLevel: String!) {
    updateDoctorAccessLevel(authorizationId: $authorizationId, accessLevel: $accessLevel) {
      success
      message
    }
  }
`

export const REVOKE_EMERGENCY_ACCESS = `
  mutation RevokeEmergencyAccess($accessId: ID!) {
    revokeEmergencyAccess(accessId: $accessId) {
      success
      message
    }
  }
`

export const SUBMIT_EMERGENCY_ACCESS_COMPLAINT = `
  mutation SubmitEmergencyAccessComplaint($accessId: ID!, $reason: String!) {
    submitEmergencyAccessComplaint(accessId: $accessId, reason: $reason) {
      success
      message
    }
  }
`

// Export medical record mutation
export const EXPORT_MEDICAL_RECORD = `
  mutation ExportMedicalRecord($patientId: ID!, $format: String!, $encrypt: Boolean!, $sections: [String!]!) {
    exportMedicalRecord(patientId: $patientId, format: $format, encrypt: $encrypt, sections: $sections) {
      success
      message
      downloadUrl
    }
  }
`

