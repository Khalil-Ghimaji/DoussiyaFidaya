// User related mutations
export const UPDATE_USER_PROFILE = `
  mutation UpdateUserProfile($userId: ID!, $userData: UserUpdateInput!) {
    updateUser(id: $userId, data: $userData) {
      _id
      firstName
      lastName
      email
      phone
      role
      speciality
      birthDate
      address
      preferences {
        theme
        notifications
        emailNotifications
        appointmentReminders
        prescriptionNotifications
        patientUpdates
      }
    }
  }
`

export const CHANGE_PASSWORD = `
  mutation ChangePassword($userId: ID!, $currentPassword: String!, $newPassword: String!) {
    changePassword(userId: $userId, currentPassword: $currentPassword, newPassword: $newPassword) {
      success
      message
    }
  }
`

export const UPDATE_NOTIFICATION_PREFERENCES = `
  mutation UpdateNotificationPreferences($userId: ID!, $preferences: PreferencesInput!) {
    updateNotificationPreferences(userId: $userId, preferences: $preferences) {
      success
      message
    }
  }
`

// Medical record related mutations
export const UPDATE_MEDICAL_RECORD = `
  mutation UpdateMedicalRecord($recordId: ID!, $data: MedicalRecordUpdateInput!) {
    updateMedicalRecord(id: $recordId, data: $data) {
      _id
      patient {
        _id
      }
      bloodType
      allergies
      medicalHistory {
        condition
        since
        notes
      }
    }
  }
`

export const AUTHORIZE_DOCTOR = `
  mutation AuthorizeDoctor($patientId: ID!, $doctorId: ID!, $accessLevel: String!) {
    authorizeDoctor(patientId: $patientId, doctorId: $doctorId, accessLevel: $accessLevel) {
      success
      message
    }
  }
`

export const REVOKE_DOCTOR = `
  mutation RevokeDoctor($patientId: ID!, $doctorId: ID!) {
    revokeDoctor(patientId: $patientId, doctorId: $doctorId) {
      success
      message
    }
  }
`

// Prescription related mutations
export const CREATE_PRESCRIPTION = `
  mutation CreatePrescription($prescription: PrescriptionInput!) {
    createPrescription(prescription: $prescription) {
      success
      message
    }
  }
`

export const UPDATE_PRESCRIPTION_STATUS = `
  mutation UpdatePrescriptionStatus($prescriptionId: ID!, $status: String!, $pharmacyId: ID) {
    updatePrescriptionStatus(id: $prescriptionId, status: $status, pharmacyId: $pharmacyId) {
      success
      message
    }
  }
`

// Lab related mutations
export const CREATE_LAB_REQUEST = `
  mutation CreateLabRequest($labRequest: LabRequestInput!) {
    createLabRequest(labRequest: $labRequest) {
      success
      message
      labRequestId
    }
  }
`

export const UPLOAD_LAB_RESULT = `
  mutation UploadLabResult($labResult: LabResultInput!) {
    uploadLabResult(labResult: $labResult) {
      success
      message
      patientId
    }
  }
`

export const MARK_LAB_RESULT_AS_VIEWED = `
  mutation MarkLabResultAsViewed($resultId: ID!) {
    markLabResultAsViewed(id: $resultId) {
      success
      message
    }
  }
`

// Appointment related mutations
export const CREATE_APPOINTMENT_REQUEST = `
  mutation CreateAppointmentRequest($appointment: AppointmentInput!) {
    createAppointmentRequest(appointment: $appointment) {
      success
      message
      appointmentId
    }
  }
`

export const UPDATE_APPOINTMENT_STATUS = `
  mutation UpdateAppointmentStatus($appointmentId: ID!, $status: String!, $note: String) {
    updateAppointmentStatus(id: $appointmentId, status: $status, note: $note) {
      success
      message
    }
  }
`

export const CONFIRM_APPOINTMENT = `
  mutation ConfirmAppointment($appointmentId: ID!, $confirmedDate: String!, $confirmedTime: String!) {
    confirmAppointment(id: $appointmentId, confirmedDate: $confirmedDate, confirmedTime: $confirmedTime) {
      success
      message
    }
  }
`

export const PROPOSE_NEW_TIME = `
  mutation ProposeNewTime($appointmentId: ID!, $proposedDate: String!, $proposedTimeStart: String!, $proposedTimeEnd: String!) {
    proposeNewTime(id: $appointmentId, proposedDate: $proposedDate, proposedTimeStart: $proposedTimeStart, proposedTimeEnd: $proposedTimeEnd) {
      success
      message
    }
  }
`

// Notification related mutations
export const MARK_NOTIFICATION_AS_READ = `
  mutation MarkNotificationAsRead($notificationId: ID!) {
    markNotificationAsRead(id: $notificationId) {
      success
      message
    }
  }
`

export const MARK_ALL_NOTIFICATIONS_AS_READ = `
  mutation MarkAllNotificationsAsRead($userId: ID!) {
    markAllNotificationsAsRead(userId: $userId) {
      success
      message
    }
  }
`

export const DELETE_NOTIFICATION = `
  mutation DeleteNotification($notificationId: ID!) {
    deleteNotification(id: $notificationId) {
      success
      message
    }
  }
`

// Messaging related mutations
export const SEND_MESSAGE = `
  mutation SendMessage($recipientId: ID!, $content: String!) {
    sendMessage(recipientId: $recipientId, content: $content) {
      success
      message
    }
  }
`

export const SHARE_PATIENT_ACCESS = `
  mutation SharePatientAccess($doctorId: ID!, $patientId: ID!) {
    sharePatientAccess(doctorId: $doctorId, patientId: $patientId) {
      success
      message
      patientName
    }
  }
`

export const GET_PATIENT_PRESCRIPTIONS = `
  query GetPatientPrescriptions($patientId: ID!) {
    patientPrescriptions(patientId: $patientId) {
      _id
      date
      medications {
        name
        dosage
        frequency
        duration
        quantity
      }
      status
      doctor {
        _id
        firstName
        lastName
        speciality
      }
    }
  }
`

export const GET_PHARMACY_PRESCRIPTIONS = `
  query GetPharmacyPrescriptions {
    pharmacyPrescriptions(status: "active") {
      _id
      date
      medications {
        name
        dosage
        frequency
        duration
        quantity
      }
      status
      patient {
        _id
        firstName
        lastName
      }
      doctor {
        _id
        firstName
        lastName
        speciality
      }
    }
  }
`

