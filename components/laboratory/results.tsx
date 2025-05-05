import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, FileText } from "lucide-react"
import Link from "next/link"

// Exemple de données de résultats d'analyses
const recentResults = [
  {
    id: 1,
    patient: "Ahmed Ben Salem",
    doctor: "Dr. Karim Malouli",
    type: "Analyse sanguine",
    completionDate: "2023-03-15",
    status: "normal",
    viewed: true,
  },
  {
    id: 2,
    patient: "Fatma Mansour",
    doctor: "Dr. Sonia Ben Ali",
    type: "Test d'allergie",
    completionDate: "2023-03-12",
    status: "abnormal",
    viewed: true,
  },
  {
    id: 3,
    patient: "Mohamed Khelifi",
    doctor: "Dr. Karim Malouli",
    type: "Électrocardiogramme",
    completionDate: "2023-03-10",
    status: "abnormal",
    viewed: false,
  },
  {
    id: 4,
    patient: "Leila Brahimi",
    doctor: "Dr. Mohamed Trabelsi",
    type: "Analyse d'urine",
    completionDate: "2023-03-08",
    status: "normal",
    viewed: true,
  },
  {
    id: 5,
    patient: "Karim Mejri",
    doctor: "Dr. Karim Malouli",
    type: "Radiographie thoracique",
    completionDate: "2023-03-05",
    status: "normal",
    viewed: false,
  },
]

export default function LaboratoryResults() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Résultats récents</CardTitle>
        <CardDescription>Liste des analyses récemment complétées</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Médecin</TableHead>
              <TableHead>Type d'analyse</TableHead>
              <TableHead>Date de complétion</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Consulté</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell className="font-medium">{result.patient}</TableCell>
                <TableCell>{result.doctor}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    {result.type}
                  </div>
                </TableCell>
                <TableCell>{new Date(result.completionDate).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <Badge variant={result.status === "normal" ? "outline" : "destructive"}>
                    {result.status === "normal" ? "Normal" : "Anormal"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {result.viewed ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    >
                      Oui
                    </Badge>
                  ) : (
                    <Badge variant="outline">Non</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/laboratory/results/${result.id}/download`}>
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          PDF
                        </>
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/laboratory/results/${result.id}`}>Détails</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

