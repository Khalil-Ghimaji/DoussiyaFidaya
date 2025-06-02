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
    query MyQuery($id: String = "") {
        findFirstUsers(where: {id: {equals: $id}}) {
            first_name
            email
            id
            is_verified
            last_login
            last_name
            role
            profile_picture
        }
    }
`

