import { gql } from "@apollo/client"

export const CREATE_APPOINTMENT = gql`
  mutation CreateAppointment($input: AppointmentInput!) {
    createAppointment(input: $input) {
      id
      patientId
      patientName
      doctorId
      doctorName
      date
      startTime
      endTime
      status
      reason
      notes
    }
  }
`

export const UPDATE_APPOINTMENT = gql`
  mutation UpdateAppointment($id: ID!, $input: AppointmentInput!) {
    updateAppointment(id: $id, input: $input) {
      id
      patientId
      patientName
      doctorId
      doctorName
      date
      startTime
      endTime
      status
      reason
      notes
    }
  }
`

export const DECLINE_APPOINTMENT_REQUEST = gql`
  mutation DeclineAppointmentRequest($id: ID!, $reason: String!) {
    declineAppointmentRequest(id: $id, reason: $reason) {
      id
      status
      notes
    }
  }
`

export const SCHEDULE_APPOINTMENT_REQUEST = gql`
  mutation ScheduleAppointmentRequest($id: ID!, $date: String!, $startTime: String!, $endTime: String!) {
    scheduleAppointmentRequest(id: $id, date: $date, startTime: $startTime, endTime: $endTime) {
      id
      status
      date
      startTime
      endTime
    }
  }
`

export const CANCEL_APPOINTMENT = gql`
  mutation CancelAppointment($id: ID!, $reason: String!) {
    cancelAppointment(id: $id, reason: $reason) {
      id
      status
      notes
    }
  }
`

