"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText } from "lucide-react"
import { getPatientPrescriptions } from "@/actions/prescriptions"
import { useToast } from "@/hooks/use-toast"

export default function PatientPrescriptions() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrescriptions() {
      if (session?.user?.id) {
        try {
          const result = await getPatientPrescriptions(session.user.id)
          if (result.success) {
            setPrescriptions(result.data)
          } else {
            toast({
              title: "Erreur",
              description: result.message || "Impossible de charger les ordonnances",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Erreur lors du chargement des ordonnances:", error)
          toast({
            title: "Erreur",
            description: "Impossible de charger les ordonnances",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
    }

    fetchPrescriptions()
  }, [session, toast])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mes ordonnances</CardTitle>
          <CardDescription>Chargement des ordonnances...</CardDescription>
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
        <CardTitle>Mes ordonnances</CardTitle>
        <CardDescription>Consultez vos ordonnances médicales</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {prescriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucune ordonnance trouvée</div>
          ) : (
            prescriptions.map((prescription) => (
              <div key={prescription._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Ordonnance du {new Date(prescription.date).toLocaleDateString("fr-FR")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {prescription.doctor.firstName} {prescription.doctor.lastName} - {prescription.doctor.speciality}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs mr-2 ${
                        prescription.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                      }`}
                    >
                      {prescription.status === "active" ? "Active" : "Expirée"}
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Médicament</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Fréquence</TableHead>
                      <TableHead>Durée</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescription.medications.map((medication, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{medication.name}</TableCell>
                        <TableCell>{medication.dosage}</TableCell>
                        <TableCell>{medication.frequency}</TableCell>
                        <TableCell>{medication.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

