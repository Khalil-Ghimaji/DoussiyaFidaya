"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, Paperclip, Search, MoreVertical, Trash2, RefreshCw, WifiOff, MessageSquare } from "lucide-react"
import { useChat } from "@/hooks/use-chat"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { NewMessageDialog } from "./new-message-dialog"
import { useDoctorPatients } from "@/hooks/use-doctor-patients"

export function MessagesList() {
    const {
        isConnected,
        isConnecting,
        conversations,
        currentConversation,
        messages,
        typingUsers,
        onlineUsers,
        selectConversation,
        sendMessage,
        loadMoreMessages,
        startTyping,
        deleteMessage,
        chatClient,
    } = useChat()

    const [messageInput, setMessageInput] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { patients } = useDoctorPatients()

    const currentConversationData = conversations.find((c) => c.id === currentConversation)
    const currentMessages = currentConversation ? messages.get(currentConversation) : null

    const filteredConversations = conversations.filter((conv) => {
        if (!searchTerm) return true
        const doctorName = `${conv.partnerDoctor.first_name} ${conv.partnerDoctor.last_name}`.toLowerCase()
        const patientName = conv.patient.name.toLowerCase()
        return doctorName.includes(searchTerm.toLowerCase()) || patientName.includes(searchTerm.toLowerCase())
    })

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [currentMessages?.messages])

    const handleSendMessage = async () => {
        if (!currentConversationData || (!messageInput.trim() && selectedFiles.length === 0)) return

        try {
            setIsUploading(true)
            let attachments = []

            if (selectedFiles.length > 0) {
                attachments = await chatClient.uploadFiles(selectedFiles)
            }

            await sendMessage({
                receiverId: currentConversationData.partnerDoctor.id,
                patientId: currentConversationData.patient.id,
                content: messageInput.trim(),
                attachments,
            })

            setMessageInput("")
            setSelectedFiles([])
        } catch (error) {
            console.error("Failed to send message:", error)
            toast({
                title: "Erreur",
                description: "Impossible d'envoyer le message",
                variant: "destructive",
            })
        } finally {
            setIsUploading(false)
        }
    }

    const handleInputChange = (value: string) => {
        setMessageInput(value)
        if (currentConversationData && value.trim()) {
            startTyping(currentConversationData.partnerDoctor.id, currentConversationData.patient.id)
        }
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        if (selectedFiles.length + files.length > 5) {
            toast({
                title: "Limite atteinte",
                description: "Vous ne pouvez sélectionner que 5 fichiers maximum",
                variant: "destructive",
            })
            return
        }

        const validFiles = files.filter((file) => {
            if (file.size > 10 * 1024 * 1024) {
                toast({
                    title: "Fichier trop volumineux",
                    description: `${file.name} dépasse la limite de 10MB`,
                    variant: "destructive",
                })
                return false
            }
            return true
        })

        setSelectedFiles((prev) => [...prev, ...validFiles])
    }

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const handleDeleteMessage = (messageId: string) => {
        if (!currentConversationData) return

        if (confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
            deleteMessage(messageId, currentConversationData.patient.id, currentConversationData.partnerDoctor.id)
        }
    }

    const getTypingIndicator = () => {
        if (!currentConversationData) return null

        const typingKey = `${currentConversationData.partnerDoctor.id}-${currentConversationData.patient.id}`
        const typingList = typingUsers.get(typingKey) || []

        if (typingList.length === 0) return null

        return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
                <span>{currentConversationData.partnerDoctor.first_name} est en train d'écrire...</span>
            </div>
        )
    }

    if (!isConnected && !isConnecting) {
        return (
            <Alert>
                <WifiOff className="h-4 w-4" />
                <AlertDescription>Connexion au système de messagerie en cours...</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Conversations
                            {conversations.length > 0 && <Badge variant="secondary">{conversations.length}</Badge>}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500")} />
                            <Button variant="ghost" size="sm" onClick={() => window.location.reload()} disabled={isConnecting}>
                                <RefreshCw className={cn("h-4 w-4", isConnecting && "animate-spin")} />
                            </Button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher une conversation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="mt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => document.querySelector('[data-trigger="new-message"]')?.click()}
                        >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Nouvelle conversation
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                        {filteredConversations.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                                {isConnecting ? "Chargement..." : "Aucune conversation"}
                            </div>
                        ) : (
                            filteredConversations.map((conversation) => {
                                const isOnline = onlineUsers.has(conversation.partnerDoctor.id)
                                const isActive = currentConversation === conversation.id

                                return (
                                    <div
                                        key={conversation.id}
                                        className={cn(
                                            "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                                            isActive && "bg-muted",
                                        )}
                                        onClick={() => selectConversation(conversation.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="relative">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={conversation.partnerDoctor.profile_image || "/placeholder.svg"} />
                                                    <AvatarFallback>
                                                        {conversation.partnerDoctor.first_name[0]}
                                                        {conversation.partnerDoctor.last_name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {isOnline && (
                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium truncate">
                                                        Dr. {conversation.partnerDoctor.first_name} {conversation.partnerDoctor.last_name}
                                                    </p>
                                                    {conversation.unreadCount > 0 && (
                                                        <Badge variant="destructive" className="ml-2">
                                                            {conversation.unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">Patient: {conversation.patient.name}</p>
                                                {conversation.lastMessage && (
                                                    <p className="text-xs text-muted-foreground truncate mt-1">
                                                        {conversation.lastMessage.content || "📎 Pièce jointe"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-2 flex flex-col">
                {currentConversationData ? (
                    <>
                        {/* Chat Header */}
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={currentConversationData.partnerDoctor.profile_image || "/placeholder.svg"} />
                                        <AvatarFallback>
                                            {currentConversationData.partnerDoctor.first_name[0]}
                                            {currentConversationData.partnerDoctor.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold">
                                            Dr. {currentConversationData.partnerDoctor.first_name}{" "}
                                            {currentConversationData.partnerDoctor.last_name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Discussion sur: {currentConversationData.patient.name}
                                        </p>
                                        {onlineUsers.has(currentConversationData.partnerDoctor.id) && (
                                            <div className="flex items-center gap-1 text-xs text-green-600">
                                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                En ligne
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>

                        <Separator />

                        {/* Messages */}
                        <CardContent className="flex-1 p-0">
                            <ScrollArea className="h-[400px] p-4">
                                {currentMessages?.hasMore && (
                                    <div className="text-center mb-4">
                                        <Button variant="outline" size="sm" onClick={() => loadMoreMessages(currentConversation!)}>
                                            Charger plus de messages
                                        </Button>
                                    </div>
                                )}

                                {currentMessages?.messages.map((message) => {
                                    const isOwn = message.senderId === chatClient.getCurrentUser()?.id
                                    const time = formatDistanceToNow(new Date(message.createdAt), {
                                        addSuffix: true,
                                        locale: fr,
                                    })

                                    return (
                                        <div key={message.id} className={cn("flex mb-4", isOwn ? "justify-end" : "justify-start")}>
                                            <div
                                                className={cn(
                                                    "max-w-[70%] rounded-lg p-3 relative group",
                                                    isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
                                                )}
                                            >
                                                <div className="whitespace-pre-wrap break-words">{message.content}</div>

                                                {message.attachments && message.attachments.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        {message.attachments.map((attachment, index) => (
                                                            <div key={index} className="flex items-center gap-2 text-sm">
                                                                <Paperclip className="h-3 w-3" />
                                                                <a
                                                                    href={attachment.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="underline hover:no-underline"
                                                                >
                                                                    {attachment.filename}
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                                                    <span>{time}</span>
                                                    {isOwn && (
                                                        <div className="flex items-center gap-1">
                                                            {message.isRead ? "✓✓" : "✓"}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                                                onClick={() => handleDeleteMessage(message.id)}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {getTypingIndicator()}
                                <div ref={messagesEndRef} />
                            </ScrollArea>
                        </CardContent>

                        <Separator />

                        {/* Message Input */}
                        <CardContent className="p-4">
                            {selectedFiles.length > 0 && (
                                <div className="mb-3 space-y-2">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                                            <div className="flex items-center gap-2">
                                                <Paperclip className="h-4 w-4" />
                                                <span className="text-sm">{file.name}</span>
                                                <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    <Paperclip className="h-4 w-4" />
                                </Button>

                                <div className="flex-1">
                                    <Textarea
                                        placeholder="Tapez votre message..."
                                        value={messageInput}
                                        onChange={(e) => handleInputChange(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSendMessage()
                                            }
                                        }}
                                        className="min-h-[40px] max-h-[120px] resize-none"
                                        disabled={isUploading}
                                    />
                                </div>

                                <Button
                                    onClick={handleSendMessage}
                                    disabled={(!messageInput.trim() && selectedFiles.length === 0) || isUploading}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </>
                ) : (
                    <CardContent className="flex-1 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">Sélectionnez une conversation</h3>
                            <p>Choisissez une conversation pour commencer à échanger</p>
                        </div>
                    </CardContent>
                )}
            </Card>
            <NewMessageDialog patients={patients} />
        </div>
    )
}
