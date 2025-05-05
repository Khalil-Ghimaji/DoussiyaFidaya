"use client"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"

type Prescription = {
  id: string
  patientName: string
  doctorName: string
  medicationName: string
  status: string
  createdAt: string
}

interface PrescriptionsListProps {
  prescriptions: Prescription[]
}

export function PrescriptionsList({ prescriptions }: PrescriptionsListProps) {
  const router = useRouter()

  if (!prescriptions || prescriptions.length === 0) {
    return <div className="text-center py-8">No prescriptions found</div>
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Processing
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Delivered
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Medication</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions.map((prescription) => (
            <TableRow key={prescription.id}>
              <TableCell className="font-medium">{prescription.patientName}</TableCell>
              <TableCell>{prescription.doctorName}</TableCell>
              <TableCell>{prescription.medicationName}</TableCell>
              <TableCell>{getStatusBadge(prescription.status)}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(prescription.createdAt), { addSuffix: true })}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/pharmacy/prescriptions/${prescription.id}`)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

