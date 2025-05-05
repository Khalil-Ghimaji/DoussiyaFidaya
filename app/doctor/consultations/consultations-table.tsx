"use client"

import { CalendarIcon, Clock } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Consultation } from "./page"

export function ConsultationsTable({ consultations }: { consultations: Consultation[] }) {
  // Define columns for the data table
  const columns: ColumnDef<Consultation>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.date)
        return (
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>{format(date, "dd/MM/yyyy")}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "time",
      header: "Heure",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.time}</span>
        </div>
      ),
    },
    {
      accessorKey: "patient",
      header: "Patient",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.patient.firstName} {row.original.patient.lastName}
        </div>
      ),
    },
    {
      accessorKey: "reason",
      header: "Motif",
      cell: ({ row }) => <div className="max-w-xs truncate">{row.original.reason}</div>,
    },
    {
      accessorKey: "diagnosis",
      header: "Diagnostic",
      cell: ({ row }) => <div className="max-w-xs truncate">{row.original.diagnosis}</div>,
    },
    {
      accessorKey: "documents",
      header: "Documents",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.hasPrescription && <Badge variant="secondary">Ordonnance</Badge>}
          {row.original.hasLabRequest && <Badge variant="secondary">Analyses</Badge>}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="text-right">
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/doctor/consultations/${row.original._id}`}>Voir</Link>
          </Button>
        </div>
      ),
    },
  ]

  return <DataTable columns={columns} data={consultations} />
}

