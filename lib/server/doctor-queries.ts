// Doctor appointments queries
export const GET_DOCTOR_APPOINTMENTS = `
  query GetDoctorAppointments($doctorId: ID!, $filters: AppointmentFilters) {
    doctorAppointments(doctorId: $doctorId, filters: $filters) {
      _id
      date
      time
      duration
      patient {
        _id
        firstName
        lastName
        avatar
        initials
        age
        gender
      }
      status
      type
      reason
      notes
      createdAt
      createdBy
    }
  }
`

export const GET_APPOINTMENT_DETAILS = `
  query GetAppointmentDetails($appointmentId: ID!) {
    appointment(id: $appointmentId) {
      _id
      date
      time
      duration
      patient {
        _id
        firstName
        lastName
        avatar
        initials
        age
        gender
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
      doctor {
        _id
        firstName
        lastName
        specialty
        hospital
      }
      status
      type
      reason
      notes
      createdAt
      createdBy
    }
  }
`

export const GET_AVAILABLE_SLOTS = `
  query GetAvailableSlots($doctorId: ID!, $date: String!) {
    availableSlots(doctorId: $doctorId, date: $date) {
      time
      available
    }
  }
`

export const GET_DOCTOR_PATIENTS = `
  query GetDoctorPatients($doctorId: ID!) {
    doctorPatients(doctorId: $doctorId) {
      _id
      firstName
      lastName
      avatar
      initials
      age
      gender
      bloodType
      lastVisit
    }
  }
`


