export interface BackendConsultation {
  id: string;
  date: string;
  notes: string[];
  measures: {
    diagnosis?: string;
    [key: string]: any;
  };
  patients: {
    id: string;
    users: {
      first_name: string;
      last_name: string;
    };
    date_of_birth: string;
    gender: string;
    profile_image: string;
  };
  prescriptions?: {
    id: string;
  };
  lab_requests: {
    id: string;
  }[];
}

export interface FrontendConsultation {
  _id: string;
  date: string;
  time: string;
  reason: string;
  diagnosis: string;
  hasPrescription: boolean;
  hasLabRequest: boolean;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    profileImage: string;
  };
}

export function transformConsultation(backendConsultation: BackendConsultation): FrontendConsultation {
  const dateTime = new Date(backendConsultation.date);
  
  return {
    _id: backendConsultation.id,
    date: dateTime.toISOString().split('T')[0],
    time: dateTime.toTimeString().split(' ')[0],
    reason: backendConsultation.notes[0] || '',
    diagnosis: backendConsultation.measures?.diagnosis || '',
    hasPrescription: !!backendConsultation.prescriptions,
    hasLabRequest: backendConsultation.lab_requests.length > 0,
    patient: {
      _id: backendConsultation.patients.id,
      firstName: backendConsultation.patients.users.first_name,
      lastName: backendConsultation.patients.users.last_name,
      dateOfBirth: backendConsultation.patients.date_of_birth,
      gender: backendConsultation.patients.gender,
      profileImage: backendConsultation.patients.profile_image
    }
  };
}

export function transformConsultations(backendConsultations: BackendConsultation[]): FrontendConsultation[] {
  return backendConsultations.map(transformConsultation);
} 