export interface Users {
  id: string;
  address: string;
  created_at: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  password: string;
  salt: string;
  last_login: string | null;
  phone: string;
  profile_picture: string | null;
  role: "Patient" | "Doctor";
  associated_id: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  cin: number;
  date_of_birth: string;
  gender: string;
  profile_image: string | null;
  general_medical_record_id: string | null;
  user_id: string;
  users: Users;
  name?: string;
  firstName?: string;
  lastName?: string;
}

export interface Doctor {
  id: string;
  type: string;
  is_license_verified: boolean;
  bio: string | null;
  education: any[];
  experience: any[];
  first_name: string;
  languages: any[];
  last_name: string;
  profile_image: string | null;
  specialty: string;
  user_id: string;
  users: Users;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  isLicenseVerified?: boolean;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  patientId: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  attachments: Array<{
    id: string;
    filename: string;
    path: string;
    mimeType: string;
    size: string;
  }>;
  sender?: Doctor;
  receiver?: Doctor;
}

export interface Conversation {
  patientId: string;
  doctorReceiverId: string;
  patient: Patient;
  receiver: Doctor;
  lastMessage?: Message;
  unreadCount: number;
  totalMessages: number;
}

export interface PatientOld {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
}

export interface DoctorOld {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  specialty: string;
}

export interface SendMessageData {
  content: string;
  receiverId: string;
  patientId: string;
  attachments?: File[];
} 