import { io, type Socket } from "socket.io-client"

export interface Message {
    id: string
    content: string
    createdAt: string
    updatedAt: string
    isRead: boolean
    senderId: string
    receiverId: string
    patientId: string
    attachments?: MessageAttachment[]
}

export interface MessageAttachment {
    id: string
    filename: string
    path: string
    mimeType: string
    size: number
    url?: string
}

export interface Doctor {
    id: string
    first_name: string
    last_name: string
    profile_image?: string
    specialty?: string
    type?: string
    is_license_verified: boolean
    bio?: string
    education: string[]
    experience: string[]
    languages: string[]
    user_id: string
}

export interface PatientInfo {
    id: string
    name: string
    cin?: number
}

export interface PatientCentricConversation {
    id: string
    partnerDoctor: Doctor
    patient: PatientInfo
    lastMessage?: Message
    unreadCount: number
}

export interface SendMessageDto {
    receiverId: string
    patientId: string
    content: string
    attachments?: AttachmentDto[]
}

export interface AttachmentDto {
    filename: string
    path: string
    mimeType: string
    size: string
}

export interface ChatEvents {
    connect: () => void
    disconnect: (reason: string) => void
    connected_user_info: (userInfo: { id: string; firstName: string; lastName: string; specialty?: string }) => void
    newMessage: (message: Message) => void
    messageSent: (message: Message) => void
    messageRead: (data: { messageId: string; readBy: string; patientId: string; readAt: string }) => void
    typing: (data: { doctorId: string; patientId: string; isTyping: boolean }) => void
    messageDeleted: (data: { messageId: string; patientId: string; deletedBy?: string }) => void
    doctorOnline: (data: { doctorId: string; status: string; firstName: string; lastName: string }) => void
    doctorOffline: (data: { doctorId: string; status: string }) => void
    onlineDoctors: (data: { doctorIds: string[] }) => void
    joinedRoom: (data: { roomName: string; patientId: string }) => void
    leftRoom: (data: { roomName: string; patientId: string }) => void
}

export class ChatClient {
    private socket: Socket | null = null
    private token: string | null = null
    private serverUrl: string
    private currentUser: { id: string; firstName: string; lastName: string } | null = null
    private eventListeners: Map<keyof ChatEvents, Function[]> = new Map()

    constructor(serverUrl: string = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3000") {
        this.serverUrl = serverUrl
    }

    connect(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.socket?.connected) {
                resolve()
                return
            }

            this.token = token
            this.socket = io(this.serverUrl, {
                auth: { token },
                transports: ["websocket", "polling"],
            })

            this.setupSocketEvents()

            const timeout = setTimeout(() => {
                reject(new Error("Connection timeout"))
            }, 10000)

            this.socket.on("connected_user_info", (userInfo) => {
                this.currentUser = userInfo
                clearTimeout(timeout)
                resolve()
            })

            this.socket.on("connect_error", (error) => {
                clearTimeout(timeout)
                reject(error)
            })
        })
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
            this.currentUser = null
            this.eventListeners.clear()
        }
    }

    private setupSocketEvents(): void {
        if (!this.socket) return

        this.socket.on("connect", () => {
            this.emit("connect")
        })

        this.socket.on("disconnect", (reason) => {
            this.emit("disconnect", reason)
        })

        this.socket.on("newMessage", (message) => {
            this.emit("newMessage", message)
        })

        this.socket.on("messageSent", (message) => {
            this.emit("messageSent", message)
        })

        this.socket.on("messageRead", (data) => {
            this.emit("messageRead", data)
        })

        this.socket.on("typing", (data) => {
            this.emit("typing", data)
        })

        this.socket.on("messageDeleted", (data) => {
            this.emit("messageDeleted", data)
        })

        this.socket.on("doctorOnline", (data) => {
            this.emit("doctorOnline", data)
        })

        this.socket.on("doctorOffline", (data) => {
            this.emit("doctorOffline", data)
        })
    }

    on<K extends keyof ChatEvents>(event: K, callback: ChatEvents[K]): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, [])
        }
        this.eventListeners.get(event)!.push(callback)
    }

    off<K extends keyof ChatEvents>(event: K, callback: ChatEvents[K]): void {
        const listeners = this.eventListeners.get(event)
        if (listeners) {
            const index = listeners.indexOf(callback)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }

    private emit<K extends keyof ChatEvents>(event: K, ...args: any[]): void {
        const listeners = this.eventListeners.get(event)
        if (listeners) {
            listeners.forEach((callback) => callback(...args))
        }
    }

    sendMessage(data: SendMessageDto): void {
        if (!this.socket?.connected) {
            throw new Error("Not connected to chat server")
        }
        this.socket.emit("sendMessage", data)
    }

    markAsRead(messageId: string, patientId: string): void {
        if (!this.socket?.connected) return
        this.socket.emit("markAsRead", { messageId, patientId })
    }

    startTyping(receiverId: string, patientId: string): void {
        if (!this.socket?.connected) return
        this.socket.emit("startTyping", { receiverId, patientId })
    }

    stopTyping(receiverId: string, patientId: string): void {
        if (!this.socket?.connected) return
        this.socket.emit("stopTyping", { receiverId, patientId })
    }

    deleteMessage(messageId: string, patientId: string, receiverId: string): void {
        if (!this.socket?.connected) return
        this.socket.emit("deleteMessage", { messageId, patientId, receiverId })
    }

    joinPatientRoom(patientId: string, otherDoctorId: string): void {
        if (!this.socket?.connected) return
        this.socket.emit("joinPatientRoom", { patientId, otherDoctorId })
    }

    leavePatientRoom(patientId: string, otherDoctorId: string): void {
        if (!this.socket?.connected) return
        this.socket.emit("leavePatientRoom", { patientId, otherDoctorId })
    }

    getOnlineDoctors(): void {
        if (!this.socket?.connected) return
        this.socket.emit("getOnlineDoctors")
    }

    async fetchApi(endpoint: string, options: RequestInit = {}): Promise<any> {
        if (!this.token) {
            throw new Error("No authentication token available")
        }

        const headers = {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
            ...options.headers,
        }

        try {
            const response = await fetch(`${this.serverUrl}${endpoint}`, {
                ...options,
                headers,
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }))
                throw new Error(errorData.message || "API request failed")
            }

            if (response.status === 204) return true
            return response.json()
        } catch (error) {
            console.error(`API Error for ${endpoint}:`, error)
            throw error
        }
    }

    async getConversations(): Promise<PatientCentricConversation[]> {
        return this.fetchApi("/chat/conversations")
    }

    async getMessages(
        otherDoctorId: string,
        patientId: string,
        cursor?: string,
        limit = 20,
    ): Promise<{ messages: Message[]; hasMore: boolean; nextCursor?: string }> {
        const params = new URLSearchParams({
            doctorId: otherDoctorId,
            patientId,
            limit: limit.toString(),
        })
        if (cursor) params.append("cursor", cursor)

        return this.fetchApi(`/chat/messages?${params}`)
    }

    async uploadFiles(files: File[]): Promise<AttachmentDto[]> {
        if (!this.token) {
            throw new Error("No authentication token available")
        }

        const formData = new FormData()
        files.forEach((file) => formData.append("files", file))

        const response = await fetch(`${this.serverUrl}/chat/upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: "Upload failed" }))
            throw new Error(errorData.message || "File upload failed")
        }

        const result = await response.json()
        return result.files || []
    }

    async searchDoctors(searchTerm?: string): Promise<Doctor[]> {
        const params = searchTerm ? `?term=${encodeURIComponent(searchTerm)}` : ""
        const result = await this.fetchApi(`/chat/doctors/search${params}`)
        return result.doctors || []
    }

    async searchPatients(searchTerm?: string): Promise<PatientInfo[]> {
        const params = searchTerm ? `?term=${encodeURIComponent(searchTerm)}` : ""
        const result = await this.fetchApi(`/chat/patients/search${params}`)
        return result.patients || []
    }

    getCurrentUser() {
        return this.currentUser
    }

    isConnected(): boolean {
        return this.socket?.connected || false
    }
}

// Singleton instance
export const chatClient = new ChatClient()
