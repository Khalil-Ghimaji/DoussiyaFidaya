"use client"

import { useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import { Search, Inbox, Send, Archive, Trash2, Mail, MailOpen, Reply } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Message = {
  _id: string
  subject: string
  content: string
  date: string
  isRead: boolean
  sender: {
    _id: string
    name: string
    role: string
    profileImage: string
  }
  recipient: {
    _id: string
    name: string
    role: string
  }
}

type MessagesListProps = {
  initialMessages: Message[]
}

export function MessagesList({ initialMessages }: MessagesListProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [activeTab, setActiveTab] = useState("inbox")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const { toast } = useToast()

  const inboxMessages = messages.filter((msg) => msg.recipient._id === "current-doctor-id")
  const sentMessages = messages.filter((msg) => msg.sender._id === "current-doctor-id")
  const archivedMessages: Message[] = [] // This would be populated from the server

  const filteredMessages = (messageList: Message[]) => {
    if (!searchQuery) return messageList

    return messageList.filter(
      (msg) =>
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.sender.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()

    if (date.toDateString() === today.toDateString()) {
      return format(date, "HH:mm", { locale: fr })
    } else {
      return format(date, "d MMM", { locale: fr })
    }
  }

  const handleMarkAsRead = (messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg._id === messageId ? { ...msg, isRead: true } : msg)))
  }

  const handleOpenMessage = (message: Message) => {
    setSelectedMessage(message)
    if (!message.isRead) {
      handleMarkAsRead(message._id)
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedMessage) {
      toast({
        title: "Message vide",
        description: "Veuillez saisir un message avant d'envoyer.",
        variant: "destructive",
      })
      return
    }

    setIsReplying(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create a new message in the UI
      const newMessage: Message = {
        _id: `reply-${Date.now()}`,
        subject: `Re: ${selectedMessage.subject}`,
        content: replyContent,
        date: new Date().toISOString(),
        isRead: true,
        sender: {
          _id: "current-doctor-id",
          name: "Dr. Current User",
          role: "doctor",
          profileImage: "/placeholder.svg?height=40&width=40",
        },
        recipient: {
          _id: selectedMessage.sender._id,
          name: selectedMessage.sender.name,
          role: selectedMessage.sender.role,
        },
      }

      setMessages((prev) => [newMessage, ...prev])

      toast({
        title: "Message envoyé",
        description: "Votre réponse a été envoyée avec succès.",
      })

      setReplyContent("")
      setSelectedMessage(null)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsReplying(false)
    }
  }

  const renderMessageItem = (message: Message) => (
    <div
      key={message._id}
      className={`flex items-start space-x-4 p-3 rounded-md cursor-pointer transition-colors ${
        message.isRead ? "bg-background hover:bg-muted/50" : "bg-muted/30 hover:bg-muted/50 font-medium"
      }`}
      onClick={() => handleOpenMessage(message)}
    >
      <Avatar className="h-10 w-10 mt-1">
        <AvatarImage
          src={message.sender.profileImage || "/placeholder.svg?height=40&width=40"}
          alt={message.sender.name}
        />
        <AvatarFallback>
          {message.sender.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate">{message.sender.name}</p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">{formatMessageDate(message.date)}</span>
        </div>
        <p className="text-sm font-medium truncate">{message.subject}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{message.content}</p>
      </div>
      {!message.isRead && <Badge variant="secondary" className="ml-2 h-2 w-2 rounded-full p-0" />}
    </div>
  )

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des messages..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="inbox" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="inbox" className="flex gap-2">
                <Inbox className="h-4 w-4" />
                Réception
                {inboxMessages.filter((m) => !m.isRead).length > 0 && (
                  <Badge variant="secondary">{inboxMessages.filter((m) => !m.isRead).length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent">
                <Send className="h-4 w-4 mr-2" />
                Envoyés
              </TabsTrigger>
              <TabsTrigger value="archived">
                <Archive className="h-4 w-4 mr-2" />
                Archivés
              </TabsTrigger>
              <TabsTrigger value="trash">
                <Trash2 className="h-4 w-4 mr-2" />
                Corbeille
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox" className="p-4 border-t">
              {filteredMessages(inboxMessages).length > 0 ? (
                <div className="space-y-2">{filteredMessages(inboxMessages).map(renderMessageItem)}</div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Aucun message ne correspond à votre recherche"
                      : "Votre boîte de réception est vide"}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent" className="p-4 border-t">
              {filteredMessages(sentMessages).length > 0 ? (
                <div className="space-y-2">{filteredMessages(sentMessages).map(renderMessageItem)}</div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Send className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "Aucun message ne correspond à votre recherche" : "Aucun message envoyé"}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="archived" className="p-4 border-t">
              {filteredMessages(archivedMessages).length > 0 ? (
                <div className="space-y-2">{filteredMessages(archivedMessages).map(renderMessageItem)}</div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "Aucun message ne correspond à votre recherche" : "Aucun message archivé"}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="trash" className="p-4 border-t">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Trash2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">La corbeille est vide</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedMessage && (
        <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedMessage.subject}</DialogTitle>
              <DialogDescription className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={selectedMessage.sender.profileImage || "/placeholder.svg?height=24&width=24"}
                      alt={selectedMessage.sender.name}
                    />
                    <AvatarFallback className="text-xs">
                      {selectedMessage.sender.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span>{selectedMessage.sender.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(selectedMessage.date), "d MMMM yyyy à HH:mm", { locale: fr })}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-muted/30 rounded-md whitespace-pre-line">{selectedMessage.content}</div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MailOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{selectedMessage.isRead ? "Lu" : "Non lu"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Reply className="h-4 w-4" />
                <h3 className="font-medium">Répondre</h3>
              </div>
              <Textarea
                placeholder="Écrivez votre réponse ici..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                Fermer
              </Button>
              <Button onClick={handleReply} disabled={isReplying}>
                {isReplying ? "Envoi en cours..." : "Envoyer la réponse"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

