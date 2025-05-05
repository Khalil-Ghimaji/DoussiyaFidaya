import { gql } from "@apollo/client"

export const GET_LABORATORY_DASHBOARD = gql`
  query GetLaboratoryDashboard {
    laboratoryDashboard {
      totalAnalyses
      pendingAnalyses
      completedAnalyses
      recentAnalyses {
        id
        patientName
        type
        status
        requestedAt
        completedAt
      }
      analyticsData {
        labels
        datasets {
          label
          data
        }
      }
    }
  }
`

export const GET_LABORATORY_PATIENTS = gql`
  query GetLaboratoryPatients($search: String, $page: Int, $limit: Int) {
    laboratoryPatients(search: $search, page: $page, limit: $limit) {
      patients {
        id
        name
        documentId
        dateOfBirth
        gender
        contactNumber
        email
        lastAnalysisDate
        totalAnalyses
      }
      pagination {
        total
        page
        limit
        hasMore
      }
    }
  }
`

export const GET_PATIENT_ANALYSIS_HISTORY = gql`
  query GetPatientAnalysisHistory($patientId: ID!, $page: Int, $limit: Int) {
    patientAnalysisHistory(patientId: $patientId, page: $page, limit: $limit) {
      patient {
        id
        name
        documentId
        dateOfBirth
        gender
        contactNumber
        email
      }
      analyses {
        id
        type
        status
        requestedAt
        completedAt
        requestedBy {
          id
          name
          specialty
        }
        results {
          id
          title
          value
          unit
          referenceRange
          isAbnormal
        }
      }
      pagination {
        total
        page
        limit
        hasMore
      }
    }
  }
`

export const GET_PENDING_ANALYSES = gql`
  query GetPendingAnalyses($search: String, $page: Int, $limit: Int) {
    pendingAnalyses(search: $search, page: $page, limit: $limit) {
      analyses {
        id
        patientName
        patientId
        type
        priority
        requestedAt
        requestedBy {
          id
          name
          specialty
        }
      }
      pagination {
        total
        page
        limit
        hasMore
      }
    }
  }
`

export const GET_ANALYSIS_RESULTS = gql`
  query GetAnalysisResults($analysisId: ID!) {
    analysisResults(analysisId: $analysisId) {
      id
      patient {
        id
        name
        documentId
        dateOfBirth
        gender
      }
      type
      status
      requestedAt
      completedAt
      requestedBy {
        id
        name
        specialty
      }
      completedBy {
        id
        name
      }
      results {
        id
        title
        value
        unit
        referenceRange
        isAbnormal
      }
      notes
      attachments {
        id
        name
        type
        url
      }
    }
  }
`

export const GET_ANALYSIS_TYPES = gql`
  query GetAnalysisTypes {
    analysisTypes {
      id
      name
      category
      description
      price
      estimatedTime
    }
  }
`

