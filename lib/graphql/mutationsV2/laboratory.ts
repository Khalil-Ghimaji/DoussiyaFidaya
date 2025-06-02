import { gql } from "@apollo/client"

export const CREATE_LAB_REQUEST = gql`
  mutation CreateLabRequest(
    $patientId: String!
    $type: String!
    $description: String
    $priority: lab_requests_priority_enum
  ) {
    createOneLab_requests(
      data: {
        patients: { connect: { id: $patientId } }
        type: $type
        description: $description
        priority: $priority
      }
    ) {
      id
      patient_id
      type
      description
      priority
    }
  }
`;
export const CREATE_LAB_DOCUMENT = gql`
mutation CreateLabDocument(
  $patientId: String! #  We'll use this to connect to the patient
  $labRequestId: String! #  We'll use this to connect to the lab request
  $labId: String! # We'll use this to connect to the laboratory
  $requestedAt: DateTimeISO! #  Added requested_at
  $status: lab_documents_status_enum! #  Added status
 ) {
  createOneLab_documents(
  data: {
  patients: { #  Using 'patients' (but within the nested input)
  connect: { #  Assuming we want to connect to an existing patient
  id: $patientId
  }
  }
  lab_requests: { #  Assuming 'lab_requests' is correct
  connect: {
  id: $labRequestId
  }
  }
  laboratories: { #  Assuming 'laboratories' is the correct field
  connect: {
  id: $labId
  }
  }
  requested_at: $requestedAt #  Added requested_at
  status: $status #  Added status
  }
  ) {
  id
  patient_id #  If you need this
  lab_request_id #  If you need this
  laboratory_id # If you need this
  requested_at #  Added requested_at to the return
  status #  Added status to the return
  }
  }
`;
