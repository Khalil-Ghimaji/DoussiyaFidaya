export interface Specialist {
  specialite: string;
  raison: string;
  nom_medecin?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ChatResponse {
  reassurance: string;
  specialite_identifiee: string | null;
  conseils_generaux: string[];
  specialistes_recommandes: Specialist[];
  message_final: string;
}

export interface ChatRequest {
  user_prompt: string;
} 