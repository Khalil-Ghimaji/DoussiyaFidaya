import { gql } from "@apollo/client"
/*
export const GET_LABORATORY_DASHBOARD = gql`
query GetRecentAnalysesWithDirectPatientRelation(
  $laboratoryId: String!
  $takeCount: Int = 10
) {
  recentAnalyses: lab_documents( # Replace 'lab_documents' if your root query field for these is different
    where: { laboratory_id: { equals: $laboratoryId } } # Adjust filter as needed
    orderBy: { requested_at: desc }
    take: $takeCount
  ) {
    id
    # This 'patients' field should now work based on YOUR provided schema
    patients {
      # Assuming 'Patients' type has a 'users' field leading to Users type
      users {
        first_name
        last_name
      }
    }
    # For type of analysis
    lab_requests {
      type
    }
    # Other fields from Lab_documents
    status
    requested_at
    completed_at
    section
    notes # You listed 'notes' (plural) in your snippet
  }
}
`
*/
export const GET_LABORATORY_DASHBOARD = gql`
query GetLaboratoryDashboard($labId: String!) {
  # Total number of analyses for the specified laboratory
  totalAnalyses: aggregateLab_documents(
    where: { laboratory_id: { equals: $labId } }
  ) {
    _count {
      _all
    }
  }

  # Number of pending analyses (including in_progress) for the specified laboratory
  pendingAnalyses: aggregateLab_documents(
    where: {
      laboratory_id: { equals: $labId }
      status: { in: [pending, in_progress] }
    }
  ) {
    _count {
      _all
    }
  }

  # Number of completed analyses for the specified laboratory
  completedAnalyses: aggregateLab_documents(
    where: {
      laboratory_id: { equals: $labId }
      status: { equals: completed }
    }
  ) {
    _count {
      _all
    }
  }

  # List of recent analyses for the specified laboratory
  recentAnalyses: findManyLab_documents(
    where: { laboratory_id: { equals: $labId } }
    orderBy: { requested_at: desc }
    take: 10
  ) {
    id
    patients {
      users {
        first_name
        last_name
      }
    }
    lab_requests {
      type
    }
    status
    requestedAt: requested_at
    completedAt: completed_at
  }

  # Analytics data: Count of lab documents by status for the specified laboratory
  analyticsData: groupByLab_documents(
    by: [status]
    where: { laboratory_id: { equals: $labId } }
  ) {
    status
    _count {
      _all
    }
  }
}
`

export const GET_PENDING_ANALYSES = gql`
query GetPendingAnalysis($labId: String! ,$take:Int ,$skip:Int) {
  # Number of pending analyses (including in_progress) for the specified laboratory
  pendingAnalyses: findManyLab_documents(
    where: { laboratory_id: { equals: $labId } 
    					status : {equals : pending} 
    }
    orderBy: { requested_at: desc }
    take: $take
    skip: $skip
  ) {
    id
    patients {
      users {
        first_name
        last_name
      }
    }
    lab_requests {
      type
      priority
    }
    status
    requestedAt: requested_at
    completedAt: completed_at
  }
}
`
export const GET_LABORATORY_PATIENTS = gql`
query GetUniqueLabPatients($labId: String!,$take: Int,$skip: Int) {
  uniquePatients: findManyPatients(
    where: {
      lab_documents: {
        some: {
          laboratory_id: { equals: $labId }
          status: { equals: pending }
        }
      }
    }
    take: $take
    skip: $skip
    distinct: [id]  # Ensure unique patients
  ) {
    id
    date_of_birth
    gender
    users {
      first_name
      last_name
    }    
    # Get count of analyses for this lab
    _count {
      lab_documents(where: { laboratory_id: { equals: $labId } })
    }
  }
}`
export const GET_LABORATORY_PATIENT_ANALYSES = gql`
query GetPatientAnalyses(
  $labId: String!
  $patientId: String!
  $take: Int
  $skip: Int
) {
  analyses: findManyLab_documents(
    where: { 
      patient_id: { equals: $patientId }
      laboratory_id: { equals: $labId }
    }
    orderBy: { requested_at: desc }
    take: $take
    skip: $skip
  ) {
    id 
    status
    requested_at
    completed_at
    lab_requests {
      type
      priority
    }
  }
}`