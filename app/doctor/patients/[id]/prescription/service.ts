export class PrescriptionOCRService {
  private static instance: PrescriptionOCRService;
  private API_URL = 'http://192.168.1.22:8000';

  private constructor() {}

  public static getInstance(): PrescriptionOCRService {
    if (!PrescriptionOCRService.instance) {
      PrescriptionOCRService.instance = new PrescriptionOCRService();
    }
    return PrescriptionOCRService.instance;
  }

  async uploadAndExtractPrescription(file: File): Promise<{ medications: any[]; instructions: string }> {
    console.log('🚀 Début de uploadAndExtractPrescription');
    console.log('📁 Fichier reçu:', file.name, 'Taille:', file.size, 'Type:', file.type);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      console.log('📦 FormData créé avec le fichier');

      console.log('🌐 Envoi de la requête à:', `${this.API_URL}/upload-prescription`);
      const response = await fetch(`${this.API_URL}/upload-prescription`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit'
      });

      console.log('📥 Réponse reçue - Status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ Erreur HTTP:', response.status, errorData);
        throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📄 Données reçues du serveur:', data);

      // Adapter la réponse du backend au format attendu par le frontend
      const processedData = {
        medications: (data.medicaments || []).map((med: any) => ({
          name: med.nom || '',
          dosage: med.dosage || '',
          frequency: med.posologie || '',
          duration: med.duree || 'À préciser par le pharmacien',
          quantity: med.quantite || 1
        })),
        instructions: data.instructions_generales || ''
      };

      console.log('✅ Données traitées:', processedData);
      return processedData;
    } catch (error) {
      console.error('❌ Erreur dans uploadAndExtractPrescription:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to process prescription: ${error.message}`);
      }
      throw new Error('Failed to process prescription. Please try again.');
    }
  }
}

export const prescriptionOCRService = PrescriptionOCRService.getInstance(); 