import { gql } from "@apollo/client"

export const GET_ASSISTANT_PROFILE = gql`
  query GetAssistantProfile {
    assistantProfile {
      id
      name
      email
      phone
      doctorId
      doctorName
      createdAt
      lastLogin
    }
  }
`

export const GET_ASSISTANT_DASHBOARD = gql`
  query GetAssistantDashboard {
    assistantDashboard {
      todayAppointments
      pendingRequests
      upcomingAppointments
      recentActivities {
        id
        type
        description
        timestamp
        relatedId
        relatedName
      }
      doctorInfo {
        id
        name
        specialty
        availability {
          day
          startTime
          endTime
        }
      }
    }
  }
`

export const GET_ASSISTANT_APPOINTMENTS = gql`
  query GetAssistantAppointments($status: String, $date: String, $search: String) {
    assistantAppointments(status: $status, date: $date, search: $search) {
      id
      patientId
      patientName
      patientPhone
      patientEmail
      doctorId
      doctorName
      date
      startTime
      endTime
      status
      reason
      notes
      createdAt
      updatedAt
    }
  }
`

export const GET_APPOINTMENT_DETAILS = gql`
  query GetAppointmentDetails($id: ID!) {
    appointment(id: $id) {
      id
      patientId
      patientName
      patientPhone
      patientEmail
      doctorId
      doctorName
      date
      startTime
      endTime
      status
      reason
      notes
      createdAt
      updatedAt
      patient {
        id
        name
        dateOfBirth
        gender
        phone
        email
        address
        medicalHistory {
          conditions
          allergies
          medications
        }
      }
    }
  }
`

export const GET_APPOINTMENT_REQUEST = gql`
  query GetAppointmentRequest($id: ID!) {
    appointmentRequest(id: $id) {
      id
      patientId
      patientName
      patientPhone
      patientEmail
      doctorId
      doctorName
      preferredDates
      preferredTimes
      reason
      status
      notes
      createdAt
    }
  }
`

export const GET_DOCTOR_AVAILABILITY = gql`
  query GetDoctorAvailability($doctorId: ID!, $date: String) {
    doctorAvailability(doctorId: $doctorId, date: $date) {
      date
      availableSlots {
        startTime
        endTime
      }
    }
  }
`

export const GET_PATIENTS_LIST = gql`
  query GetPatientsList($search: String) {
    patients(search: $search) {
      id
      name
      dateOfBirth
      gender
      phone
      email
    }
  }
`

