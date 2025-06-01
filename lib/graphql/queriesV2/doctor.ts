import { gql } from "@apollo/client"

export const GET_DOCTOR_PATIENTS = gql`
query GetDoctorPatients($docId: String!, $take: Int, $skip: Int) {
  docPatients: findManyConsultations(
    where: { 
      doctor_id: { equals: $docId }
    }
    orderBy: { date: desc }
    take: $take
    skip: $skip
    distinct: [patient_id]
  ) {
    date
    patient_id
    patients {
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
    }
  }
}`

