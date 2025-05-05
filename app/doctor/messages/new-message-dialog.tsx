"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function NewMessageDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [recipient, setRecipient] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [recipientType, setRecipientType] = useState("doctor")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()

  const resetForm = () => {
    setRecipient("")
    setSubject("")
    setContent("")
    setRecipientType("doctor")
  }

  const handleSend = async () => {
    if (!recipient || !subject || !content) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès.",
      })

      resetForm()
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Nouveau message</DialogTitle>
          <DialogDescription>Créez un nouveau message à envoyer à un collègue ou un patient.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recipient-type" className="text-right">
              Type
            </Label>
            <Select value={recipientType} onValueChange={setRecipientType}>
              <SelectTrigger id="recipient-type" className="col-span-3">
                <SelectValue placeholder="Sélectionnez le type de destinataire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Médecin</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="laboratory">Laboratoire</SelectItem>
                <SelectItem value="pharmacy">Pharmacie</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recipient" className="text-right">
              Destinataire
            </Label>
            <Input
              id="recipient"
              placeholder="Nom du destinataire"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Sujet
            </Label>
            <Input
              id="subject"
              placeholder="Sujet du message"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="content" className="text-right pt-2">
              Message
            </Label>
            <Textarea
              id="content"
              placeholder="Contenu de votre message"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="col-span-3 min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm()
              setIsOpen(false)
            }}
            disabled={isSending}
          >
            Annuler
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? "Envoi en cours..." : "Envoyer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

