"use server"

import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { fetchGraphQL } from '@/lib/graphql/client'
import { revalidatePath } from 'next/cache'

// Mutation corrigée avec les bons types
const CREATE_PRESCRIPTION = `
  mutation CreatePrescription(
    $patientId: String!
    $medications: [MedicationsCreateWithoutPrescriptionsInput!]!
    $instructions: String
    $date: DateTimeISO!
  ) {
    createOnePrescriptions(
      data: {
        date: $date
        is_signed: false
        status: Pending
        patients: { connect: { id: $patientId } }
        medications: { create: $medications }
        instructions: $instructions
      }
    ) {
      id
      updated_at
      instructions
      medications {
        name
        dosage
        frequency
        duration
        quantity
      }
    }
  }
`;

// Interface pour la réponse
interface CreatePrescriptionResult {
  success: boolean;
  message?: string;
  data?: any;
  redirectUrl?: string;
}

function parseDate(dateStr: string): string {
  try {
    // Essayer de parser la date au format "DD MMMM YYYY"
    const months: { [key: string]: string } = {
      'Janvier': '01', 'Février': '02', 'Mars': '03', 'Avril': '04',
      'Mai': '05', 'Juin': '06', 'Juillet': '07', 'Août': '08',
      'Septembre': '09', 'Octobre': '10', 'Novembre': '11', 'Décembre': '12'
    };

    const parts = dateStr.split(' ');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = months[parts[1]];
      const year = parts[2];
      
      if (month) {
        return `${year}-${month}-${day}T00:00:00.000Z`;
      }
    }
    
    // Si le parsing échoue, retourner la date actuelle
    return new Date().toISOString();
  } catch (error) {
    console.warn('Erreur lors du parsing de la date:', error);
    return new Date().toISOString();
  }
}

function transformFormDataToMedications(formData: FormData): any[] {
  const medications: any[] = [];
  let index = 0;

  while (formData.has(`medications.${index}.name`)) {
    const name = formData.get(`medications.${index}.name`) as string;
    const dosage = formData.get(`medications.${index}.dosage`) as string;
    const frequency = formData.get(`medications.${index}.frequency`) as string;
    const duration = formData.get(`medications.${index}.duration`) as string;
    const quantityStr = formData.get(`medications.${index}.quantity`) as string;

    // Validation des champs obligatoires
    if (!name?.trim() || !dosage?.trim() || !frequency?.trim()) {
      console.warn(`Medication ${index} has missing required fields, skipping`);
      index++;
      continue;
    }

    // Valeurs par défaut pour duree et quantite
    const defaultDuration = "À préciser par le pharmacien";
    const defaultQuantity = 1;

    medications.push({
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration?.trim() || defaultDuration,
      quantity: quantityStr ? parseInt(quantityStr) : defaultQuantity
    });
    index++;
  }

  return medications;
}

export async function createPrescriptionAction(
    patientId: string,
    formData: FormData
): Promise<CreatePrescriptionResult> {
  try {
    console.log('🚀 Début de création de prescription pour patient:', patientId);

    const medications = transformFormDataToMedications(formData);
    const instructions = (formData.get('instructions') as string)?.trim() || '';
    
    // Récupérer la date de consultation du JSON OCR si elle existe
    const ocrData = formData.get('ocrData') as string;
    let prescriptionDate = new Date().toISOString();
    
    if (ocrData) {
      try {
        const parsedOcrData = JSON.parse(ocrData);
        if (parsedOcrData.date) {
          prescriptionDate = parseDate(parsedOcrData.date);
          console.log('📅 Date de consultation trouvée:', parsedOcrData.date, '->', prescriptionDate);
        }
      } catch (error) {
        console.warn('Erreur lors du parsing des données OCR:', error);
      }
    }

    // Validation
    if (medications.length === 0) {
      return {
        success: false,
        message: "Aucun médicament valide trouvé"
      };
    }

    console.log('📝 Données formatées:', {
      patientId,
      medications,
      instructions,
      prescriptionDate,
      medicationsCount: medications.length
    });

    // Test de la structure des données avant l'envoi
    medications.forEach((med, idx) => {
      console.log(`Medication ${idx + 1}:`, {
        name: typeof med.name,
        dosage: typeof med.dosage,
        frequency: typeof med.frequency,
        duration: typeof med.duration,
        quantity: typeof med.quantity,
        quantityValue: med.quantity
      });
    });

    const result = await fetchGraphQL(CREATE_PRESCRIPTION, {
      patientId,
      medications,
      instructions,
      date: prescriptionDate
    });

    console.log('✅ Prescription créée avec succès:', result);

    // Invalidation du cache
    revalidateTag("prescriptions");
    revalidateTag(`patient-${patientId}`);
    revalidatePath(`/doctor/patients/${patientId}`);

    return {
      success: true,
      data: result,
      redirectUrl: `/doctor/patients/${patientId}`
    };

  } catch (error) {
    console.error('❌ Erreur détaillée lors de la création:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined
    });

    return {
      success: false,
      message: error instanceof Error ? error.message : "Une erreur inattendue est survenue"
    };
  }
}

// Version alternative si le problème persiste - avec une mutation plus simple
const CREATE_PRESCRIPTION_SIMPLE = `
  mutation CreatePrescriptionSimple(
    $patientId: String!
    $medicationName: String!
    $medicationDosage: String!
    $medicationFrequency: String!
    $medicationDuration: String!
    $medicationQuantity: Int!
    $instructions: String
  ) {
    createOnePrescriptions(
      data: {
        date: "2024-03-20T00:00:00.000Z"
        is_signed: false
        status: Pending
        patients: { connect: { id: $patientId } }
        medications: { 
          create: [{
            name: $medicationName
            dosage: $medicationDosage
            frequency: $medicationFrequency
            duration: $medicationDuration
            quantity: $medicationQuantity
          }]
        }
        instructions: $instructions
      }
    ) {
      id
      updated_at
      instructions
    }
  }
`;

// Fonction de test avec un seul médicament
export async function createPrescriptionSimpleTest(
    patientId: string,
    formData: FormData
): Promise<CreatePrescriptionResult> {
  try {
    const medications = transformFormDataToMedications(formData);
    if (medications.length === 0) {
      return { success: false, message: "Aucun médicament" };
    }

    const firstMed = medications[0];
    const instructions = (formData.get('instructions') as string)?.trim() || '';

    console.log('🧪 Test avec un seul médicament:', firstMed);

    const result = await fetchGraphQL(CREATE_PRESCRIPTION_SIMPLE, {
      patientId,
      medicationName: firstMed.name,
      medicationDosage: firstMed.dosage,
      medicationFrequency: firstMed.frequency,
      medicationDuration: firstMed.duration,
      medicationQuantity: firstMed.quantity,
      instructions
    });

    console.log('✅ Test réussi:', result);
    return { success: true, data: result };

  } catch (error) {
    console.error('❌ Test échoué:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur de test"
    };
  }
}