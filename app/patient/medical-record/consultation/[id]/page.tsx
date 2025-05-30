// app/patient/consultations/[id]/page.tsx
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getApolloServerClient } from "@/lib/apollo-server-client";
import { gql } from "@apollo/client";
import { notFound } from "next/navigation";
import { fetchGraphQL } from "@/lib/graphql-client"

const GET_CONSULTATION_DETAILS = gql`
  query GetConsultationDetails($id: String!) {
    findUniqueConsultations(where: { id: $id }) {
      id
      date
      section
      notes
      measures
      patients {
        id
        date_of_birth
        gender
        GeneralMedicalRecords_GeneralMedicalRecords_patient_idTopatients {
          bloodType
          weight
        }
      }
      doctors {
        first_name
        last_name
        specialty
      }
      prescriptions {
        id
        medications {
          id
          name
          dosage
          frequency
          duration
          quantity
        }
      }
      consultation_lab_requests {
        lab_requests {
          id
          type
          priority
          description
          lab_documents {
            id
            status
            laboratories {
              name
            }
            lab_results {
              id
            }
          }
        }
      }
    }
  }
`;

interface ConsultationData {
  findUniqueConsultations: {
    id: string;
    date: string;
    section: string;
    notes: string[];
    measures: any;
    patients: {
      id: string;
      date_of_birth: string;
      gender: string;
      GeneralMedicalRecords_GeneralMedicalRecords_patient_idTopatients: {
        bloodType: string;
        weight: number;
      };
    };
    doctors: {
      first_name: string;
      last_name: string;
      specialty: string;
    };
    prescriptions: {
      id: string;
      medications: {
        id: string;
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        quantity: number;
      }[];
    };
    consultation_lab_requests: {
      lab_requests: {
        id: string;
        type: string;
        priority: string;
        description: string;
        lab_documents: {
          id: string;
          status: string;
          laboratories: {
            name: string;
          };
          lab_results: {
            id: string;
          }[];
        }[];
      };
    }[];
  };
}

async function ConsultationDetailsContent({ consultationId }: { consultationId: string }) {
  try {
    const { data } = await fetchGraphQL<ConsultationData>(
    GET_CONSULTATION_DETAILS,
    { id: consultationId }
  );
    if (!data?.findUniqueConsultations) {
      notFound();
    }

    const consultation = data.findUniqueConsultations;
    const patient = consultation.patients;
    const doctor = consultation.doctors;
    const prescription = consultation.prescriptions;
    const labRequests = consultation.consultation_lab_requests;

    // Calculate age from date of birth
    const calculateAge = (birthDate: string) => {
      const today = new Date();
      const birthDateObj = new Date(birthDate);
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      return age;
    };

    // Format date and time
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("fr-FR");
    };

    const formatTime = (dateString: string) => {
      return new Date(dateString).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    };

    // Process lab requests data
    const processedLabRequests = labRequests.flatMap(lr => 
      lr.lab_requests.lab_documents.map(doc => ({
        id: lr.lab_requests.id,
        type: lr.lab_requests.type,
        priority: lr.lab_requests.priority,
        description: lr.lab_requests.description,
        laboratory: doc.laboratories?.name || "Unknown",
        status: doc.status,
        resultId: doc.lab_results[0]?.id || null
      }))
    );

    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/patient/medical-record">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au dossier médical
            </Link>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Détails de la consultation</h1>
            <p className="text-muted-foreground">
              {formatDate(consultation.date)} à {formatTime(consultation.date)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations du patient</CardTitle>
              <CardDescription>Détails du patient pour cette consultation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID Patient</p>
                  <p className="font-medium">{patient.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Âge</p>
                  <p>{calculateAge(patient.date_of_birth)} ans</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Genre</p>
                  <p>{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Groupe sanguin</p>
                  <p>{patient.GeneralMedicalRecords_GeneralMedicalRecords_patient_idTopatients.bloodType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Poids</p>
                  <p>{patient.GeneralMedicalRecords_GeneralMedicalRecords_patient_idTopatients.weight} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détails de la consultation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(consultation.date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{formatTime(consultation.date)}</span>
                </div>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    Dr. {doctor.first_name} {doctor.last_name} ({doctor.specialty})
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Motif</p>
                  <p>{consultation.section}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Notes de consultation</CardTitle>
            </CardHeader>
            <CardContent>
              {consultation.notes.length > 0 ? (
                <ul className="space-y-2">
                  {consultation.notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Aucune note disponible</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mesures</CardTitle>
            </CardHeader>
            <CardContent>
              {consultation.measures ? (
                <div className="grid grid-cols-2 gap-4">
                 {Object.entries(consultation.measures).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm font-medium text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p>{String(value)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Aucune mesure enregistrée</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {prescription && (
            <Card>
              <CardHeader>
                <CardTitle>Ordonnance</CardTitle>
                <CardDescription>Prescription #{prescription.id}</CardDescription>
              </CardHeader>
              <CardContent>
                {prescription.medications.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Médicament</th>
                        <th className="text-left py-2">Dosage</th>
                        <th className="text-left py-2">Fréquence</th>
                        <th className="text-left py-2">Durée</th>
                        <th className="text-left py-2">Quantité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescription.medications.map((medication) => (
                        <tr key={medication.id} className="border-b">
                          <td className="py-2">{medication.name}</td>
                          <td className="py-2">{medication.dosage}</td>
                          <td className="py-2">{medication.frequency}</td>
                          <td className="py-2">{medication.duration}</td>
                          <td className="py-2">{medication.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-muted-foreground">Aucun médicament prescrit</p>
                )}
              </CardContent>
            </Card>
          )}

          {processedLabRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Demandes d'analyses</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Description</th>
                      <th className="text-left py-2">Priorité</th>
                      <th className="text-left py-2">Laboratoire</th>
                      <th className="text-left py-2">Statut</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedLabRequests.map((request) => (
                      <tr key={request.id} className="border-b">
                        <td className="py-2">{request.type}</td>
                        <td className="py-2">{request.description}</td>
                        <td className="py-2">
                          <Badge
                            variant={
                              request.priority === "high"
                                ? "destructive"
                                : request.priority === "medium"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {request.priority === "high"
                              ? "Haute"
                              : request.priority === "medium"
                              ? "Moyenne"
                              : "Basse"}
                          </Badge>
                        </td>
                        <td className="py-2">{request.laboratory}</td>
                        <td className="py-2">
                          <Badge
                            variant={
                              request.status === "completed"
                                ? "default"
                                : request.status === "pending"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {request.status === "completed"
                              ? "Terminé"
                              : request.status === "pending"
                              ? "En attente"
                              : "En cours"}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {request.resultId && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/patient/lab-results/${request.resultId}`}>
                                Voir résultats 
                              </Link>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching consultation details:", error);
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/patient/medical-record">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au dossier médical
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Une erreur est survenue</h3>
              <p className="text-muted-foreground">Impossible de charger les détails de la consultation</p>
              <Button className="mt-4" asChild>
                <Link href="/patient/medical-record">Retour au dossier médical</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }
}

export default async function ConsultationDetailsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement des détails de la consultation...</p>
            </div>
          </div>
        }
      >
        <ConsultationDetailsContent consultationId={params.id} />
      </Suspense>
    </div>
  );
}