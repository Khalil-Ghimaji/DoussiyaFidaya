"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Send,
    Paperclip,
    MessageCircle,
    Users,
    Wifi,
    WifiOff,
    CheckCheck,
    Check,
    Trash2,
    ShieldCheck,
} from "lucide-react";
import { ChatService } from "./services/chat-service";
import { getInitials } from "@/lib/utils";
import { 
    Patient, 
    Doctor, 
    Message, 
    Conversation, 
    PatientOld, 
    DoctorOld 
} from "./types";

interface MessagingInterfaceProps {
    initialConversations?: Conversation[];
}

export function MessagingInterface({ initialConversations }: MessagingInterfaceProps) {
    const [isConnected, setIsConnected] = useState(false);
    const [currentUser, setCurrentUser] = useState<Doctor | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations || []);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [patientDoctors, setPatientDoctors] = useState<Doctor[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<{
        patient: Patient;
        doctor: Doctor;
        exists: boolean;
    } | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingDoctor, setTypingDoctor] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs
    const chatService = useRef<ChatService | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Transform PatientOld to Patient
    const adaptPatient = (old: PatientOld): Patient => ({
        id: old.id,
        cin: 0,
        date_of_birth: "",
        gender: old.gender || "",
        profile_image: null,
        general_medical_record_id: null,
        user_id: old.id,
        users: {
            id: old.id,
            first_name: old.firstName || old.name.split(" ")[0] || "Unknown",
            last_name: old.lastName || old.name.split(" ")[1] || "",
            address: "",
            created_at: new Date().toISOString(),
            email: "",
            is_verified: false,
            password: "",
            salt: "",
            last_login: null,
            phone: "",
            profile_picture: null,
            role: "Patient",
            associated_id: old.id,
            updated_at: new Date().toISOString(),
        },
        name: old.name,
        firstName: old.firstName,
        lastName: old.lastName,
    });

    // Transform DoctorOld to Doctor
    const adaptDoctor = (old: DoctorOld): Doctor => ({
        id: old.id,
        type: "doctor",
        is_license_verified: false,
        bio: null,
        education: [],
        experience: [],
        first_name: old.firstName,
        languages: [],
        last_name: old.lastName,
        profile_image: old.profileImage,
        specialty: old.specialty,
        user_id: old.id,
        users: {
            id: old.id,
            first_name: old.firstName,
            last_name: old.lastName,
            address: "",
            created_at: new Date().toISOString(),
            email: "",
            is_verified: false,
            password: "",
            salt: "",
            last_login: null,
            phone: "",
            profile_picture: old.profileImage,
            role: "Doctor",
            associated_id: old.id,
            updated_at: new Date().toISOString(),
        },
        firstName: old.firstName,
        lastName: old.lastName,
        profileImage: old.profileImage,
        isLicenseVerified: false,
    });

    // Adapt user data for currentUser
    const adaptCurrentUser = (data: any): Doctor => {
        console.log("Current user data:", data);
        return {
            id: data.id,
            type: data.type || "doctor",
            is_license_verified: data.isLicenseVerified || data.is_license_verified || false,
            bio: data.bio || null,
            education: data.education || [],
            experience: data.experience || [],
            first_name: data.firstName || data.first_name || data.users?.first_name || "Unknown",
            languages: data.languages || [],
            last_name: data.lastName || data.last_name || data.users?.last_name || "",
            profile_image: data.profileImage || data.profile_image || data.users?.profile_picture || null,
            specialty: data.specialty || "",
            user_id: data.user_id || data.id,
            users: {
                id: data.users?.id || data.id,
                first_name: data.users?.first_name || data.firstName || data.first_name || "Unknown",
                last_name: data.users?.last_name || data.lastName || data.last_name || "",
                address: data.users?.address || "",
                created_at: data.users?.created_at || new Date().toISOString(),
                email: data.users?.email || "",
                is_verified: data.users?.is_verified || false,
                password: data.users?.password || "",
                salt: data.users?.salt || "",
                last_login: data.users?.last_login || null,
                phone: data.users?.phone || "",
                profile_picture: data.users?.profile_picture || data.profileImage || data.profile_image || null,
                role: data.users?.role || "Doctor",
                associated_id: data.users?.associated_id || data.id,
                updated_at: data.users?.updated_at || new Date().toISOString(),
            },
            firstName: data.firstName || data.first_name,
            lastName: data.lastName || data.last_name,
            profileImage: data.profileImage || data.profile_image,
            isLicenseVerified: data.isLicenseVerified || data.is_license_verified,
        };
    };

    // Initialize chat service
    useEffect(() => {
        const initializeChat = async () => {
            try {
                setLoading(true);
                setError(null);

                chatService.current = new ChatService();

                // Setup event handlers
                chatService.current.onConnectionChange = (connected) => {
                    console.log("Connection changed:", connected);
                    setIsConnected(connected);
                };
                chatService.current.onUserInfo = (data) => {
                    const adaptedUser = adaptCurrentUser(data);
                    console.log("Adapted current user:", adaptedUser);
                    setCurrentUser(adaptedUser);
                };
                chatService.current.onConversationsUpdate = (conversations) => {
                    const adaptedConversations = conversations.map(conv => ({
                        ...conv,
                        patient: adaptPatient(conv.patient),
                        receiver: adaptDoctor(conv.receiver as DoctorOld)
                    }));
                    // @ts-ignore
                    setConversations(adaptedConversations);
                };
                chatService.current.onMessagesUpdate = (msgs) => {
                    console.log("Messages updated:", msgs);
                    setMessages(msgs);
                    // Mark unread messages as read
                    console.log("hhhhhhz",chatService.current);
                    console.log("jjjj",selectedConversation);
                    console.log("jjjjjjjjj",currentUser);

                    if (chatService.current) {
                        console.log("Current conversation:", selectedConversation);

                        msgs.forEach((msg) => {
                            if (!msg.isRead && msg.receiverId === chatService.current?.getCurrentUser()?.id) {
                                chatService.current!.markMessageAsRead(msg.id, msg.patientId).catch((err) => {
                                    console.error("Failed to mark message as read:", err);
                                    setError("Échec du marquage des messages comme lus");
                                });
                            }
                        });
                    }
                };
                chatService.current.onTypingChange = (isTyping, doctorId) => {
                    console.log("Typing event:", { isTyping, doctorId, selectedDoctorId: selectedConversation?.doctor.id });
                    setIsTyping(isTyping);
                    setTypingDoctor(doctorId || null);
                };
                chatService.current.onNewMessage = (message) => {
                    console.log("New message:", message);
                    setMessages((prev) => [...prev, message]);
                    if (chatService.current) {
                        chatService.current.loadConversations();
                    }
                    // Mark as read if it's for the current user and conversation is open
                    if (
                        message.receiverId === currentUser?.id &&
                        selectedConversation?.patient.id === message.patientId &&
                        selectedConversation?.doctor.id === message.senderId
                    ) {
                        chatService.current.markMessageAsRead(message.id, message.patientId).catch((err) => {
                            console.error("Failed to mark new message as read:", err);
                            setError("Échec du marquage du message comme lu");
                        });
                    }
                };
                chatService.current.onMessageRead = (data) => {
                    console.log("Message read event:", data);
                    setMessages((prev) =>
                        prev.map((msg) => (msg.id === data.messageId ? { ...msg, isRead: true } : msg))
                    );
                };
                chatService.current.onMessageDeleted = (data) => {
                    console.log("Message deleted:", data);
                    setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
                };

                await chatService.current.connect();
                console.log("✅ Chat service initialized");

                if (isConnected && chatService.current && (!initialConversations || initialConversations.length === 0)) {
                    chatService.current.loadConversations();
                }
            } catch (error) {
                console.error("❌ Failed to initialize chat:", error);
                setError("Échec de la connexion au service de messagerie");
            } finally {
                setLoading(false);
            }
        };

        initializeChat();

        return () => {
            if (chatService.current) {
                chatService.current.disconnect();
            }
        };
    }, []);

    // Load conversations when connected
    useEffect(() => {
        if (isConnected && chatService.current && (!initialConversations || initialConversations.length === 0)) {
            chatService.current.loadConversations();
        }
    }, [isConnected, initialConversations]);

    // Load patients when user is available
    useEffect(() => {
        const loadPatients = async () => {
            if (currentUser && chatService.current) {
                try {
                    const patientsData: PatientOld[] = await chatService.current.getDoctorPatients(currentUser.id);
                    console.log("Patients data:", patientsData);
                    const adaptedPatients = patientsData.map(adaptPatient);
                    setPatients(adaptedPatients);
                } catch (error) {
                    console.error("Failed to load patients:", error);
                    setError("Échec du chargement des patients");
                }
            }
        };

        loadPatients();
    }, [currentUser]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Handle patient selection
    const handlePatientSelect = async (patient: Patient) => {
        if (!chatService.current) return;

        try {
            setSelectedPatient(patient);
            setSelectedConversation(null);
            setMessages([]);

            const doctorsData: DoctorOld[] = await chatService.current.getPatientDoctors(patient.id);
            const adaptedDoctors = doctorsData.map(adaptDoctor);
            setPatientDoctors(adaptedDoctors);
        } catch (error) {
            console.error("Failed to load patient doctors:", error);
            setError("Échec du chargement des médecins du patient");
        }
    };

    // Handle conversation selection
    const handleConversationSelect = async (conversation: Conversation) => {
        if (!chatService.current) return;

        try {
            setSelectedConversation({
                patient: conversation.patient,
                doctor: conversation.receiver,
                exists: true,
            });
            console.log('hetha howaaaa',selectedConversation)
            setSelectedPatient(null);
            setMessages([]);

            await chatService.current.loadMessages(conversation.patientId, conversation.doctorReceiverId);
        } catch (error) {
            console.error("Failed to load conversation:", error);
            setError("Échec du chargement de la conversation");
        }
    };

    // Handle doctor selection from patient view
    const handleDoctorSelect = async (doctor: Doctor) => {
        if (!chatService.current || !selectedPatient) return;

        try {
            const exists = await chatService.current.checkConversationExists(selectedPatient.id, doctor.id);

            setSelectedConversation({
                patient: selectedPatient,
                doctor: doctor,
                exists: exists,
            });
            setMessages([]);

            if (exists) {
                await chatService.current.loadMessages(selectedPatient.id, doctor.id);
            }
        } catch (error) {
            console.error("Failed to check conversation:", error);
            setError("Échec de la vérification de la conversation");
        }
    };

    // Send message
    const handleSendMessage = async () => {
        if (!chatService.current || !selectedConversation || !newMessage.trim()) return;

        try {
            await chatService.current.sendMessage({
                content: newMessage.trim(),
                receiverId: selectedConversation.doctor.id,
                patientId: selectedConversation.patient.id,
                attachments: attachments.length > 0 ? attachments : undefined,
            });

            setNewMessage("");
            setAttachments([]);

            if (!selectedConversation.exists) {
                setSelectedConversation((prev) => (prev ? { ...prev, exists: true } : null));
                await chatService.current.loadConversations();
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            setError("Échec de l'envoi du message");
        }
    };

    // Handle typing
    const handleTyping = () => {
        if (!chatService.current || !selectedConversation) return;

        console.log("Sending typing event to:", {
            receiverId: selectedConversation.doctor.id,
            patientId: selectedConversation.patient.id,
        });
        chatService.current.startTyping(selectedConversation.doctor.id, selectedConversation.patient.id);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            console.log("Stopping typing event");
            chatService.current?.stopTyping(selectedConversation.doctor.id, selectedConversation.patient.id);
        }, 3000);
    };

    // Handle file attachment
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setAttachments((prev) => [...prev, ...files]);
    };

    // Remove attachment
    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    // Delete message
    const handleDeleteMessage = async (message: Message) => {
        if (!chatService.current || message.senderId !== currentUser?.id) return;

        try {
            await chatService.current.deleteMessage(message.id, message.patientId, message.receiverId);
        } catch (error) {
            console.error("Failed to delete message:", error);
            setError("Échec de la suppression du message");
        }
    };

    // Format time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
        } else {
            return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Connexion en cours...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <div className="w-80 border-r bg-card">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Messagerie</h2>
                        <div className="flex items-center gap-2">
                            {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
                            <Badge variant={isConnected ? "default" : "destructive"}>{isConnected ? "En ligne" : "Hors ligne"}</Badge>
                        </div>
                    </div>

                    {currentUser && (
                        <div className="flex items-center gap-2 mb-4">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={currentUser.profile_image || currentUser.profileImage || "/placeholder.svg"} />
                                <AvatarFallback>
                                    {getInitials(
                                        currentUser.first_name || currentUser.firstName || currentUser.users.first_name || "Unknown",
                                        currentUser.last_name || currentUser.lastName || currentUser.users.last_name || ""
                                    )}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    Dr. {currentUser.first_name || currentUser.firstName || currentUser.users.first_name || "Unknown"}{" "}
                                    {currentUser.last_name || currentUser.lastName || currentUser.users.last_name || ""}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{currentUser.specialty}</p>
                            </div>
                            {(currentUser.is_license_verified || currentUser.isLicenseVerified) && (
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                            )}
                        </div>
                    )}
                </div>

                <Tabs defaultValue="conversations" className="flex-1">
                    <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
                        <TabsTrigger value="conversations" className="flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Conversations
                            {conversations.length > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {conversations.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="patients" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Patients
                            {patients.length > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {patients.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="conversations" className="mt-0">
                        <ScrollArea className="h-[calc(100vh-200px)]">
                            <div className="p-2">
                                {conversations.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>Aucune conversation</p>
                                    </div>
                                ) : (
                                    conversations.map((conversation) => (
                                        <Card
                                            key={`${conversation.patientId}-${conversation.doctorReceiverId}`}
                                            className={`mb-2 cursor-pointer transition-colors hover:bg-accent ${
                                                selectedConversation?.patient.id === conversation.patientId &&
                                                selectedConversation?.doctor.id === conversation.doctorReceiverId
                                                    ? "bg-accent"
                                                    : ""
                                            }`}
                                            onClick={() => handleConversationSelect(conversation)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage
                                                            src={conversation.receiver.profile_image || conversation.receiver.profileImage || "/placeholder.svg"}
                                                        />
                                                        <AvatarFallback>
                                                            {getInitials(
                                                                conversation.receiver.first_name || conversation.receiver.firstName,
                                                                conversation.receiver.last_name || conversation.receiver.lastName
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="text-sm font-medium truncate">
                                                                Dr. {conversation.receiver.first_name || conversation.receiver.firstName}{" "}
                                                                {conversation.receiver.last_name || conversation.receiver.lastName}
                                                            </p>
                                                            {(conversation.receiver.is_license_verified ||
                                                                conversation.receiver.isLicenseVerified) && (
                                                                <ShieldCheck className="h-3 w-3 text-green-500" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mb-1">
                                                            Patient: {conversation.patient.users?.first_name ||
                                                            conversation.patient.firstName ||
                                                            conversation.patient.name}{" "}
                                                            {conversation.patient.users?.last_name || conversation.patient.lastName || ""}
                                                        </p>
                                                        {conversation.lastMessage && (
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {conversation.lastMessage.content}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        {conversation.lastMessage && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatTime(conversation.lastMessage.createdAt)}
                                                            </span>
                                                        )}
                                                        {conversation.lastMessage?.receiverId === conversation.lastMessage?.senderId && (
                                                            <Badge variant="secondary" className="text-xs bg-green-500 text-white">
                                                                To Me
                                                            </Badge>
                                                        )}
                                                        {conversation.unreadCount > 0 && (
                                                            <Badge variant="destructive" className="text-xs">
                                                                {conversation.unreadCount}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="patients" className="mt-0">
                        <ScrollArea className="h-[calc(100vh-200px)]">
                            <div className="p-2">
                                {selectedPatient ? (
                                    <div>
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedPatient(null);
                                                setPatientDoctors([]);
                                                setSelectedConversation(null);
                                            }}
                                            className="mb-4 w-full justify-start"
                                        >
                                            ← Retour aux patients
                                        </Button>
                                        <Card className="mb-4">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm">Patient sélectionné</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="font-medium">
                                                    {selectedPatient.users?.first_name || selectedPatient.firstName || selectedPatient.name}{" "}
                                                    {selectedPatient.users?.last_name || selectedPatient.lastName || ""}
                                                </p>
                                                {selectedPatient.gender && (
                                                    <p className="text-sm text-muted-foreground">{selectedPatient.gender}</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium px-2">Médecins du patient</h3>
                                            {patientDoctors.map((doctor) => (
                                                <Card
                                                    key={doctor.id}
                                                    className="cursor-pointer transition-colors hover:bg-accent"
                                                    onClick={() => handleDoctorSelect(doctor)}
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={doctor.profile_image || doctor.profileImage || "/placeholder.svg"} />
                                                                <AvatarFallback>
                                                                    {getInitials(doctor.first_name || doctor.firstName, doctor.last_name || doctor.lastName)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">
                                                                    Dr. {doctor.first_name || doctor.firstName} {doctor.last_name || doctor.lastName}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {patients.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p>Aucun patient</p>
                                            </div>
                                        ) : (
                                            patients.map((patient) => (
                                                <Card
                                                    key={patient.id}
                                                    className="mb-2 cursor-pointer transition-colors hover:bg-accent"
                                                    onClick={() => handlePatientSelect(patient)}
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={patient.profile_image || "/placeholder.svg"} />
                                                                <AvatarFallback>
                                                                    {patient.users?.first_name || patient.firstName
                                                                        ? getInitials(
                                                                            patient.users?.first_name || patient.firstName || "",
                                                                            patient.users?.last_name || patient.lastName || ""
                                                                        )
                                                                        : patient.name
                                                                            ? patient.name
                                                                                .split(" ")
                                                                                .map((n) => n[0])
                                                                                .join("")
                                                                                .toUpperCase()
                                                                            : "??"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">
                                                                    {patient.users?.first_name || patient.firstName || patient.name}{" "}
                                                                    {patient.users?.last_name || patient.lastName || ""}
                                                                </p>
                                                                {patient.gender && <p className="text-xs text-muted-foreground">{patient.gender}</p>}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b bg-card">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage
                                        src={selectedConversation.doctor.profile_image || selectedConversation.doctor.profileImage || "/placeholder.svg"}
                                    />
                                    <AvatarFallback>
                                        {getInitials(
                                            selectedConversation.doctor.first_name || selectedConversation.doctor.firstName,
                                            selectedConversation.doctor.last_name || selectedConversation.doctor.lastName
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">
                                            Dr. {selectedConversation.doctor.first_name || selectedConversation.doctor.firstName}{" "}
                                            {selectedConversation.doctor.last_name || selectedConversation.doctor.lastName}
                                        </h3>
                                        {(selectedConversation.doctor.is_license_verified || selectedConversation.doctor.isLicenseVerified) && (
                                            <ShieldCheck className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Patient: {selectedConversation.patient.users?.first_name || selectedConversation.patient.firstName || ""}{" "}
                                        {selectedConversation.patient.users?.last_name || selectedConversation.patient.lastName || ""} •{" "}
                                        {selectedConversation.doctor.specialty}
                                    </p>
                                    {isTyping && <p className="text-xs text-blue-600">En train d'écrire...</p>}
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {!selectedConversation.exists && messages.length === 0 && (
                                    <Alert>
                                        <MessageCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Nouvelle conversation avec Dr. {selectedConversation.doctor.first_name || ""}{" "}
                                            {selectedConversation.doctor.last_name || ""} pour le patient{" "}
                                            {selectedConversation.patient.users?.first_name || selectedConversation.patient.firstName || ""}{" "}
                                            {selectedConversation.patient.users?.last_name || selectedConversation.patient.lastName || ""}.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {messages.map((message) => {
                                    const isOwnMessage = message.senderId === currentUser?.id;
                                    return (
                                        <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                                            <div
                                                className={`max-w-[70%] rounded-lg p-3 ${
                                                    isOwnMessage ? "bg-blue-600 text-primary-foreground" : "bg-gray-100"
                                                }`}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <div className="flex-1">
                                                        <p className="text-sm">{message.content}</p>
                                                        {message.attachments && message.attachments.length > 0 && (
                                                            <div className="mt-2 space-y-1">
                                                                {message.attachments.map((attachment, index) => (
                                                                    <div
                                                                        key={index}
                                                                        className="flex items-center gap-2 p-2 rounded bg-background/10"
                                                                    >
                                                                        <Paperclip className="h-3 w-3" />
                                                                        <span className="text-xs">{attachment.filename}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs opacity-70">{formatTime(message.createdAt)}</span>
                                                            {isOwnMessage && (
                                                                <div className="flex items-center gap-1">
                                                                    {message.isRead ? (
                                                                        <CheckCheck className="h-3 w-3 opacity-70" />
                                                                    ) : (
                                                                        <Check className="h-3 w-3 opacity-70" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {isOwnMessage && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteMessage(message)}
                                                            className="h-6 w-6 p-0 mr-0 opacity-70 hover:opacity-100"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Message Input */}
                        <div className="p-4 border-t bg-card">
                            {attachments.length > 0 && (
                                <div className="mb-2 flex flex-wrap gap-2">
                                    {attachments.map((file, index) => (
                                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                            <Paperclip className="h-3 w-3" />
                                            {file.name}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeAttachment(index)}
                                                className="h-4 w-4 p-0 ml-1"
                                            >
                                                x
                                            </Button>
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                                <Textarea
                                    placeholder="Tapez votre message..."
                                    value={newMessage}
                                    onChange={(e) => {
                                        setNewMessage(e.target.value);
                                        handleTyping();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    className="flex-1 min-h-[40px] max-h-[100px]"
                                />
                                <Button variant="default" onClick={handleSendMessage} disabled={!newMessage.trim()} size="sm">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                                accept="image/*,application/pdf,.doc,.docx,.txt"
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center">
                        <div>
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">Sélectionnez une conversation</h3>
                            <p className="text-muted-foreground">
                                Choisissez une conversation existante ou sélectionnez un patient pour commencer
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <Alert className="absolute bottom-4 right-4 w-auto max-w-md">
                    <AlertDescription>{error}</AlertDescription>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setError(null)}
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                    >
                        x
                    </Button>
                </Alert>
            )}
        </div>
    );
}