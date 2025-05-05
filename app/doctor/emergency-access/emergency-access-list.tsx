"use client"

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
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type EmergencyAccessRequest = {
  _id: string
  date: string
  status: string
  reason: string
  requestedBy: {
    _id: string
    firstName: string
    lastName: string
    speciality: string
    hospital: string
    profileImage: string
  }
  patient: {
    _id: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    profileImage: string
  }
}

type EmergencyAccessListProps = {
  initialRequests: EmergencyAccessRequest[]
}

export function EmergencyAccessList({ initialRequests }: EmergencyAccessListProps) {
  const [requests, setRequests] = useState(initialRequests)
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedRequest, setSelectedRequest] = useState<EmergencyAccessRequest | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const pendingRequests = requests.filter((req) => req.status === "pending")
  const approvedRequests = requests.filter((req) => req.status === "approved")
  const rejectedRequests = requests.filter((req) => req.status === "rejected")

  const formatRequestDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return format(date, "d MMMM yyyy à HH:mm", { locale: fr })
  }

  const handleApprove = async (requestId: string) => {
    setIsApproving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      setRequests((prev) => prev.map((req) => (req._id === requestId ? { ...req, status: "approved" } : req)))

      toast({
        title: "Accès approuvé",
        description: "L'accès d'urgence a été accordé avec succès.",
        variant: "default",
      })

      setActiveTab("approved")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsApproving(false)
      setIsDialogOpen(false)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!rejectReason.trim()) {
      toast({
        title: "Motif requis",
        description: "Veuillez indiquer un motif de refus.",
        variant: "destructive",
      })
      return
    }

    setIsRejecting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update local state
      setRequests((prev) => prev.map((req) => (req._id === requestId ? { ...req, status: "rejected" } : req)))

      toast({
        title: "Accès refusé",
        description: "L'accès d'urgence a été refusé.",
        variant: "default",
      })

      setActiveTab("rejected")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
      setRejectReason("")
      setIsDialogOpen(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            En attente
          </Badge>
        )
      case "approved":
        return <Badge className="bg-green-500">Approuvé</Badge>
      case "rejected":
        return <Badge variant="destructive">Refusé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const renderRequestCard = (request: EmergencyAccessRequest) => (
    <Card key={request._id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={request.requestedBy.profileImage || "/placeholder.svg?height=40&width=40"}
                alt={`${request.requestedBy.firstName} ${request.requestedBy.lastName}`}
              />
              <AvatarFallback>
                {request.requestedBy.firstName[0]}
                {request.requestedBy.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                Dr. {request.requestedBy.firstName} {request.requestedBy.lastName}
              </CardTitle>
              <CardDescription>
                {request.requestedBy.speciality} - {request.requestedBy.hospital}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Demandé le {formatRequestDate(request.date)}</span>
          </div>

          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-1">Motif de la demande :</p>
            <p className="text-sm">{request.reason}</p>
          </div>

          <div className="p-3 border rounded-md">
            <p className="text-sm font-medium mb-1">Patient concerné :</p>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={request.patient.profileImage || "/placeholder.svg?height=24&width=24"}
                  alt={`${request.patient.firstName} ${request.patient.lastName}`}
                />
                <AvatarFallback className="text-xs">
                  {request.patient.firstName[0]}
                  {request.patient.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">
                {request.patient.firstName} {request.patient.lastName} ({request.patient.gender}, né(e) le{" "}
                {request.patient.dateOfBirth})
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      {request.status === "pending" && (
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedRequest(request)
              setIsDialogOpen(true)
            }}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Refuser
          </Button>
          <Button onClick={() => handleApprove(request._id)} disabled={isApproving}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approuver
          </Button>
        </CardFooter>
      )}
    </Card>
  )

  return (
    <>
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex gap-2">
            <Clock className="h-4 w-4" />
            En attente
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approuvés
          </TabsTrigger>
          <TabsTrigger value="rejected">
            <XCircle className="h-4 w-4 mr-2" />
            Refusés
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map(renderRequestCard)
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune demande d'accès en attente</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          {approvedRequests.length > 0 ? (
            approvedRequests.map(renderRequestCard)
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune demande d'accès approuvée</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          {rejectedRequests.length > 0 ? (
            rejectedRequests.map(renderRequestCard)
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune demande d'accès refusée</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser l'accès d'urgence</DialogTitle>
            <DialogDescription>
              Veuillez indiquer le motif du refus. Cette information sera communiquée au médecin demandeur.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Motif du refus..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isRejecting}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRequest && handleReject(selectedRequest._id)}
              disabled={isRejecting}
            >
              {isRejecting ? "Traitement..." : "Confirmer le refus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

