"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText } from "lucide-react"
import Link from "next/link"
import { getPatientLabResults } from "@/actions/lab-results"
import { useToast } from "@/hooks/use-toast"

export default function PatientLabResults() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [labResults, setLabResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLabResults() {
      if (session?.user?.id) {
        try {
          const result = await getPatientLabResults(session.user.id)
          if (result.success) {
            setLabResults(result.data)
          } else {
            toast({
              title: "Erreur",
              description: result.message || "Impossible de charger les résultats d'analyses",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Erreur lors du chargement des résultats d'analyses:", error)
          toast({
            title: "Erreur",
            description: "Impossible de charger les résultats d'analyses",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchLabResults()
  }, [session, toast])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes résultats d'analyses</CardTitle>
          <CardDescription>Chargement des résultats...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mes résultats d'analyses</CardTitle>
        <CardDescription>Consultez vos résultats d'analyses médicales</CardDescription>
      </CardHeader>
      <CardContent>
        {labResults.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Aucun résultat d'analyse trouvé</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type d'analyse</TableHead>
                <TableHead>Laboratoire</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Médecin prescripteur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labResults.map((result) => (
                <TableRow key={result._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      {result.type}
                    </div>
                  </TableCell>
                  <TableCell>
                    {result.laboratory.firstName} {result.laboratory.lastName}
                  </TableCell>
                  <TableCell>{new Date(result.completionDate).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    {result.doctor.firstName} {result.doctor.lastName}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        result.status === "normal"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                      }`}
                    >
                      {result.status === "normal" ? "Normal" : "Anormal"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/patient/lab-results/${result._id}`}>Détails</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

