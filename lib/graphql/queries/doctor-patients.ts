import { gql } from "graphql-request"

export const FIND_DOCTOR_PATIENTS = gql`
    query FindManyPatients($equals: String = "") {
        findManyConsultations {
            patients {
                id
                users {
                    first_name
                    last_name
                }
                consultations(where: {doctor_id: {equals: $equals}}) {
                    doctors {
                        id
                        last_name
                        first_name
                    }
                }
            }
        }
    }
`
