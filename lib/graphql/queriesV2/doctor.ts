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

export const GET_DOCTOR_DASHBOARD = gql`
query GetDoctorDashboard($doctorId: String!) {
  # Get all patient IDs from consultations (for unique count)
  patientData: findManyConsultations(
    where: { 
      doctors: { is: { id: { equals: $doctorId } } }
    }
    distinct: [patient_id]
  ) {
    patient_id
  }

  # Total number of appointments for the doctor
  totalAppointments: aggregateRdvs(
    where: { 
      doctors: { is: { id: { equals: $doctorId } } }
    }
  ) {
    _count {
      _all
    }
  }

  # Total number of consultations for the doctor
  totalConsultations: aggregateConsultations(
    where: { 
      doctors: { is: { id: { equals: $doctorId } } }
    }
  ) {
    _count {
      _all
    }
  }

  # Upcoming appointments (next 7 days)
  upcomingAppointments: aggregateRdvs(
    where: {
      doctors: { is: { id: { equals: $doctorId } } }
      date: { 
        gte: "${new Date().toISOString()}"
        lte: "${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}"
      }
    }
  ) {
    _count {
      _all
    }
  }

  # Pending requests (using Rdv_requests)
  pendingRequests: aggregateRdv_requests(
    where: {
      doctors: { is: { id: { equals: $doctorId } } }
      Status: { equals: "pending" }
    }
  ) {
    _count {
      _all
    }
  }

  # Recent appointments (last 5)
  recentAppointments: findManyRdvs(
    where: { 
      doctors: { is: { id: { equals: $doctorId } } }
    }
    orderBy: { date: desc }
    take: 5
  ) {
    id
    date
    time
    patients {
      id
      users {
        first_name
        last_name
        profile_picture
      }
    }
  }

  # Recent consultations (last 5)
  recentConsultations: findManyConsultations(
    where: { 
      doctors: { is: { id: { equals: $doctorId } } }
    }
    orderBy: { date: desc }
    take: 5
  ) {
    id
    date
    notes
    patients {
      id
      users {
        first_name
        last_name
        profile_picture
      }
    }
  }
}
`
