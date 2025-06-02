// Transformers for quick consultation data

interface VitalSigns {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  weight?: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: string;
}

interface LabRequest {
  type: string;
  priority: string;
  laboratory?: string;
}

export interface QuickConsultationFormData {
  patientId: string;
  notes: string;
  diagnosis: string;
  vitalSigns: VitalSigns;
  medications: Medication[];
  isPrescriptionSigned: boolean;
  labRequests: LabRequest[];
}

export function transformToBackendFormat(formData: QuickConsultationFormData) {
  return {
    date: new Date(),
    notes: [formData.notes].filter(note => note.trim()),
    measures: {
      diagnosis: formData.diagnosis,
      vital_signs: {
        blood_pressure: formData.vitalSigns.bloodPressure,
        heart_rate: formData.vitalSigns.heartRate,
        temperature: formData.vitalSigns.temperature,
        respiratory_rate: formData.vitalSigns.respiratoryRate,
        oxygen_saturation: formData.vitalSigns.oxygenSaturation,
        weight: formData.vitalSigns.weight
      }
    },
    patients: {
      connect: {
        id: formData.patientId
      }
    },
    prescriptions: formData.medications.length > 0 ? {
      create: {
        date: new Date(),
        is_signed: formData.isPrescriptionSigned,
        status: "pending",
        patients: {
          connect: {
            id: formData.patientId
          }
        },
        medications: {
          createMany: {
            data: formData.medications.map(med => ({
              name: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration,
              quantity: med.quantity
            }))
          }
        }
      }
    } : undefined,
    lab_requests: formData.labRequests.length > 0 ? {
      createMany: {
        data: formData.labRequests.map(req => ({
          type: req.type,
          priority: req.priority,
          description: "",
          status: "pending",
          patients: {
            connect: {
              id: formData.patientId
            }
          }
        }))
      }
    } : undefined
  };
} 