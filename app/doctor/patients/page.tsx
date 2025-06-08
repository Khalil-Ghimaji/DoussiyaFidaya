import { Suspense } from "react"
import { ArrowLeft, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { executeGraphQLServer } from "@/lib/graphql-server"
import { GET_DOCTOR_PATIENTS } from "@/lib/graphql/queriesV2/doctor"
import { auth } from "@/lib/auth"
import { PatientsFilters } from "./patients-filters"
import { fetchGraphQL } from "@/lib/graphql-client"
import { cookies } from "next/headers"

interface UserResponse {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string;
  profile_picture: string | null;
}

interface PatientResponse {
  users: UserResponse;
  date_of_birth: string;
  gender: string;
}

interface ConsultationResponse {
  date: string;
  patient_id: string;
  patients: PatientResponse;
}

interface GraphQLResponse {
  docPatients: ConsultationResponse[];
}

interface Patient {
  _id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  email: string
  phone: string
  address: string
  profileImage: string
  lastConsultation: string
}

const formatPatientData = (data: GraphQLResponse): Patient[] => {
  return data.docPatients.map((consultation) => {
    const user = consultation.patients.users;

    return {
      _id: consultation.patient_id,
      firstName: user.first_name,
      lastName: user.last_name,
      dateOfBirth: consultation.patients.date_of_birth,
      gender: consultation.patients.gender,
      email: user.email,
      phone: user.phone ?? '',
      address: user.address,
      profileImage: user.profile_picture ?? '',
      lastConsultation: consultation.date,
    };
  });
};


// Get patients from the server
async function getDoctorPatients() {
  /*
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("User not authenticated")
    }
  */

  try {
    const storedSession = await cookies();
    const docID = storedSession.get("associatedId")?.value;
    const { data } = await fetchGraphQL<GraphQLResponse>(
      GET_DOCTOR_PATIENTS,
      { docId: docID, take: 10, skip: 0 }
    );

    return formatPatientData(data);
  } catch (error) {
    console.error("Error fetching doctor patients:", error)
    return []
  }
}

export default async function PatientsPage() {
  const patients = await getDoctorPatients()

  return (
    <div className="container py-8">
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/doctor/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Gérez vos patients et leurs dossiers médicaux</p>
        </div>
        
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Chargement des patients...</p>
            </div>
          </div>
        }
      >
        <PatientsFilters initialPatients={patients} />
      </Suspense>
    </div>
  )
}

