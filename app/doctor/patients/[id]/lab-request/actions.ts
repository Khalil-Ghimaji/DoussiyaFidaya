"use server"

import { revalidatePath } from "next/cache"
import { sendGraphQLMutation } from "@/lib/graphql-client"
import { redirect } from "next/dist/server/api-utils"
import { cookies } from "next/headers"

type FormData = {
  type: string
  description: string
  priority: "low" | "medium" | "high"
  tests: { name: string; instructions: string }[]
}

export async function createLabRequestAction(patientId: string, formData: FormData) {
  try {
    // Map tests to description format if needed
   
    //const session = {user: { id: "fc6d9c2c-6ec6-48c1-b762-fe35c2894b30"}  }

  const storedSesion = await cookies();
  const doctorId = storedSesion.get("associatedId")?.value;


    let description = formData.description || ""

    if (formData.tests && formData.tests.length > 0) {
      const testsDescription = formData.tests
        .filter((test) => test.name) // Filter out empty tests
        .map((test) => {
          let testDesc = `- ${test.name}`
          if (test.instructions) {
            testDesc += `: ${test.instructions}`
          }
          return testDesc
        })
        .join("\n")

      if (testsDescription) {
        description += "\n\nAnalyses demandées:\n" + testsDescription
      }
    }

    // Create the lab request mutation
    const CREATE_LAB_REQUEST = `
      mutation CreateLabRequest(
        $patientId: String!
        $type: String!
        $description: String
        $priority: lab_requests_priority_enum
        $doctorId: String!
      ) {
        createOneLab_requests(
          data: {
            patients: { connect: { id: $patientId } }
            doctors: { connect: { id: $doctorId } }
            type: $type
            description: $description
            priority: $priority
          }
        ) {
          id
          patient_id
          type
          description
          priority
        }
      }
    `

    const variables = {
      patientId: patientId,
      doctorId: doctorId,
      type: formData.type,
      description,
      priority: formData.priority,
    }

    // Execute the mutation
    const result = await sendGraphQLMutation(CREATE_LAB_REQUEST, variables)

    


    // Revalidate the patient's page
    revalidatePath(`/doctor/patients/${patientId}`)

    // Redirect to the patient's page
    return { success: true, data: result }
  } catch (error) {
    console.error("Error creating lab request:", error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Une erreur est survenue lors de la création de la demande d'analyses",
    }
  }
}
