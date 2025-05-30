import { gql } from "graphql-request"

// Service queries
export const GET_SERVICES = gql`
  query GetServices {
    services {
      id
      name
      slug
      category
      shortDescription
      description
      keyPoints
      duration
      price
      available
      image
    }
  }
`

export const GET_SERVICE_BY_SLUG = gql`
  query GetServiceBySlug($slug: String!) {
    service(slug: $slug) {
      id
      name
      slug
      category
      shortDescription
      description
      keyPoints
      duration
      price
      available
      image
      relatedServices {
        id
        name
        slug
      }
    }
  }
`

// Doctor queries
export const GET_DOCTORS = gql`
  query GetDoctors($specialty: String) {
    doctors(specialty: $specialty) {
      id
      name
      title
      specialty
      bio
      education
      experience
      languages
      acceptingNewPatients
      profileImage
      availableSlots {
        day
        slots
      }
    }
  }
`

export const GET_SPECIALTIES = gql`
  query GetSpecialties {
    specialties {
      id
      name
      description
    }
  }
`

// Content queries
export const GET_TERMS_CONTENT = gql`
  query GetTermsContent {
    termsAndConditions {
      id
      title
      content
      lastUpdated
    }
  }
`

export const GET_HOME_PAGE_CONTENT = gql`
  query GetHomePageContent {
    homePageContent {
      hero {
        title
        subtitle
        ctaText
        imageUrl
      }
      features {
        id
        title
        description
        iconName
      }
      testimonials {
        id
        name
        role
        content
        avatarUrl
      }
      statistics {
        patients
        doctors
        consultations
        prescriptions
      }
    }
  }
`

export const GET_FOOTER_CONTENT = gql`
  query GetFooterContent {
    footerLinks {
      category
      links {
        id
        label
        url
      }
    }
    companyInfo {
      name
      address
      phone
      email
    }
  }
`

export const GET_SITE_CONFIG = gql`
  query GetSiteConfig {
    siteConfig {
      siteName
      logoUrl
      primaryColor
      secondaryColor
      contactEmail
      contactPhone
      socialLinks {
        platform
        url
      }
    }
  }
`

