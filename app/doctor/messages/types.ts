// types.ts

export interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  email: string; // From users table
  phone: string; // From users table
  specialty: string;
  type: string; // Generalist, Specialist etc. (from doctors_type_enum)
  is_license_verified: boolean;
  bio?: string;
  education?: string[]; // Note: Prisma schema shows String[], not sure if backend maps to this
  experience?: string[]; // Same as education
  languages?: string[];  // Same as education
  profile_image?: string;
  user_id: string;
  isOnline?: boolean;
}

// Updated PatientInfo - **ASSUMES BACKEND WILL BE UPDATED TO PROVIDE THESE DETAILS**
// If backend searchPatients remains limited, this type needs to be simpler for those results.
export interface PatientInfo {
  id: string; // patient.id
  cin: number; // From patients table
  firstName?: string; // From related users table (via patients.user_id)
  lastName?: string;  // From related users table
  name: string; // A display name, can be constructed e.g., `${firstName} ${lastName}` or `Patient CIN: ...`
  dateOfBirth: string; // From patients table (DateTime)
  gender: string; // From patients table (patients_gender_enum)
  email?: string; // From related users table
  phone?: string; // From related users table
  profile_image?: string; // From patients table
}

// For data sent to backend when creating message with new attachments
export interface AttachmentDto {
  filename: string;
  path: string; // S3 key or path returned by upload endpoint
  mimeType: string;
  size: string; // Prisma schema has Int for MessageAttachment.size, DTO has string. Align if possible.
}

// For displaying received message attachments (after URLs are signed etc.)
export interface MessageAttachment {
  id: string;
  url: string; // Signed URL for access
  filename: string;
  mimeType: string;
  size: string; // or number
}

export interface Message {
  id: string;
  content: string;
  senderId: string; // Doctor ID (from doctors table)
  receiverId: string; // Doctor ID (from doctors table)
  patientId: string; // Patient ID (from patients table)
  timestamp: string; // createdAt from Prisma (DateTime)
  isRead: boolean;
  attachments?: MessageAttachment[];
  sender?: Doctor; // Optional: populated for display convenience
  receiver?: Doctor; // Optional: populated for display convenience
  patient?: PatientInfo; // Optional: populated for context
}

export interface DoctorCentricConversation {
  id: string; // Unique ID for this conversation context (e.g., backend-generated or composite key like patientId_otherDoctorId)
  currentDoctorId: string; // The logged-in doctor
  partnerDoctor: Doctor;
  patient: PatientInfo; // Context patient for this specific doctor-doctor conversation
  lastMessage?: Message;
  unreadCount: number;
}

export interface PatientCentricConversation {
  // Represents all communication the logged-in doctor has, grouped by patient.
  patient: PatientInfo; // The patient these conversations are about
  // List of doctors the current logged-in doctor has talked to *about this specific patient*.
  // Each item implies a specific DoctorCentricConversation can be derived/loaded.
  doctors: Doctor[];
  lastMessage?: Message; // The absolute last message concerning this patient involving the logged-in doctor
  unreadCount: number; // Total unread messages for this patient across all relevant conversations for the logged-in doctor
}

export interface TypingIndicatorPayload {
  senderId: string;    // Doctor who is typing
  receiverId: string;  // Doctor who should see the indicator
  patientId: string;   // Patient context of the conversation
  isTyping: boolean;
}

export interface ChatStatistics {
  totalConversations: number;
  unreadMessages: number;
  activePatients: number;
  totalMessages: number;
}