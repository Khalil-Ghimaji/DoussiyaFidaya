import { gql } from "graphql-request"

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!, $role: String!) {
    login(email: $email, password: $password, role: $role) {
      token
      user {
        id
        firstName
        lastName
        email
        role
      }
    }
  }
`

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        role
      }
    }
  }
`

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
    }
  }
`

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`

