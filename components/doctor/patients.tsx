import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Exemple de données de patients
const recentPatients = [
  {
    id: 1,
    name: "Ahmed Ben Salem",
    avatar: "/placeholder.svg",
    initials: "AS",
    age: 38,
    lastVisit: "2023-03-15",
    condition: "Hypertension",
    status: "stable",
  },
  {
    id: 2,
    name: "Fatma Mansour",
    avatar: "/placeholder.svg",
    initials: "FM",
    age: 45,
    lastVisit: "2023-03-10",
    condition: "Diabète type 2",
    status: "monitoring",
  },
  {
    id: 3,
    name: "Mohamed Khelifi",
    avatar: "/placeholder.svg",
    initials: "MK",
    age: 52,
    lastVisit: "2023-03-05",
    condition: "Arythmie cardiaque",
    status: "critical",
  },
  {
    id: 4,
    name: "Leila Brahimi",
    avatar: "/placeholder.svg",
    initials: "LB",
    age: 29,
    lastVisit: "2023-02-28",
    condition: "Asthme",
    status: "stable",
  },
  {
    id: 5,
    name: "Karim Mejri",
    avatar: "/placeholder.svg",
    initials: "KM",
    age: 61,
    lastVisit: "2023-02-20",
    condition: "Insuffisance cardiaque",
    status: "monitoring",
  },
]

export default function DoctorPatients() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Patients récents</CardTitle>
          <CardDescription>Liste des patients récemment consultés</CardDescription>
        </div>
        <Button size="sm" asChild>
          <Link href="/doctor/patients">Voir tous</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Âge</TableHead>
              <TableHead>Dernière visite</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={patient.avatar} alt={patient.name} />
                      <AvatarFallback>{patient.initials}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{patient.name}</div>
                  </div>
                </TableCell>
                <TableCell>{patient.age} ans</TableCell>
                <TableCell>{new Date(patient.lastVisit).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>{patient.condition}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      patient.status === "stable"
                        ? "outline"
                        : patient.status === "monitoring"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {patient.status === "stable"
                      ? "Stable"
                      : patient.status === "monitoring"
                        ? "Surveillance"
                        : "Critique"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/doctor/patients/${patient.id}`}>Dossier</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/doctor/patients/${patient.id}/consultation`}>Nouvelle consultation</Link>
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

