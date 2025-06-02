// GraphQL queries and mutations for quick consultations

export const CREATE_QUICK_CONSULTATION = `
  mutation CreateQuickConsultation(
    $data: ConsultationsCreateInput!
  ) {
    createOneConsultations(
      data: $data
    ) {
      id
      date
      notes
      measures
      prescriptions {
        id
        date
        is_signed
        status
        medications {
          id
          name
          dosage
          frequency
          duration
          quantity
        }
      }
      lab_requests {
        id
        type
        priority
        description
        status
      }
    }
  }
`

export const GET_PATIENT_BY_ID = `
  query GetPatientById($where: PatientsWhereUniqueInput!) {
    findUniquePatients(where: $where) {
      id
      users {
        first_name
        last_name
      }
      date_of_birth
      gender
      GeneralMedicalRecords_GeneralMedicalRecords_patient_idTopatients {
        bloodType
      }
    }
  }
`

export const SEARCH_PATIENTS = `
  query SearchPatients($where: PatientsWhereInput) {
    findManyPatients(
      where: $where
      take: 10
    ) {
      id
      users {
        first_name
        last_name
      }
    }
  }
` 