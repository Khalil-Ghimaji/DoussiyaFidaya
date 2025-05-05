export const GET_DOCTOR_PRESCRIPTIONS = `
  query GetDoctorPrescriptions($doctorId: ID!, $status: String) {
    doctorPrescriptions(doctorId: $doctorId, status: $status) {
      _id
      date
      expiryDate
      status
      medications {
        name
        dosage
        frequency
        duration
        quantity
      }
      instructions
      renewals
      validity
      isSigned
      patient {
        _id
        firstName
        lastName
        avatar
        initials
        birthDate
        age
      }
    }
  }
`

export const GET_PRESCRIPTION_BY_ID = `
  query GetPrescriptionById($prescriptionId: ID!) {
    prescription(id: $prescriptionId) {
      _id
      date
      expiryDate
      status
      medications {
        name
        dosage
        frequency
        duration
        quantity
      }
      instructions
      renewals
      validity
      isSigned
      patient {
        _id
        firstName
        lastName
        avatar
        initials
        birthDate
        age
      }
      doctor {
        _id
        firstName
        lastName
        specialty
        address
        phone
      }
    }
  }
`

export const GET_PATIENTS_FOR_DOCTOR = `
  query GetPatientsForDoctor($doctorId: ID!) {
    doctorPatients(doctorId: $doctorId) {
      _id
      firstName
      lastName
      avatar
      initials
      birthDate
      age
    }
  }
`

