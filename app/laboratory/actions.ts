"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getClient } from "@/lib/apollo-client-server"
import { UPLOAD_ANALYSIS_RESULTS, UPDATE_ANALYSIS_STATUS } from "@/lib/graphql/mutations/laboratory"
import { CREATE_LAB_DOCUMENT, CREATE_LAB_REQUEST } from "@/lib/graphql/mutationsV2/laboratory"
import { getApolloServerClient } from "@/lib/apollo-server-client"
import { sendGraphQLMutation } from "@/lib/graphql-client"
type CreateLabRequestResponse = {
  createOneLab_requests: {
    id: string;
    patient_id: string;
    type: string;
    description: string;
    priority: string;
  };
};
export async function createAnalysis(formData: FormData) {
  const patientId = formData.get("patientId") as string
  const analysisType = formData.get("analysisType") as string
  const priority = formData.get("priority") as string
  const notes = formData.get("notes") as string
  const labId  = "e98c8e51-e285-418c-865a-2dde9bd30cc9" as string // Assuming this is a static lab ID for now

  const { data: labRequestData } = await sendGraphQLMutation<CreateLabRequestResponse>(CREATE_LAB_REQUEST, {
  patientId,
  type: analysisType,
  description: notes,
  priority,
});
const labReqId = labRequestData.createOneLab_requests.id as string; // Extracting the lab request ID
// 2. Create Lab Document referencing the lab request
const { data: labDocumentData } = await sendGraphQLMutation(CREATE_LAB_DOCUMENT, {
  patientId,
  labRequestId: labReqId,
  labId: labId,
  requestedAt: new Date().toISOString(),
  status: 'pending',
});

  revalidatePath("/laboratory/pending")

  if (patientId) {
    revalidatePath(`/laboratory/patients/${patientId}/history`)
    redirect(`/laboratory/patients/${patientId}/history`)
  }

  // If no redirect, return success
  return { success: true, labDocumentData }
}

export async function uploadAnalysisResults(formData: FormData) {
  try {
    const analysisId = formData.get("analysisId") as string

    // Process results from form data
    const resultsData: any[] = []
    let i = 0
    while (formData.has(`results[${i}].title`)) {
      resultsData.push({
        title: formData.get(`results[${i}].title`),
        value: formData.get(`results[${i}].value`),
        unit: formData.get(`results[${i}].unit`),
        referenceRange: formData.get(`results[${i}].referenceRange`),
        isAbnormal: formData.get(`results[${i}].isAbnormal`) === "true",
      })
      i++
    }

    const notes = formData.get("notes") as string

    // Handle file uploads - in a real implementation, you would upload files to storage
    // and then store the URLs in the database
    const attachments: any[] = []
    const files = formData.getAll("attachments") as File[]
    for (const file of files) {
      if (file.size > 0) {
        // Simulate file upload and getting a URL
        attachments.push({
          name: file.name,
          type: file.type,
          url: `/uploads/${Date.now()}-${file.name}`, // This would be a real URL in production
        })
      }
    }

    const { data } = await getClient().mutate({
      mutation: UPLOAD_ANALYSIS_RESULTS,
      variables: {
        input: {
          analysisId,
          results: resultsData,
          notes,
          attachments,
        },
      },
    })

    revalidatePath("/laboratory/pending")
    revalidatePath(`/laboratory/results/${analysisId}`)

    return redirect(`/laboratory/results/${analysisId}`)
  } catch (error) {
    console.error("Error uploading analysis results:", error)
    return { success: false, error: "Failed to upload results. Please try again." }
  }
}

export async function updateAnalysisStatus(analysisId: string, status: string) {
  try {
    const { data } = await getClient().mutate({
      mutation: UPDATE_ANALYSIS_STATUS,
      variables: {
        id: analysisId,
        status,
      },
    })

    revalidatePath("/laboratory/pending")
    revalidatePath(`/laboratory/results/${analysisId}`)

    return { success: true, data: data.updateAnalysisStatus }
  } catch (error) {
    console.error("Error updating analysis status:", error)
    return { success: false, error: "Failed to update status. Please try again." }
  }
}

