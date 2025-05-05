import { gql } from "@apollo/client"

export const CREATE_ANALYSIS = gql`
  mutation CreateAnalysis($input: CreateAnalysisInput!) {
    createAnalysis(input: $input) {
      id
      patientName
      type
      status
      requestedAt
    }
  }
`

export const UPLOAD_ANALYSIS_RESULTS = gql`
  mutation UploadAnalysisResults($input: UploadAnalysisResultsInput!) {
    uploadAnalysisResults(input: $input) {
      id
      status
      completedAt
    }
  }
`

export const UPDATE_ANALYSIS_STATUS = gql`
  mutation UpdateAnalysisStatus($id: ID!, $status: AnalysisStatus!) {
    updateAnalysisStatus(id: $id, status: $status) {
      id
      status
      updatedAt
    }
  }
`

