'use client'

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, Printer, Share2, MessageSquare, Calendar, Building, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type LabResult = {
  _id: string
  date: string
  type: string
  status: string
  requestDate: string
  completionDate: string | null
  result: string | null
  patient: {
    _id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    profileImage: string | null
  }
  laboratory: {
    name: string
    address: string
    phone: string
  }
}

type LabResultDetailsProps = {
  labResult: LabResult
}

export function LabResultDetails({ labResult }: LabResultDetailsProps) {
  const [activeTab, setActiveTab] = useState("results")
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const { toast } = useToast()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return format(date, "d MMMM yyyy", { locale: fr })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Complété</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            En attente
          </Badge>
        )
      case "in_progress":
        return <Badge className="bg-blue-500">En cours</Badge>
      case "cancelled":
        return <Badge variant="destructive">Annulé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handlePrint = () => {
    toast({
      title: "Impression en cours",
      description: "Le document est envoyé à l'imprimante.",
    })
    window.print()
  }

  const handleDownload = () => {
    toast({
      title: "Téléchargement en cours",
      description: "Le document sera téléchargé dans quelques instants.",
    })

    // Simulate download
    setTimeout(() => {
      const link = document.createElement("a")
      link.href = "#"
      link.download = `resultat_${labResult.type}_${labResult.patient.lastName}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, 1500)
  }

  const handleShare = (email: string) => {
    toast({
      title: "Partage réussi",
      description: `Le document a été partagé avec ${email}.`,
    })
    setIsShareDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Résultat d'analyse : {labResult.type}</CardTitle>
              <CardDescription>Effectué le {formatDate(labResult.date)}</CardDescription>
            </div>
            {getStatusBadge(labResult.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Patient</h3>
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={labResult.patient.profileImage || "/placeholder.svg?height=40&width=40"}
                      alt={`${labResult.patient.firstName} ${labResult.patient.lastName}`}
                    />
                    <AvatarFallback>
                      {labResult.patient.firstName[0]}
                      {labResult.patient.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {labResult.patient.firstName} {labResult.patient.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {labResult.patient.gender}, né(e) le {formatDate(labResult.patient.dateOfBirth)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Laboratoire</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{labResult.laboratory.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">Demandé le {formatDate(labResult.requestDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{labResult.laboratory.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Adresse</h3>
                <p className="text-sm">{labResult.laboratory.address}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Dates</h3>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Demande :</span> {formatDate(labResult.requestDate)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Réalisation :</span> {formatDate(labResult.date)}
                  </p>
                  {labResult.completionDate && (
                    <p className="text-sm">
                      <span className="font-medium">Validation :</span> {formatDate(labResult.completionDate)}
                    </p>
                  )}
                </div>
              </div>

             
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="results" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results">
            <FileText className="h-4 w-4 mr-2" />
            Résultats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-md">
                <p>{labResult.result || "Aucun résultat disponible"}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button asChild>
                <Link href={`/doctor/patients/${labResult.patient._id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Consulter le dossier patient
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Partager le résultat d'analyse</DialogTitle>
            <DialogDescription>Sélectionnez avec qui vous souhaitez partager ce document.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Partager avec un collègue</h3>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleShare("cardiologue@hopital.fr")}
                >
                  Dr. Sophie Martin (Cardiologie)
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleShare("pneumologue@hopital.fr")}
                >
                  Dr. Thomas Dubois (Pneumologie)
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => handleShare("neurologue@hopital.fr")}
                >
                  Dr. Camille Bernard (Neurologie)
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}