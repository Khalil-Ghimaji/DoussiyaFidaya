'use server'

import { revalidateTag } from 'next/cache'
import { sendGraphQLMutation } from '@/lib/graphql-client'
import { cookies } from 'next/headers'
import {createPrescription} from "@/app/doctor/patients/[id]/prescription/actions";

export async function createRdvConsultationAction(patientId: string,rdvId:string, formData: FormData) {
    try {
        // Simulated logged-in doctor
        const storedSession = await cookies();
        const doctorId = storedSession.get("associatedId")?.value;
        const session = { user: { id: doctorId } }

        // Extract all form data first
        const formValues = {
            reason: formData.get('reason') as string,
            symptoms: formData.get('symptoms') as string,
            examination: formData.get('examination') as string,
            diagnosis: formData.get('diagnosis') as string,
            treatment: formData.get('treatment') as string,
            notes: formData.get('notes') as string,
            labRequestReason: formData.get('labRequestReason') as string,
            requestedTests: formData.get('requestedTests') as string,
            labNotes: formData.get('labNotes') as string,
            priority: formData.get('priority') as string || 'medium',
        }

        // Validate required fields
        if (!formValues.reason || !formValues.symptoms || !formValues.examination ||
            !formValues.diagnosis || !formValues.treatment) {
            return { success: false, message: 'Tous les champs obligatoires doivent être remplis' }
        }

        // Create prescription if medications exist
        let prescriptionId: string | null = null
        const prescriptionResult = await createPrescription(patientId, formData, session)

        if (prescriptionResult?.data?.createOnePrescriptions?.id) {
            prescriptionId = prescriptionResult.data.createOnePrescriptions.id
        }

        // Prepare consultation notes
        const consultationNotes = [
            `Motif: ${formValues.reason}`,
            `Symptômes: ${formValues.symptoms}`,
            `Examen clinique: ${formValues.examination}`,
            `Diagnostic: ${formValues.diagnosis}`,
            `Traitement: ${formValues.treatment}`,
            ...(formValues.notes ? [`Notes: ${formValues.notes}`] : [])
        ]

        // Create consultation
        const consultationMutation = `
      mutation CreateConsultation(
        $patientId: String!
        $doctorId: String!
        ${prescriptionId ? '$prescriptionId: String,' : ''}
        $rdvId: String!
        $date: DateTimeISO!
        $section: String
        $measures: JSON
        $notes: ConsultationsCreatenotesInput
      ) {
        createOneConsultations(
          data: {
            patients: { connect: { id: $patientId } }
            doctors: { connect: { id: $doctorId } }
            ${prescriptionId ? 'prescriptions: { connect: { id: $prescriptionId } }' : ''}
            date: $date
            section: $section
            measures: $measures
            notes: $notes
            rdvs: { connect: { id: $rdvId } }
          }
        ) {
          id
        }
      }
    `

        const consultationVariables = {
            patientId,
            doctorId: session.user.id,
            date: new Date().toISOString(),
            section: 'Consultation médicale',
            rdvId,
            measures: { treatment: `Traitement: ${formValues.treatment}` },
            notes: { set: consultationNotes },
            ...(prescriptionId && { prescriptionId })
        }

        const consultationResult = await sendGraphQLMutation(consultationMutation, consultationVariables)
        const consultationId = consultationResult?.data?.createOneConsultations?.id

        if (!consultationId) {
            throw new Error('Failed to create consultation')
        }

        // Create lab request if needed
        if (formValues.labRequestReason && formValues.requestedTests) {
            const labRequestMutation = `
        mutation CreateLabRequest(
          $patientId: String!
          $doctorId: String!
          $type: String!
          $description: String
          $priority: lab_requests_priority_enum
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
          }
        }
      `

            const labRequestVariables = {
                patientId,
                doctorId: session.user.id,
                type: formValues.labRequestReason,
                description: `${formValues.requestedTests}${formValues.labNotes ? ` - Notes: ${formValues.labNotes}` : ''}`,
                priority: formValues.priority,
            }

            const labRequestResult = await sendGraphQLMutation(labRequestMutation, labRequestVariables)
            const labRequestId = labRequestResult?.data?.createOneLab_requests?.id

            if (labRequestId) {
                // Link lab request to consultation
                const linkLabRequestMutation = `
          mutation Mutation($ConsultationId: String!, $LabRequestId: String!) {
            updateOneConsultations(
              where: {id: $ConsultationId}
              data: {lab_requests: {connect: {id: $LabRequestId}}}
            ) {
              id
            }
          }
        `

                await sendGraphQLMutation(linkLabRequestMutation, {
                    ConsultationId: consultationId,
                    LabRequestId: labRequestId,
                })
            }
        }

        // Revalidate and redirect
        revalidateTag('consultations')

        // Note: No code executes after redirect()

    } catch (error) {
        console.error('Erreur dans createConsultationAction:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
        }
    }
}