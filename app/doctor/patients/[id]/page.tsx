import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_PATIENT_DETAILS } from "@/lib/graphql/doctor-queries"
import { PatientDetails } from "./patient-details"

// Define the patient type
type Patient = {
  _id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  email: string
  phone: string
  address: string
  bloodType: string
  allergies: string[]
  medicalHistory: string
  medications: string[]
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  profileImage: string
  lastConsultation: string
}

// Get patient details from the server
async function getPatientDetails(id: string) {
  try {
    const data = await executeGraphQLServer<{ patient: Patient }>(
      GET_PATIENT_DETAILS,
      { patientId: id },
      {
        revalidate: 60, // Use ISR with 1 minute revalidation
        tags: [`patient-${id}`],
      },
    )

    return data.patient
  } catch (error) {
    console.error("Error fetching patient details:", error)
    return null
  }
}

export default async function PatientDetailsPage({ params }: { params: { id: string } }) {
  const patient = await getPatientDetails(params.id)

  if (!patient) {
    notFound()
  }

  // Cette page afficherait normalement les données réelles du patient
  // Pour l'exemple, nous utilisons des données fictives
  // const patientId = params.id

  // // Données fictives du patient
  // const patient = {
  //   id: patientId,
  //   name: "Ahmed Ben Salem",
  //   birthDate: "15/05/1985",
  //   age: 38,
  //   bloodType: "A+",
  //   allergies: ["Pénicilline"],
  //   medicalHistory: [
  //     { condition: "Hypertension artérielle", since: "2018" },
  //     { condition: "Fracture du bras droit", since: "2015" },
  //   ],
  //   currentTreatments: [{ name: "Amlodipine", dosage: "5mg", frequency: "1 comprimé par jour" }],
  // }

  // Données fictives des segments médicaux par spécialité
  const medicalSegments = [
    {
      specialty: "Cardiologie",
      doctor: "Dr. Karim Malouli",
      lastVisit: "2023-03-15",
      notes: "Patient présentant une hypertension artérielle légère. Traitement par Amlodipine 5mg.",
      data: [
        { name: "Tension artérielle", value: "135/85 mmHg", date: "2023-03-15" },
        { name: "Fréquence cardiaque", value: "72 bpm", date: "2023-03-15" },
        { name: "Cholestérol total", value: "5.2 mmol/L", date: "2023-03-10" },
      ],
    },
    {
      specialty: "Dermatologie",
      doctor: "Dr. Sonia Ben Ali",
      lastVisit: "2023-02-10",
      notes: "Éruption cutanée sur l'avant-bras droit. Traitement par crème corticoïde.",
      data: [
        { name: "Type de lésion", value: "Érythème", date: "2023-02-10" },
        { name: "Localisation", value: "Avant-bras droit", date: "2023-02-10" },
        { name: "Évolution", value: "Amélioration après traitement", date: "2023-02-25" },
      ],
    },
    {
      specialty: "Médecine générale",
      doctor: "Dr. Mohamed Trabelsi",
      lastVisit: "2023-01-05",
      notes: "Symptômes grippaux avec fièvre légère. Traitement symptomatique prescrit.",
      data: [
        { name: "Température", value: "38.2°C", date: "2023-01-05" },
        { name: "Symptômes", value: "Toux, congestion nasale", date: "2023-01-05" },
        { name: "Durée des symptômes", value: "3 jours", date: "2023-01-05" },
      ],
    },
  ]

  // Simuler la spécialité du médecin connecté
  const currentDoctorSpecialty = "Cardiologie"
  const hasFullAccess = false // Simuler un accès limité

  // Filtrer les segments selon la spécialité du médecin connecté
  const accessibleSegments = hasFullAccess
    ? medicalSegments
    : medicalSegments.filter(
        (segment) => segment.specialty === currentDoctorSpecialty || segment.specialty === "Médecine générale",
      )

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/doctor/patients">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux patients
          </Link>
        </Button>
      </div>

      <PatientDetails patient={patient} />
    </div>
  )
}

