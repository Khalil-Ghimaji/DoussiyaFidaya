"use server";

import { sendGraphQLMutation } from "@/lib/graphql-client";
import { CREATE_QUICK_CONSULTATION } from "@/lib/graphql/quick-consultation";
import { transformToBackendFormat } from "@/lib/transformers/quick-consultation";
import { redirect } from "next/navigation";

interface FormData {
  patientId: string;
  notes: string;
  diagnosis: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    respiratoryRate: string;
    oxygenSaturation: string;
    weight: string;
  };
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: string;
  }>;
  isPrescriptionSigned: boolean;
  labRequests: Array<{
    type: string;
    priority: string;
    laboratory: string;
  }>;
}

export async function createConsultation(_,formData: FormData) {
  if (!formData.patientId) {
    return { error: "Veuillez sélectionner un patient" };
  }

  const hasMedications = formData.medications.length > 0 && formData.medications.some(med => med.name.trim() !== "");
  if (hasMedications) {
    if (!formData.isPrescriptionSigned) {
      return { error: "Veuillez signer électroniquement l'ordonnance" };
    }
    const isValid = formData.medications.every((med) => med.name.trim() !== "");
    if (!isValid) {
      return { error: "Veuillez remplir au moins le nom de chaque médicament" };
    }
  }

  try {
    const backendData = transformToBackendFormat(formData);
    const result = await sendGraphQLMutation(CREATE_QUICK_CONSULTATION, {
      data: backendData,
    });

    if (!result.data.createOneConsultations) {
      throw new Error("Failed to create consultation");
    }

    redirect(`/doctor/patients/${formData.patientId}`);
  } catch (error) {
    console.error("Error creating consultation:", error);
    return { error: "Une erreur est survenue lors de l'enregistrement de la consultation" };
  }
}