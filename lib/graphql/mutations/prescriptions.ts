export const CREATE_PRESCRIPTION = `
  mutation CreatePrescription($input: PrescriptionInput!) {
    createPrescription(input: $input) {
      _id
      date
      status
    }
  }
`

export const UPDATE_PRESCRIPTION = `
  mutation UpdatePrescription($id: ID!, $input: PrescriptionInput!) {
    updatePrescription(id: $id, input: $input) {
      _id
      date
      status
    }
  }
`

export const RENEW_PRESCRIPTION = `
  mutation RenewPrescription($id: ID!, $input: PrescriptionInput!) {
    renewPrescription(id: $id, input: $input) {
      _id
      date
      status
    }
  }
`

