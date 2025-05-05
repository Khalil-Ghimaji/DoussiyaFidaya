import { gql } from "graphql-request"

export const SUBMIT_CONTACT_FORM = gql`
  mutation SubmitContactForm($input: ContactFormInput!) {
    submitContactForm(input: $input) {
      success
      message
      ticketId
    }
  }
`

