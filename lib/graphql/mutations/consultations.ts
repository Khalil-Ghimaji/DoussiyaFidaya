export const CREATE_QUICK_CONSULTATION = `
  mutation CreateQuickConsultation($input: ConsultationInput!) {
    createConsultation(input: $input) {
      _id
      date
      status
    }
  }
`

export const CREATE_CONSULTATION_PRESCRIPTION = `
  mutation CreateConsultationPrescription($consultationId: ID!, $input: PrescriptionInput!) {
    createConsultationPrescription(consultationId: $consultationId, input: $input) {
      _id
      date
      status
    }
  }
`

export const CREATE_LAB_REQUEST = `
  mutation CreateLabRequest($input: LabRequestInput!) {
    createLabRequest(input: $input) {
      _id
      requestDate
      status
    }
  }
`

