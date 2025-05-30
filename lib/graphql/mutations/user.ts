import { gql } from "graphql-request"

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($userId: ID!, $input: UpdateUserProfileInput!) {
    updateUserProfile(userId: $userId, input: $input) {
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
      updatedAt
    }
  }
`

export const UPLOAD_PROFILE_PICTURE = gql`
  mutation UploadProfilePicture($userId: ID!, $file: Upload!) {
    uploadProfilePicture(userId: $userId, file: $file) {
      id
      profilePicture
    }
  }
`

