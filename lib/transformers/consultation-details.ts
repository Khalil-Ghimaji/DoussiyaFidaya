export interface BackendConsultationDetails {
  id: string;
  date: string;
  notes: string[];
  measures: {
    diagnosis?: string;
    vital_signs?: {
      blood_pressure?: string;
      heart_rate?: string;
      temperature?: string;
      respiratory_rate?: string;
      oxygen_saturation?: string;
      weight?: string;
    };
    [key: string]: any;
  };
  prescriptions: {
    id: string;
    date: string;
    instructions: string;
    is_signed: boolean;
    status: string;
    medications: {
      id: string;
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      quantity: string;
    }[];
  };
  lab_requests: {
    id: string;
    type: string;
    priority: string;
    description: string;
  }[];
  patients: {
    id: string;
    users: {
      first_name: string;
      last_name: string;
    };
    date_of_birth: string;
    gender: string;
    GeneralMedicalRecords_GeneralMedicalRecords_patient_idTopatients: {
      bloodType: string;
    };
    profile_image: string;
  };
  doctors: {
    id: string;
    users: {
      first_name: string;
      last_name: string;
    };
    specialty: string;
  };
}

export interface FrontendConsultationDetails {
  _id: string;
  date: string;
  time: string;
  duration: number;
  reason: string;
  notes: string;
  diagnosis: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    respiratoryRate: string;
    oxygenSaturation: string;
    weight: string;
  };
  prescriptions: {
    _id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: string;
  }[];
  labRequests: {
    _id: string;
    type: string;
    priority: string;
    description: string;
  }[];
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    bloodType: string;
    profileImage: string;
  };
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
    speciality: string;
  };
}

export function transformConsultationDetails(backendConsultation: BackendConsultationDetails): FrontendConsultationDetails {
  const dateTime = new Date(backendConsultation.date);
  const informations = backendConsultation.notes.reduce((acc, item) => {
    const [key, value] = item.split(/:(.+)/); // Split only at the first colon
    acc[key.trim()] = value.trim();
    return acc;
  }, {});
  console.log("these are the converted object",informations)
  const { Motif, Diagnostic, ...notes } = informations;
  
  return {
    _id: backendConsultation.id,
    date: dateTime.toISOString().split('T')[0],
    time: dateTime.toTimeString().split(' ')[0],
    duration: 30, // Default duration
    reason: informations.Motif || '',
    notes: Object.entries(notes).map(([key, value]) => `${key}: ${value}`).join('\n') || '',
    diagnosis: informations.Diagnostic || '',
    createdBy: 'system', // Default value since it's not in the backend schema
    createdAt: new Date().toISOString(), // Default to current time since it's not in the backend schema
    updatedAt: new Date().toISOString(), // Default to current time since it's not in the backend schema
    vitalSigns: {
      bloodPressure: backendConsultation.measures?.vital_signs?.blood_pressure || '',
      heartRate: backendConsultation.measures?.vital_signs?.heart_rate || '',
      temperature: backendConsultation.measures?.vital_signs?.temperature || '',
      respiratoryRate: backendConsultation.measures?.vital_signs?.respiratory_rate || '',
      oxygenSaturation: backendConsultation.measures?.vital_signs?.oxygen_saturation || '',
      weight: backendConsultation.measures?.vital_signs?.weight || ''
    },
    prescriptions: backendConsultation.prescriptions ? backendConsultation.prescriptions.medications.map(medication => ({
      _id: medication.id,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      duration: medication.duration,
      quantity: medication.quantity
    })) : [],
    labRequests: backendConsultation.lab_requests.map(request => ({
      _id: request.id,
      type: request.type,
      priority: request.priority,
      description: request.description
    })),
    patient: {
      _id: backendConsultation.patients.id,
      firstName: backendConsultation.patients.users.first_name,
      lastName: backendConsultation.patients.users.last_name,
      dateOfBirth: backendConsultation.patients.date_of_birth,
      gender: backendConsultation.patients.gender,
      bloodType: backendConsultation.patients.GeneralMedicalRecords_GeneralMedicalRecords_patient_idTopatients.bloodType,
      profileImage: backendConsultation.patients.profile_image
    },
    doctor: {
      _id: backendConsultation.doctors.id,
      firstName: backendConsultation.doctors.users.first_name,
      lastName: backendConsultation.doctors.users.last_name,
      speciality: backendConsultation.doctors.specialty
    }
  };
} 