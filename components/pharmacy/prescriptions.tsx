import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Check } from "lucide-react"
import Link from "next/link"

// Exemple de données d'ordonnances
const pendingPrescriptions = [
  {
    id: 1,
    patient: "Ahmed Ben Salem",
    doctor: "Dr. Karim Malouli",
    date: "2023-03-20",
    medications: [
      { name: "Amlodipine", dosage: "5mg", quantity: 30 },
      { name: "Aspirine", dosage: "100mg", quantity: 30 },
    ],
    status: "pending",
    urgent: false,
  },
  {
    id: 2,
    patient: "Fatma Mansour",
    doctor: "Dr. Sonia Ben Ali",
    date: "2023-03-20",
    medications: [{ name: "Cortisone crème", dosage: "1%", quantity: 1 }],
    status: "pending",
    urgent: false,
  },
  {
    id: 3,
    patient: "Mohamed Khelifi",
    doctor: "Dr. Karim Malouli",
    date: "2023-03-19",
    medications: [
      { name: "Furosémide", dosage: "40mg", quantity: 30 },
      { name: "Potassium", dosage: "600mg", quantity: 30 },
    ],
    status: "pending",
    urgent: true,
  },
  {
    id: 4,
    patient: "Leila Brahimi",
    doctor: "Dr. Mohamed Trabelsi",
    date: "2023-03-19",
    medications: [{ name: "Ventoline", dosage: "100mcg", quantity: 1 }],
    status: "pending",
    urgent: false,
  },
  {
    id: 5,
    patient: "Karim Mejri",
    doctor: "Dr. Karim Malouli",
    date: "2023-03-18",
    medications: [
      { name: "Bisoprolol", dosage: "5mg", quantity: 30 },
      { name: "Atorvastatine", dosage: "20mg", quantity: 30 },
    ],
    status: "pending",
    urgent: true,
  },
]

export default function PharmacyPrescriptions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordonnances à traiter</CardTitle>
        <CardDescription>Liste des ordonnances en attente de délivrance</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Médecin</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Médicaments</TableHead>
              <TableHead>Urgence</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingPrescriptions.map((prescription) => (
              <TableRow key={prescription.id}>
                <TableCell className="font-medium">{prescription.patient}</TableCell>
                <TableCell>{prescription.doctor}</TableCell>
                <TableCell>{new Date(prescription.date).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {prescription.medications.map((med, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <FileText className="mr-1 h-3 w-3" />
                        {med.name} {med.dosage} (x{med.quantity})
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {prescription.urgent ? (
                    <Badge variant="destructive">Urgent</Badge>
                  ) : (
                    <Badge variant="outline">Normal</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/pharmacy/prescriptions/${prescription.id}`}>Détails</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/pharmacy/prescriptions/${prescription.id}/deliver`}>
                        <Check className="mr-2 h-4 w-4" />
                        Délivrer
                      </Link>
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

