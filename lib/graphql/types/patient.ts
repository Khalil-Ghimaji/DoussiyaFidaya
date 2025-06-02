export type PatientHistory = {
  patientConsultations: {
    id: string
    date: string
    notes: string
    doctor: {
      id: string
      firstName: string
      lastName: string
      speciality: string
    }
  }[]
  patientPrescriptions: {
    id: string
    date: string
    medications: {
      name: string
      dosage: string
      frequency: string
      duration: string
    }[]
    doctor: {
      firstName: string
      lastName: string
    }
  }[]
  patientLabResults: {
    id: string
    date: string
    type: string
    status: string
    resultSummary: string
  }[]
}

export type Patient = {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  profileImage: string
}

export type PatientExtended = Patient & {
    bloodType?: string
    allergies?: string[]
    phone?: string
    address?: string
    email?: string
}

export function adaptToPatient(response: { patient?: any } | undefined): Partial<PatientExtended> | null {
  const patient = response?.patient
  if (!patient) return null
  const medicalRecord = patient.GeneralMedicalRecords_GeneralMedicalRecords_patient_idTopatients ?? {}

  return {
    id: patient.id,
    firstName: patient.users.first_name,
    lastName: patient.users.last_name,
    dateOfBirth: patient.date_of_birth,
    phone: patient.users.phone ?? undefined,
    address: patient.users.address ?? undefined,
    email: patient.users.email ?? undefined,
    gender: patient.gender,
    profileImage: "", // You can fill this if available
    bloodType: medicalRecord.bloodType ?? undefined,
    allergies: medicalRecord.allergies ?? [],
  }
}