import { gql } from "@apollo/client"

export const GET_PATIENT_INFO = gql`
query GetPatientInfo($patientId: String!) {
  patient: findUniquePatients(where: { id: $patientId }) {
    id
    users {
      first_name
      last_name
      phone
      email
    }
    date_of_birth
    gender
  }
}
`
export const GET_PATIENT_HISTORY = gql`
query GetPatientHistory($patientId: String! ,$take : Int , $skip: Int) {
  consultations: findManyConsultations(
    where: {
      patient_id: { equals: $patientId }
    }
    orderBy: { date: desc }
    take:$take
    skip:$skip
  ) {
    id
    date
    notes
    doctors {
      id
      users {
        first_name
        last_name
      }
      specialty
    }
  }
  prescriptions: findManyPrescriptions(
    where: {
      patient_id: { equals: $patientId }
    }
    orderBy: { date: desc }
    take:$take
    skip:$skip
  ) {
    id
    date
    medications {
      name
      dosage
      frequency
      duration
    }
    doctors {
      users {
        first_name
        last_name
      }
    }
  }
  labResults: findManyLab_documents(
    where: {
      patient_id: { equals: $patientId }
    }
    orderBy: { requested_at :desc }
    take:$take
    skip:$skip
  ) {
    id
    date :requested_at
    type :lab_requests{
      name:type
    }
    status
    resultSummary:notes
  }
}
`
export const GET_PATIENT_EXTENDED = gql`
query GetPatientDetails($patientId: String!) {
    patient :findUniquePatients(where: { id: $patientId }) {
      id
      users {
        first_name
        last_name
        email
        phone
        address
        profile_picture
      }
      date_of_birth
      gender

      GeneralMedicalRecords_GeneralMedicalRecords_patient_idTopatients {
        bloodType
        allergies
      }

  }
  }
`