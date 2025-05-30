import { gql } from "@apollo/client"

export const DELIVER_PRESCRIPTION = gql`
  mutation DeliverPrescription($id: ID!, $deliveryDetails: PrescriptionDeliveryInput!) {
    deliverPrescription(id: $id, deliveryDetails: $deliveryDetails) {
      id
      status
      deliveredAt
      deliveryDetails {
        receiverName
        receiverRelationship
        notes
      }
    }
  }
`

export const SCAN_PRESCRIPTION = gql`
  mutation ScanPrescription($prescriptionCode: String!) {
    scanPrescription(prescriptionCode: $prescriptionCode) {
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
    }
  }
`

export const UPDATE_INVENTORY = gql`
  mutation UpdateInventory($id: ID!, $quantity: Int!) {
    updateInventory(id: $id, quantity: $quantity) {
      id
      name
      currentStock
      updatedAt
    }
  }
`

