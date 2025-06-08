import { io, type Socket } from "socket.io-client"
import { fetchGraphQL } from "@/lib/graphql-client"
import { 
    Patient, 
    Doctor, 
    Message, 
    Conversation, 
    PatientOld, 
    DoctorOld,
    SendMessageData,
    Users
} from "../types"

export class ChatService {
    private socket: Socket | null = null
    private conversations: Conversation[] = []
    private messages: Message[] = []
    private currentUser: Doctor | null = null
    private serverUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4000"
    private typingTimeouts: Map<string, NodeJS.Timeout> = new Map()

    // Event callbacks
    onConnectionChange?: (connected: boolean) => void
    onUserInfo?: (user: Doctor) => void
    onConversationsUpdate?: (conversations: Conversation[]) => void
    onMessagesUpdate?: (messages: Message[]) => void
    onTypingChange?: (isTyping: boolean, doctorId?: string, patientId?: string) => void
    onNewMessage?: (message: Message) => void
    onMessageRead?: (data: { messageId: string; patientId: string }) => void
    onMessageDeleted?: (data: { messageId: string; patientId: string }) => void

    async connect(): Promise<void> {
        try {
            console.log("🔌 Connexion WebSocket vers:", this.serverUrl)

            // Récupérer le token depuis les cookies
            const token = await this.getTokenFromCookie()
            console.log("🔑 Token disponible:", token ? "✅" : "❌")

            // Configuration des options de socket
            const socketOptions: any = {
                withCredentials: true,
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 10000,
            }

            // Ajouter le token dans l'authentification si disponible
            if (token) {
                socketOptions.auth = { token }
            }

            // Initialiser la connexion socket
            this.socket = io(this.serverUrl, socketOptions)
            this.setupSocketEvents()

            // Retourner une promesse qui se résout une fois la connexion établie
            return new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error("Connection timeout after 10 seconds"))
                }, 10000)

                this.socket!.on("connect", () => {
                    console.log("✅ WebSocket connecté")
                    this.onConnectionChange?.(true)
                })

                this.socket!.on("connected_user_info", (userInfo: any) => {
                    console.log("👤 Infos utilisateur reçues:", userInfo)
                    clearTimeout(timeoutId)

                    const user: Users = {
                        id: userInfo.id,
                        address: '',
                        created_at: new Date().toISOString(),
                        email: userInfo.email || '',
                        first_name: userInfo.firstName || userInfo.first_name,
                        last_name: userInfo.lastName || userInfo.last_name,
                        is_verified: false,
                        password: '',
                        salt: '',
                        last_login: null,
                        phone: '',
                        profile_picture: userInfo.profileImage || userInfo.profile_image,
                        role: "Doctor",
                        associated_id: userInfo.id,
                        updated_at: new Date().toISOString()
                    };

                    this.currentUser = {
                        id: userInfo.id,
                        type: userInfo.type || 'general',
                        is_license_verified: userInfo.isLicenseVerified || false,
                        bio: null,
                        education: [],
                        experience: [],
                        first_name: userInfo.firstName || userInfo.first_name,
                        languages: [],
                        last_name: userInfo.lastName || userInfo.last_name,
                        profile_image: userInfo.profileImage || userInfo.profile_image,
                        specialty: userInfo.specialty || 'general',
                        user_id: userInfo.id,
                        users: user
                    };
                    this.onUserInfo?.(this.currentUser)
                    resolve()
                })

                this.socket!.on("connect_error", (error) => {
                    console.error("❌ Erreur connexion WebSocket:", error)
                    clearTimeout(timeoutId)
                    this.onConnectionChange?.(false)
                    reject(error)
                })
            })
        } catch (error) {
            console.error("💥 Échec connexion:", error)
            throw error
        }
    }

    disconnect(): void {
        // Clear all typing timeouts
        this.typingTimeouts.forEach(timeout => clearTimeout(timeout))
        this.typingTimeouts.clear()

        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
        this.onConnectionChange?.(false)
    }

    private setupSocketEvents(): void {
        if (!this.socket) return

        this.socket.on("disconnect", () => {
            this.onConnectionChange?.(false)
        })

        this.socket.on("newMessage", (message: Message) => {
            console.log("📨 Nouveau message reçu:", message)
            this.onNewMessage?.(message)
        })

        this.socket.on("messageSent", (message: Message) => {
            console.log("✅ Message envoyé confirmé:", message)
            this.onNewMessage?.(message)
        })

        // Fixed: Handle different possible event names for message read
        this.socket.on("messageRead", (data) => {
            console.log("👁️ Message lu (messageRead):", data)
            this.onMessageRead?.(data)
        })

        this.socket.on("messageMarkedAsRead", (data) => {
            console.log("👁️ Message lu (messageMarkedAsRead):", data)
            this.onMessageRead?.(data)
        })

        // Also listen for bulk read updates
        this.socket.on("messagesMarkedAsRead", (data) => {
            console.log("👁️ Messages marqués comme lus:", data)
            // Handle bulk read if your backend supports it
            if (data.messageIds && Array.isArray(data.messageIds)) {
                data.messageIds.forEach((messageId: string) => {
                    this.onMessageRead?.({ messageId, patientId: data.patientId })
                })
            }
        })

        this.socket.on("messageDeleted", (data) => {
            console.log("🗑️ Message supprimé:", data)
            this.onMessageDeleted?.(data)
        })

        // Fixed: Enhanced typing event handling
        this.socket.on("typing", (data) => {
            console.log("⌨️ Typing reçu:", data)
            this.onTypingChange?.(data.isTyping, data.doctorId || data.senderId, data.patientId)
        })

        this.socket.on("userTyping", (data) => {
            console.log("⌨️ User typing:", data)
            this.onTypingChange?.(true, data.doctorId || data.senderId, data.patientId)
        })

        this.socket.on("userStoppedTyping", (data) => {
            console.log("⌨️ User stopped typing:", data)
            this.onTypingChange?.(false, data.doctorId || data.senderId, data.patientId)
        })

        this.socket.on("conversationList", (data) => {
            console.log("📋 Liste des conversations reçue:", data)
            this.onConversationsUpdate?.(data.conversations || [])
        })

        this.socket.on("conversationMessages", (data) => {
            console.log("💬 Messages de conversation reçus:", data)
            this.onMessagesUpdate?.(data.messages || [])
        })

        this.socket.on("conversationExistsResult", (data) => {
            console.log("🔍 Résultat existence conversation:", data)
        })

        // Add error handling for socket events
        this.socket.on("error", (error) => {
            console.error("🚨 Socket error:", error)
        })
    }

    // REST API Methods
    private async fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
        const token = await this.getTokenFromCookie()
        if (!token) {
            throw new Error("Token d'authentification manquant")
        }

        const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...options.headers,
        }

        const response = await fetch(`${this.serverUrl}${endpoint}`, {
            ...options,
            headers,
            credentials: "include",
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }))
            throw new Error(errorData.message || `Erreur ${response.status}`)
        }

        if (response.status === 204) return true
        return response.json()
    }

    // Conversations methods
    async loadConversations(): Promise<void> {
        try {
            console.log("🔄 Chargement des conversations...")

            if (this.socket && this.socket.connected) {
                // Utiliser WebSocket si connecté
                this.socket.emit("getConversations")
            } else {
                // Fallback REST API
                const data = await this.fetchApi("/chat/conversations/sender")
                this.onConversationsUpdate?.(data.conversations || [])
            }
        } catch (error) {
            console.error("💥 Échec chargement conversations:", error)
            throw error
        }
    }

    async loadMessages(patientId: string, doctorReceiverId: string, cursor?: string): Promise<void> {
        try {
            console.log("📨 Chargement messages:", { patientId, doctorReceiverId, cursor })

            if (this.socket && this.socket.connected) {
                // Utiliser WebSocket si connecté
                this.socket.emit("getConversationMessages", {
                    patientId,
                    doctorReceiverId,
                    cursor,
                    limit: 50,
                })
            } else {
                // Fallback REST API
                const params = new URLSearchParams({
                    ...(cursor && { cursor }),
                    limit: "50",
                })
                const data = await this.fetchApi(`/chat/conversations/${patientId}/${doctorReceiverId}?${params}`)
                this.onMessagesUpdate?.(data.messages || [])
            }
        } catch (error) {
            console.error("💥 Échec chargement messages:", error)
            throw error
        }
    }

    async checkConversationExists(patientId: string, doctorReceiverId: string): Promise<boolean> {
        try {
            if (this.socket && this.socket.connected) {
                // Utiliser WebSocket si connecté
                return new Promise((resolve) => {
                    const handler = (data: any) => {
                        if (data.patientId === patientId && data.doctorReceiverId === doctorReceiverId) {
                            this.socket!.off("conversationExistsResult", handler)
                            resolve(data.exists)
                        }
                    }
                    this.socket!.on("conversationExistsResult", handler)
                    this.socket!.emit("checkConversationExists", { patientId, doctorReceiverId })
                })
            } else {
                // Fallback REST API
                const data = await this.fetchApi(`/chat/conversations/verify/${patientId}/${doctorReceiverId}`)
                return data.exists
            }
        } catch (error) {
            console.error("💥 Échec vérification conversation:", error)
            return false
        }
    }

    async sendMessage(data: SendMessageData): Promise<void> {
        try {
            let uploadedAttachments: any[] = []

            // Upload files if any
            if (data.attachments && data.attachments.length > 0) {
                console.log("📎 Upload de", data.attachments.length, "fichiers...")

                const formData = new FormData()
                data.attachments.forEach((file) => formData.append("files", file))

                const token = await this.getTokenFromCookie()
                const uploadResponse = await fetch(`${this.serverUrl}/chat/upload-local`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                })

                if (uploadResponse.ok) {
                    const result = await uploadResponse.json()
                    uploadedAttachments = result.files || []
                    console.log("✅ Fichiers uploadés:", uploadedAttachments.length)
                } else {
                    throw new Error("Échec de l'upload des fichiers")
                }
            }

            // Send message via WebSocket
            if (this.socket && this.socket.connected) {
                console.log("📤 Envoi message via WebSocket")
                this.socket.emit("sendMessage", {
                    content: data.content,
                    receiverId: data.receiverId,
                    patientId: data.patientId,
                    attachments: uploadedAttachments,
                })
            } else {
                // Fallback REST API
                await this.fetchApi("/chat/messages", {
                    method: "POST",
                    body: JSON.stringify({
                        content: data.content,
                        receiverId: data.receiverId,
                        patientId: data.patientId,
                        attachments: uploadedAttachments,
                    }),
                })
            }
        } catch (error) {
            console.error("💥 Échec envoi message:", error)
            throw error
        }
    }

    async deleteMessage(messageId: string, patientId: string, receiverId: string): Promise<void> {
        try {
            if (this.socket && this.socket.connected) {
                this.socket.emit("deleteMessage", {
                    messageId,
                    patientId,
                    receiverId,
                })
            } else {
                await this.fetchApi(`/chat/messages/${messageId}`, {
                    method: "DELETE",
                })
            }
        } catch (error) {
            console.error("💥 Échec suppression message:", error)
            throw error
        }
    }

    // Fixed: Enhanced markMessageAsRead with better error handling and multiple approaches
    async markMessageAsRead(messageId: string, patientId: string, receiverId?: string): Promise<void> {
        try {
            console.log("👁️ Marquage message comme lu:", { messageId, patientId, receiverId })

            if (this.socket && this.socket.connected) {
                // Try different event names that might be expected by your backend
                const readData = {
                    messageId,
                    patientId,
                    ...(receiverId && { receiverId }),
                    ...(this.currentUser && { senderId: this.currentUser.id })
                }

                console.log("📤 Envoi markAsRead via WebSocket:", readData)

                // Try the most common event names
                this.socket.emit("markAsRead", readData)

                // Also try alternative event names in case the backend expects different ones
                setTimeout(() => {
                    if (this.socket && this.socket.connected) {
                        this.socket.emit("markMessageAsRead", readData)
                        this.socket.emit("readMessage", readData)
                    }
                }, 100)

            } else {
                // Fallback REST API with better endpoint handling
                const endpoints = [
                    `/chat/messages/${messageId}/read`,
                    `/chat/messages/${messageId}/mark-read`,
                    `/chat/mark-read/${messageId}`
                ]

                let success = false
                for (const endpoint of endpoints) {
                    try {
                        await this.fetchApi(endpoint, {
                            method: "POST",
                            body: JSON.stringify({ patientId, receiverId })
                        })
                        success = true
                        break
                    } catch (error) {
                        console.log(`❌ Échec endpoint ${endpoint}:`, error)
                        // Continue to next endpoint
                    }
                }

                if (!success) {
                    throw new Error("Tous les endpoints de lecture ont échoué")
                }
            }
        } catch (error) {
            console.error("💥 Échec marquage lecture:", error)
            throw error
        }
    }

    // Enhanced: Mark multiple messages as read
    async markConversationAsRead(patientId: string, receiverId: string): Promise<void> {
        try {
            console.log("👁️ Marquage conversation comme lue:", { patientId, receiverId })

            if (this.socket && this.socket.connected) {
                this.socket.emit("markConversationAsRead", {
                    patientId,
                    receiverId,
                    senderId: this.currentUser?.id
                })
            } else {
                await this.fetchApi(`/chat/conversations/${patientId}/${receiverId}/mark-read`, {
                    method: "POST"
                })
            }
        } catch (error) {
            console.error("💥 Échec marquage conversation:", error)
            throw error
        }
    }

    // Fixed: Enhanced typing indicators with automatic cleanup
    startTyping(receiverId: string, patientId: string): void {
        if (this.socket && this.socket.connected) {
            const typingKey = `${receiverId}-${patientId}`

            console.log("⌨️ Début typing:", { receiverId, patientId })

            // Send typing start event
            this.socket.emit("startTyping", {
                receiverId,
                patientId,
                senderId: this.currentUser?.id
            })

            // Alternative event name
            this.socket.emit("typing", {
                receiverId,
                patientId,
                isTyping: true,
                senderId: this.currentUser?.id
            })

            // Clear existing timeout
            const existingTimeout = this.typingTimeouts.get(typingKey)
            if (existingTimeout) {
                clearTimeout(existingTimeout)
            }

            // Auto-stop typing after 3 seconds of inactivity
            const timeout = setTimeout(() => {
                this.stopTyping(receiverId, patientId)
            }, 3000)

            this.typingTimeouts.set(typingKey, timeout)
        }
    }

    stopTyping(receiverId: string, patientId: string): void {
        if (this.socket && this.socket.connected) {
            const typingKey = `${receiverId}-${patientId}`

            console.log("⌨️ Arrêt typing:", { receiverId, patientId })

            // Send typing stop event
            this.socket.emit("stopTyping", {
                receiverId,
                patientId,
                senderId: this.currentUser?.id
            })

            // Alternative event name
            this.socket.emit("typing", {
                receiverId,
                patientId,
                isTyping: false,
                senderId: this.currentUser?.id
            })

            // Clear timeout
            const timeout = this.typingTimeouts.get(typingKey)
            if (timeout) {
                clearTimeout(timeout)
                this.typingTimeouts.delete(typingKey)
            }
        }
    }

    // Enhanced: Debounced typing for better UX
    debouncedStartTyping = this.debounce((receiverId: string, patientId: string) => {
        this.startTyping(receiverId, patientId)
    }, 300)

    private debounce(func: Function, wait: number) {
        let timeout: NodeJS.Timeout
        return function executedFunction(...args: any[]) {
            const later = () => {
                clearTimeout(timeout)
                func(...args)
            }
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
        }
    }

    // GraphQL methods for patients and doctors
    async getDoctorPatients(doctorId: string): Promise<Patient[]> {
        try {
            const query = `
        query GetDoctorPatients($docId: String!, $take: Int, $skip: Int) {
          docPatients: findManyConsultations(
            where: { 
              doctor_id: { equals: $docId }
            }
            orderBy: { date: desc }
            take: $take
            skip: $skip
            distinct: [patient_id]
          ) {
            date
            patient_id
            patients {
              users {
                first_name
                last_name
              }
              gender
            }
          }
        }
      `

            const response = await fetchGraphQL(query, {
                docId: doctorId,
                take: 100,
                skip: 0,
            })

            if (!response?.data?.docPatients) {
                return []
            }

            return response.data.docPatients.map((consultation: any) => ({
                id: consultation.patient_id,
                name: `${consultation.patients.users.first_name} ${consultation.patients.users.last_name}`,
                firstName: consultation.patients.users.first_name,
                lastName: consultation.patients.users.last_name,
                gender: consultation.patients.gender,
            }))
        } catch (error) {
            console.error("Failed to get doctor patients:", error)
            return []
        }
    }

    async getPatientDoctors(patientId: string): Promise<Doctor[]> {
        try {
            const query = `
        query GetPatientDoctors($patientId: String!, $take: Int, $skip: Int) {
          docPatients: findManyConsultations(
            where: { 
              patient_id: { equals: $patientId }
            }
            orderBy: { date: desc }
            take: $take
            skip: $skip
            distinct: [doctor_id]
          ) {
            date
            doctor_id
            doctors {
              users {
                first_name
                last_name
              }
            }
          }
        }
      `

            const response = await fetchGraphQL(query, {
                patientId: patientId,
                take: 100,
                skip: 0,
            })

            if (!response?.data?.docPatients) {
                return []
            }

            return response.data.docPatients.map((consultation: any) => ({
                id: consultation.doctor_id,
                firstName: consultation.doctors.users.first_name,
                lastName: consultation.doctors.users.last_name,
                specialty: "Doctor",
            }))
        } catch (error) {
            console.error("Failed to get patient doctors:", error)
            return []
        }
    }

    // Utility methods
    getCurrentUser(): Doctor | null {
        return this.currentUser
    }

    isConnected(): boolean {
        return this.socket?.connected || false
    }

    private async getTokenFromCookie(): Promise<string | null> {
        try {
            const cookieString = document.cookie

            if (!cookieString) {
                console.log("🍪 Aucun cookie trouvé")
                return null
            }

            const cookies = cookieString.split(";").map((cookie) => cookie.trim())
            const tokenCookieNames = ["token", "authToken", "auth_token", "jwt", "access_token"]
            let authCookie = null

            for (const name of tokenCookieNames) {
                authCookie = cookies.find((cookie) => cookie.startsWith(`${name}=`))
                if (authCookie) {
                    break
                }
            }

            if (!authCookie) {
                console.log("🍪 Aucun cookie d'auth trouvé")
                return null
            }

            const tokenValue = authCookie.substring(authCookie.indexOf("=") + 1)

            if (!tokenValue || tokenValue.trim() === "") {
                console.log("🍪 Token vide")
                return null
            }

            let cleanToken = tokenValue.trim()

            if (
                (cleanToken.startsWith('"') && cleanToken.endsWith('"')) ||
                (cleanToken.startsWith("'") && cleanToken.endsWith("'"))
            ) {
                cleanToken = cleanToken.slice(1, -1)
            }

            try {
                const decodedToken = decodeURIComponent(cleanToken)
                return decodedToken
            } catch (decodeError) {
                return cleanToken
            }
        } catch (error) {
            console.error("💥 Erreur récupération token:", error)
            return null
        }
    }

    private adaptPatient(old: PatientOld): Patient {
        const user: Users = {
            id: old.id,
            address: '',
            created_at: new Date().toISOString(),
            email: '',
            first_name: old.firstName || '',
            last_name: old.lastName || '',
            is_verified: false,
            password: '',
            salt: '',
            last_login: null,
            phone: '',
            profile_picture: null,
            role: "Patient",
            associated_id: old.id,
            updated_at: new Date().toISOString()
        };

        return {
            id: old.id,
            cin: 0,
            date_of_birth: '',
            gender: old.gender || '',
            profile_image: null,
            general_medical_record_id: null,
            user_id: old.id,
            users: user,
            name: old.name,
            firstName: old.firstName,
            lastName: old.lastName
        };
    }

    private adaptDoctor(old: DoctorOld): Doctor {
        const user: Users = {
            id: old.id,
            address: '',
            created_at: new Date().toISOString(),
            email: '',
            first_name: old.firstName,
            last_name: old.lastName,
            is_verified: false,
            password: '',
            salt: '',
            last_login: null,
            phone: '',
            profile_picture: old.profileImage,
            role: "Doctor",
            associated_id: old.id,
            updated_at: new Date().toISOString()
        };

        return {
            id: old.id,
            type: 'general',
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
            users: user
        };
    }

    private handleGetDocPatients(data: { docPatients: PatientOld[] } | any) {
        if (!data?.docPatients) return;
        // ... rest of the function
    }
}