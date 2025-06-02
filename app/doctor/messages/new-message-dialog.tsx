"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquarePlus, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDoctorPatients } from "@/hooks/use-doctor-patients"
import { useChat } from "@/hooks/use-chat"
import { toast } from "@/hooks/use-toast"

export function NewMessageDialog() {
  const [open, setOpen] = useState(false)
  const [messageContent, setMessageContent] = useState("")
  const [patientSearch, setPatientSearch] = useState("")
  const [doctorSearch, setDoctorSearch] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  const { patients, loading: loadingPatients } = useDoctorPatients()
  const { sendMessage, isConnected } = useChat()

  const filteredPatients = patients.filter((patient) =>
      patient.name.toLowerCase().includes(patientSearch.toLowerCase()),
  )

  const selectedPatientData = patients.find((p) => p.id === selectedPatient)
  const filteredDoctors =
      selectedPatientData?.doctors.filter((doctor) => doctor.name.toLowerCase().includes(doctorSearch.toLowerCase())) ||
      []

  const handleSendMessage = async () => {
    if (!selectedPatient || !selectedDoctor || !messageContent.trim() || !isConnected) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un patient, un docteur et saisir un message",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)
      await sendMessage({
        receiverId: selectedDoctor,
        patientId: selectedPatient,
        content: messageContent.trim(),
        attachments: [],
      })

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès",
      })

      setOpen(false)
      setMessageContent("")
      setSelectedPatient(null)
      setSelectedDoctor(null)
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            Nouveau message
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nouveau message</DialogTitle>
            <DialogDescription>Sélectionnez un patient et un docteur pour démarrer une conversation</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Patient selection */}
            <div className="space-y-2">
              <h4 className="font-medium">Sélectionnez un patient</h4>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher un patient..."
                    className="pl-8"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>

              <ScrollArea className="h-[150px] border rounded-md">
                {loadingPatients ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">Aucun patient trouvé</div>
                ) : (
                    <div className="p-1">
                      {filteredPatients.map((patient) => (
                          <div
                              key={patient.id}
                              className={`p-2 cursor-pointer rounded-md ${
                                  selectedPatient === patient.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                              }`}
                              onClick={() => {
                                setSelectedPatient(patient.id)
                                setSelectedDoctor(null) // Reset doctor selection when patient changes
                              }}
                          >
                            {patient.name}
                          </div>
                      ))}
                    </div>
                )}
              </ScrollArea>
            </div>

            {/* Doctor selection - only show if a patient is selected */}
            {selectedPatient && (
                <div className="space-y-2">
                  <h4 className="font-medium">Sélectionnez un docteur</h4>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un docteur..."
                        className="pl-8"
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                    />
                  </div>

                  <ScrollArea className="h-[150px] border rounded-md">
                    {filteredDoctors.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">Aucun docteur trouvé pour ce patient</div>
                    ) : (
                        <div className="p-1">
                          {filteredDoctors.map((doctor) => (
                              <div
                                  key={doctor.id}
                                  className={`p-2 cursor-pointer rounded-md ${
                                      selectedDoctor === doctor.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                  }`}
                                  onClick={() => setSelectedDoctor(doctor.id)}
                              >
                                {doctor.name}
                              </div>
                          ))}
                        </div>
                    )}
                  </ScrollArea>
                </div>
            )}

            {/* Message input - only show if both patient and doctor are selected */}
            {selectedPatient && selectedDoctor && (
                <div className="space-y-2">
                  <h4 className="font-medium">Message</h4>
                  <Textarea
                      placeholder="Saisissez votre message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={4}
                  />
                </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
                onClick={handleSendMessage}
                disabled={!selectedPatient || !selectedDoctor || !messageContent.trim() || isSending || !isConnected}
            >
              {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
              ) : (
                  "Envoyer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}
