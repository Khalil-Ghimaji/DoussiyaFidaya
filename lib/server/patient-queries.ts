// Patient dashboard queries
export const GET_PATIENT_DASHBOARD_DATA = `
  query GetPatientDashboardData($patientId: ID!) {
    patient(id: $patientId) {
      _id
      firstName
      lastName
      medicalRecord {
        birthDate
        bloodType
        allergies
        medicalHistory {
          condition
          since
        }
        currentTreatments {
          name
          dosage
          frequency
          prescribedBy
        }
      }
      stats {
        upcomingAppointmentsCount
        activePrescritionsCount
        labResultsCount
        authorizedDoctorsCount
        nextAppointment {
          doctorName
          date
        }
      }
    }
  }
`

// Patient analyses queries
export const GET_PATIENT_ANALYSIS_DETAILS = `
  query GetPatientAnalysisDetails($analysisId: ID!) {
    labResult(id: $analysisId) {
      _id
      completionDate
      type
      laboratory {
        name
      }
      doctor {
        firstName
        lastName
      }
      status
      results {
        name
        value
        unit
        range
        status
      }
      comments
    }
  }
`

// Patient authorizations queries
export const GET_PATIENT_AUTHORIZATIONS = `
  query GetPatientAuthorizations($patientId: ID!) {
    authorizedDoctors: patientAuthorizations(patientId: $patientId, type: "regular") {
      _id
      doctor {
        _id
        firstName
        lastName
        avatar
        initials
        specialty
        hospital
      }
      authorizedSince
      accessLevel
    }
    availableDoctors: availableDoctorsForAuthorization(patientId: $patientId) {
      _id
      firstName
      lastName
      avatar
      initials
      specialty
      hospital
    }
    emergencyAccesses: patientAuthorizations(patientId: $patientId, type: "emergency") {
      _id
      doctor {
        _id
        firstName
        lastName
        avatar
        initials
        specialty
        hospital
      }
      date
      time
      reason
      status
      reviewedBy
      reviewDate
      expiresAt
    }
    accessHistory: patientAuthorizationHistory(patientId: $patientId) {
      _id
      doctor {
        _id
        firstName
        lastName
        avatar
        initials
        specialty
      }
      accessType
      date
      time
      dataAccessed
    }
  }
`

// Patient medical record queries
export const GET_PATIENT_MEDICAL_RECORD = `
  query GetPatientMedicalRecord($patientId: ID!) {
    patientInfo: patient(id: $patientId) {
      _id
      firstName
      lastName
      medicalRecord {
        birthDate
        bloodType
        allergies
        medicalHistory {
          condition
          since
        }
        currentTreatments {
          name
          dosage
          frequency
          prescribedBy
        }
      }
    }
    medicalSegments: patientMedicalSegments(patientId: $patientId) {
      id
      name
      iconName
      doctor {
        firstName
        lastName
      }
      lastVisit
      notes
      data {
        name
        value
        date
      }
      documents {
        id
        name
        date
        type
      }
      consultations {
        id
        date
        doctor {
          firstName
          lastName
        }
        reason
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
      patient {
        _id
        firstName
        lastName
        age
        gender
        bloodType
      }
      doctor {
        firstName
        lastName
      }
      specialty
      reason
      notes
      diagnosis
      vitalSigns {
        bloodPressure
        heartRate
        temperature
        respiratoryRate
        oxygenSaturation
        weight
      }
      prescriptions {
        id
        name
        dosage
        frequency
        duration
        quantity
      }
      labRequests {
        id
        type
        priority
        laboratory
        status
        resultId
      }
    }
  }
`

export const GET_MEDICAL_DOCUMENT = `
  query GetMedicalDocument($documentId: ID!) {
    medicalDocument(id: $documentId) {
      id
      name
      type
      date
      doctor {
        firstName
        lastName
      }
      specialty
      description
      notes
      url
    }
  }
`

// Patient appointments queries
export const GET_PATIENT_APPOINTMENTS = `
  query GetPatientAppointments($patientId: ID!) {
    appointments(patientId: $patientId) {
      _id
      date
      time
      doctor {
        _id
        firstName
        lastName
        specialty
        hospital
      }
      status
      reason
      notes
      prescriptionId
    }
  }
`

