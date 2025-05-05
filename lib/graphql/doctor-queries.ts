// Common GraphQL queries for doctor-related data

// Appointment queries
export const GET_APPOINTMENT_DETAILS = `
  query GetAppointmentDetails($appointmentId: ID!) {
    appointment(id: $appointmentId) {
      _id
      date
      time
      duration
      status
      reason
      notes
      patient {
        _id
        firstName
        lastName
        dateOfBirth
        gender
        bloodType
        allergies
        profileImage
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
  query GetDoctorAppointments($doctorId: ID!, $status: String, $startDate: String, $endDate: String) {
    doctorAppointments(doctorId: $doctorId, status: $status, startDate: $startDate, endDate: $endDate) {
      _id
      date
      time
      duration
      status
      reason
      patient {
        _id
        firstName
        lastName
        dateOfBirth
        gender
        profileImage
      }
    }
  }
`

// Assistant queries
export const GET_DOCTOR_ASSISTANTS = `
  query GetDoctorAssistants($doctorId: ID!) {
    doctorAssistants(doctorId: $doctorId) {
      _id
      name
      email
      phone
      status
      createdAt
      permissions {
        manageAppointments
        viewPatientDetails
        editPatientDetails
        cancelAppointments
        rescheduleAppointments
      }
    }
  }
`

export const GET_ASSISTANT_DETAILS = `
  query GetAssistantDetails($assistantId: ID!) {
    assistant(id: $assistantId) {
      _id
      name
      email
      phone
      status
      createdAt
      permissions {
        manageAppointments
        viewPatientDetails
        editPatientDetails
        cancelAppointments
        rescheduleAppointments
      }
    }
  }
`

// Consultation queries
export const GET_DOCTOR_CONSULTATIONS = `
  query GetDoctorConsultations($doctorId: ID!, $startDate: String, $endDate: String) {
    doctorConsultations(doctorId: $doctorId, startDate: $startDate, endDate: $endDate) {
      _id
      date
      time
      reason
      diagnosis
      hasPrescription
      hasLabRequest
      patient {
        _id
        firstName
        lastName
        dateOfBirth
        gender
        profileImage
      }
    }
  }
`

export const GET_CONSULTATION_DETAILS = `
  query GetConsultationDetails($consultationId: ID!) {
    consultation(id: $consultationId) {
      _id
      date
      time
      duration
      reason
      notes
      diagnosis
      createdBy
      createdAt
      updatedAt
      vitalSigns {
        bloodPressure
        heartRate
        temperature
        respiratoryRate
        oxygenSaturation
        weight
      }
      prescriptions {
        _id
        name
        dosage
        frequency
        duration
        quantity
      }
      labRequests {
        _id
        type
        priority
        laboratory
        status
        resultId
      }
      patient {
        _id
        firstName
        lastName
        dateOfBirth
        gender
        bloodType
        profileImage
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

// Patient queries
export const GET_DOCTOR_PATIENTS = `
  query GetDoctorPatients($doctorId: ID!) {
    doctorPatients(doctorId: $doctorId) {
      _id
      firstName
      lastName
      dateOfBirth
      gender
      email
      phone
      address
      profileImage
      lastConsultation
    }
  }
`

export const GET_PATIENT_DETAILS = `
  query GetPatientDetails($patientId: ID!) {
    patient(id: $patientId) {
      _id
      firstName
      lastName
      dateOfBirth
      gender
      email
      phone
      address
      bloodType
      allergies
      medicalHistory
      medications
      emergencyContact {
        name
        relationship
        phone
      }
      profileImage
      lastConsultation
    }
  }
`

export const GET_PATIENT_HISTORY = `
  query GetPatientHistory($patientId: ID!) {
    patientConsultations(patientId: $patientId) {
      _id
      date
      time
      reason
      diagnosis
      doctor {
        _id
        firstName
        lastName
        speciality
      }
    }
    patientPrescriptions(patientId: $patientId) {
      _id
      date
      medications {
        name
        dosage
        frequency
        duration
      }
      doctor {
        firstName
        lastName
      }
    }
    patientLabResults(patientId: $patientId) {
      _id
      date
      type
      status
      resultSummary
    }
  }
`

// Dashboard queries
export const GET_DOCTOR_DASHBOARD_DATA = `
  query GetDoctorDashboardData($doctorId: ID!) {
    doctorStats(doctorId: $doctorId) {
      totalPatients
      totalAppointments
      totalConsultations
      upcomingAppointments
      pendingRequests
    }
    recentAppointments: doctorAppointments(doctorId: $doctorId, limit: 5) {
      _id
      date
      time
      status
      patient {
        _id
        firstName
        lastName
        profileImage
      }
    }
    recentConsultations: doctorConsultations(doctorId: $doctorId, limit: 5) {
      _id
      date
      patient {
        _id
        firstName
        lastName
        profileImage
      }
      diagnosis
    }
  }
`

// Lab results queries
export const GET_LAB_RESULT_DETAILS = `
  query GetLabResultDetails($resultId: ID!) {
    labResult(id: $resultId) {
      _id
      date
      type
      status
      requestDate
      completionDate
      resultSummary
      resultDetails
      attachments
      patient {
        _id
        firstName
        lastName
        dateOfBirth
        gender
        profileImage
      }
      doctor {
        _id
        firstName
        lastName
        speciality
      }
      laboratory {
        name
        address
        phone
      }
    }
  }
`

// Messages queries
export const GET_DOCTOR_MESSAGES = `
  query GetDoctorMessages($doctorId: ID!) {
    doctorMessages(doctorId: $doctorId) {
      _id
      subject
      content
      date
      isRead
      sender {
        _id
        name
        role
        profileImage
      }
      recipient {
        _id
        name
        role
      }
    }
  }
`

// Emergency access queries
export const GET_EMERGENCY_ACCESS_REQUESTS = `
  query GetEmergencyAccessRequests($doctorId: ID!) {
    emergencyAccessRequests(doctorId: $doctorId) {
      _id
      date
      status
      reason
      requestedBy {
        _id
        firstName
        lastName
        speciality
        hospital
        profileImage
      }
      patient {
        _id
        firstName
        lastName
        dateOfBirth
        gender
        profileImage
      }
    }
  }
`

