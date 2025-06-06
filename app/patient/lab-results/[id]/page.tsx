import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { fetchGraphQL } from "@/lib/graphql-client"
import { gql } from "@apollo/client"
import { notFound } from "next/navigation"

// Using ISR with a 5-minute revalidation period for lab results
export const revalidate = 300

const GET_PATIENT_ANALYSIS_DETAILS = gql`
  query GetPatientAnalysisDetails($labDocumentId: String!) {
    findUniqueLab_documents(where: { id: $labDocumentId }) {
      id
      requested_at
      status
      laboratories {
        name
      }
      lab_requests {
        doctors {
          first_name
          last_name
        }
        type
      }
      lab_results {
        id
        title
        result_type
        is_abnormal
      }
    }
  }
`

interface LabResult {
  id: string
  requested_at: string
  status: string
  laboratories: {
    name: string
  }
  lab_requests: {
    doctors: {
      first_name: string
      last_name: string
    }
    type: string
  }
  lab_results: Array<{
    id: string
    title: string
    result_type: string
    is_abnormal: boolean
  }>
}

async function LabResultDetailsContent({ resultId }: { resultId: string }) {
  try {
    const { data } = await fetchGraphQL<{ findUniqueLab_documents: LabResult }>(
      GET_PATIENT_ANALYSIS_DETAILS, 
      { labDocumentId: resultId }
    )

    if (!data?.findUniqueLab_documents) {
      notFound()
    }

    const analysis = data.findUniqueLab_documents
    const doctorName = `Dr. ${analysis.lab_requests.doctors.first_name} ${analysis.lab_requests.doctors.last_name}`

    // Transform the data to match your expected structure
    const transformedData = {
      labResult: {
        _id: analysis.id,
        completionDate: analysis.requested_at,
        type: analysis.lab_requests.type,
        laboratory: {
          name: analysis.laboratories.name
        },
        doctor: {
          firstName: analysis.lab_requests.doctors.first_name,
          lastName: analysis.lab_requests.doctors.last_name
        },
        status: analysis.status === "completed" ? "normal" : "pending", // Adjust based on your needs
        results: analysis.lab_results.map(result => ({
          name: result.title,
          value: "", // Not available in schema
          unit: "", // Not available in schema
          range: "", // Not available in schema
          status: result.is_abnormal ? "abnormal" : "normal"
        })),
        comments: "" // Not available in schema
      }
    }

    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/patient/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Détails de l'analyse</CardTitle>
                <CardDescription>
                  {transformedData.labResult.type} - {new Date(transformedData.labResult.completionDate).toLocaleDateString("fr-FR")}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Informations générales</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="font-medium">Laboratoire:</dt>
                    <dd>{transformedData.labResult.laboratory.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Médecin prescripteur:</dt>
                    <dd>{doctorName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Date:</dt>
                    <dd>{new Date(transformedData.labResult.completionDate).toLocaleDateString("fr-FR")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Statut:</dt>
                    <dd>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          transformedData.labResult.status === "normal"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                        }`}
                      >
                        {transformedData.labResult.status === "normal" ? "Normal" : "Anormal"}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Résultats</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Paramètre</th>
                      <th className="text-left py-2">Valeur</th>
                      <th className="text-left py-2">Référence</th>
                      <th className="text-left py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transformedData.labResult.results.map((result, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 capitalize">{result.name}</td>
                        <td className="py-2">
                          {result.value} {result.unit}
                        </td>
                        <td className="py-2">{result.range}</td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              result.status === "normal"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            }`}
                          >
                            {result.status === "normal" ? "Normal" : "Anormal"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Interprétation</h3>
              <p className="text-muted-foreground">
                {transformedData.labResult.comments || "Aucun commentaire n'a été fourni pour cette analyse."}
              </p>
            </div>
          </CardContent>
        </Card>
      </>
    )
  } catch (error) {
    console.error("Error fetching lab result details:", error)
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/patient/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Une erreur est survenue</h3>
              <p className="text-muted-foreground">Impossible de charger les résultats d'analyse</p>
              <Button className="mt-4" asChild>
                <Link href="/patient/dashboard">Retour au tableau de bord</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    )
  }
}

export default function LabResultDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-8">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Chargement des résultats d'analyse...</p>
            </div>
          </div>
        }
      >
        <LabResultDetailsContent resultId={params.id} />
      </Suspense>
    </div>
  )
}