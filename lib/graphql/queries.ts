// User related queries
export const GET_USER_PROFILE = `
  query GetUserProfile($userId: ID!) {
    user(id: $userId) {
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

// Medical record related queries
export const GET_MEDICAL_RECORD = `
  query GetMedicalRecord($patientId: ID!) {
    medicalRecord(patientId: $patientId) {
      _id
      birthDate
      bloodType
      allergies
      medicalHistory {
        condition
        since
        notes
      }
      patient {
        _id
        firstName
        lastName
        email
      }
      authorizedDoctors {
        _id
        firstName
        lastName
        speciality
      }
    }
  }
`

// Prescription related queries
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

// Lab results related queries
export const GET_PATIENT_LAB_RESULTS = `
  query GetPatientLabResults($patientId: ID!) {
    patientLabResults(patientId: $patientId) {
      _id
      completionDate
      type
      status
      data {
        parameter
        value
        unit
        referenceRange
        isNormal
      }
      notes
      viewed
      laboratory {
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

export const GET_LABORATORY_REQUESTS = `
  query GetLaboratoryRequests($laboratoryId: ID!) {
    laboratoryRequests(laboratoryId: $laboratoryId, status_ne: "completed") {
      _id
      requestDate
      type
      priority
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

// Appointment related queries
export const GET_PATIENT_APPOINTMENTS = `
  query GetPatientAppointments($patientId: ID!) {
    patientAppointments(patientId: $patientId) {
      _id
      preferredDate
      preferredTimeStart
      preferredTimeEnd
      confirmedDate
      reason
      status
      notes {
        text
        createdAt
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

export const GET_DOCTOR_APPOINTMENTS = `
  query GetDoctorAppointments($doctorId: ID!) {
    doctorAppointments(doctorId: $doctorId) {
      _id
      preferredDate
      preferredTimeStart
      preferredTimeEnd
      confirmedDate
      reason
      status
      notes {
        text
        createdAt
      }
      patient {
        _id
        firstName
        lastName
      }
    }
  }
`

// Notification related queries
export const GET_NOTIFICATIONS = `
  query GetNotifications($userId: ID!) {
    notifications(recipientId: $userId) {
      _id
      type
      content
      createdAt
      read
      relatedPatient {
        _ref
      }
    }
  }
`

// Messaging related queries
export const GET_CONVERSATIONS = `
  query GetConversations($userId: ID!) {
    conversations(userId: $userId) {
      _id
      participant {
        _id
        firstName
        lastName
        speciality
        avatar
      }
      lastMessage
      unreadCount
      messages {
        _id
        content
        sender {
          _id
        }
        createdAt
        isSystemMessage
        hasAttachment
      }
    }
  }
`

export const GET_PATIENTS = `
  query GetPatients {
    patients {
      _id
      firstName
      lastName
      dateOfBirth
      gender
    }
  }
`

