"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

type Consultation = {
  _id: string
  date: string
  patient: {
    _id: string
    firstName: string
    lastName: string
    profileImage: string
  }
  diagnosis: string
}

type RecentConsultationsProps = {
  consultations: Consultation[]
}

export function RecentConsultations({ consultations }: RecentConsultationsProps) {
  const [displayCount, setDisplayCount] = useState(3)

  const sortedConsultations = [...consultations].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return dateB.getTime() - dateA.getTime() // Sort by most recent first
  })

  const displayedConsultations = sortedConsultations.slice(0, displayCount)

  const formatConsultationDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return format(date, "d MMMM yyyy", { locale: fr })
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Consultations récentes</CardTitle>
        <CardDescription>Vos dernières consultations avec les patients</CardDescription>
      </CardHeader>
      <CardContent>
        {displayedConsultations.length > 0 ? (
          <div className="space-y-4">
            {displayedConsultations.map((consultation) => (
              <div key={consultation._id} className="flex items-start space-x-4 rounded-md border p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={consultation.patient.profileImage || "/placeholder.svg?height=40&width=40"}
                    alt={`${consultation.patient.firstName} ${consultation.patient.lastName}`}
                  />
                  <AvatarFallback>
                    {consultation.patient.firstName[0]}
                    {consultation.patient.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    {consultation.patient.firstName} {consultation.patient.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatConsultationDate(consultation.date)}</p>
                  <p className="text-xs line-clamp-2">{consultation.diagnosis}</p>
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                    <Link href={`/doctor/consultations/${consultation._id}`}>Voir détails</Link>
                  </Button>
                </div>
              </div>
            ))}

            {sortedConsultations.length > displayCount && (
              <Button variant="ghost" className="w-full" onClick={() => setDisplayCount((prev) => prev + 3)}>
                Voir plus
              </Button>
            )}

            <Button asChild className="w-full mt-2">
              <Link href="/doctor/consultations">Toutes les consultations</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Aucune consultation récente</p>
            <Button asChild className="mt-4">
              <Link href="/doctor/quick-consultation">Nouvelle consultation</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

