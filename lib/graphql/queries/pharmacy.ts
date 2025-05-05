import { gql } from "@apollo/client"

export const GET_PHARMACY_DASHBOARD = gql`
  query GetPharmacyDashboard {
    pharmacyDashboard {
      pendingPrescriptions {
        id
        patientName
        medicationName
        status
        createdAt
      }
      recentDeliveries {
        id
        patientName
        medicationName
        deliveredAt
      }
      inventoryAlerts {
        id
        medicationName
        currentStock
        minThreshold
      }
      stats {
        totalPrescriptions
        deliveredToday
        pendingPrescriptions
        lowStockItems
      }
    }
  }
`

export const GET_PHARMACY_PRESCRIPTIONS = gql`
  query GetPharmacyPrescriptions($status: String, $search: String) {
    pharmacyPrescriptions(status: $status, search: $search) {
      id
      patientName
      patientId
      doctorName
      doctorId
      medicationName
      dosage
      frequency
      duration
      status
      createdAt
      updatedAt
    }
  }
`

export const GET_PRESCRIPTION_DETAILS = gql`
  query GetPrescriptionDetails($id: ID!) {
    prescription(id: $id) {
      id
      patientName
      patientId
      doctorName
      doctorId
      medicationName
      dosage
      frequency
      duration
      instructions
      status
      createdAt
      updatedAt
      patient {
        id
        name
        email
        phone
        address
        dateOfBirth
      }
      doctor {
        id
        name
        specialization
        email
        phone
      }
      medication {
        id
        name
        description
        currentStock
        minThreshold
        price
      }
    }
  }
`

export const GET_PHARMACY_INVENTORY = gql`
  query GetPharmacyInventory($search: String) {
    pharmacyInventory(search: $search) {
      id
      name
      description
      currentStock
      minThreshold
      price
      updatedAt
    }
  }
`

