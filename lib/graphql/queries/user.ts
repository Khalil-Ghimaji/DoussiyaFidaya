import { gql } from "graphql-request"

export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: ID!) {
    userProfile(userId: $userId) {
      id
      firstName
      lastName
      email
      phone
      address {
        street
        city
        state
        postalCode
        country
      }
      dateOfBirth
      gender
      profilePicture
      role
      specialization
      licenseNumber
      createdAt
      updatedAt
    }
  }
`

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      firstName
      lastName
      email
      role
      profilePicture
      isVerified
      lastLogin
    }
  }
`

