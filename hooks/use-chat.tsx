"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import {
    chatClient,
    type Message,
    type PatientCentricConversation,
    type SendMessageDto,
} from "@/lib/websocket/chat-client"
import { toast } from "@/hooks/use-toast"

export interface ChatState {
    isConnected: boolean
    isConnecting: boolean
    conversations: PatientCentricConversation[]
    currentConversation: string | null
    messages: Map<string, { messages: Message[]; hasMore: boolean; nextCursor?: string }>
    typingUsers: Map<string, string[]>
    onlineUsers: Set<string>
}

export function useChat() {
    const session  = {accessToken : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA3ZWRlMmNhLWJiMTEtNGNhNC1iYTdkLWJiNGZkNzJlMDA1NyIsImFkZHJlc3MiOiJ0YWJvdW5hIiwiY3JlYXRlZF9hdCI6IjIwMjUtMDYtMDFUMTc6MTA6MjAuMTU0WiIsImVtYWlsIjoic2FoYml5YXNzaW5lQGV4YW1wbGUuY29tIiwiZmlyc3RfbmFtZSI6IkhJUkEiLCJsYXN0X25hbWUiOiJLT0xVIiwiaXNfdmVyaWZpZWQiOnRydWUsImxhc3RfbG9naW4iOm51bGwsInBob25lIjoiKzIxNjk4MTExIiwicHJvZmlsZV9waWN0dXJlIjpudWxsLCJyb2xlIjoiRE9DVE9SIiwiYXNzb2NpYXRlZF9pZCI6IjczMmRjMWRjLWFjN2QtNDAyNi1iNGQwLTFkYTg3NGVkZDFlMiIsInVwZGF0ZWRfYXQiOiIyMDI1LTA2LTAxVDE3OjEwOjIwLjE1NFoiLCJhc3NvY2lhdGVkX2RhdGEiOnsiaWQiOiI3MzJkYzFkYy1hYzdkLTQwMjYtYjRkMC0xZGE4NzRlZGQxZTIiLCJ0eXBlIjoiU1VSR0VPTiIsImlzX2xpY2Vuc2VfdmVyaWZpZWQiOmZhbHNlLCJiaW8iOm51bGwsImVkdWNhdGlvbiI6W10sImV4cGVyaWVuY2UiOltdLCJmaXJzdF9uYW1lIjoiSElSQSIsImxhbmd1YWdlcyI6W10sImxhc3RfbmFtZSI6IktPTFUiLCJwcm9maWxlX2ltYWdlIjpudWxsLCJzcGVjaWFsdHkiOiJQRURJQVRSSUNJQU4iLCJ1c2VyX2lkIjoiMDdlZGUyY2EtYmIxMS00Y2E0LWJhN2QtYmI0ZmQ3MmUwMDU3In0sImlhdCI6MTc0ODgxNjgxMCwiZXhwIjoxNzQ4ODI3NjEwfQ.iDR0asR7let7ztk69sncX5PW8SAZ3JJ55S7raWLUwM4"}

    const [state, setState] = useState<ChatState>({
        isConnected: false,
        isConnecting: false,
        conversations: [],
        currentConversation: null,
        messages: new Map(),
        typingUsers: new Map(),
        onlineUsers: new Set(),
    })

    const typingTimeoutRef = useRef<NodeJS.Timeout>()
    const isTypingRef = useRef(false)

    const updateState = useCallback((updates: Partial<ChatState>) => {
        setState((prev) => ({ ...prev, ...updates }))
    }, [])

    const connect = useCallback(async () => {
        if (!session?.accessToken || state.isConnected || state.isConnecting) return

        updateState({ isConnecting: true })

        try {
            await chatClient.connect(session.accessToken)
            updateState({ isConnected: true, isConnecting: false })

            // Load initial conversations
            const conversations = await chatClient.getConversations()
            updateState({ conversations })

            toast({
                title: "Connected",
                description: "Real-time messaging is now active",
            })
        } catch (error) {
            console.error("Failed to connect to chat:", error)
            updateState({ isConnecting: false })
            toast({
                title: "Connection Failed",
                description: "Could not connect to real-time messaging",
                variant: "destructive",
            })
        }
    }, [session?.accessToken, state.isConnected, state.isConnecting, updateState])

    const disconnect = useCallback(() => {
        chatClient.disconnect()
        updateState({
            isConnected: false,
            isConnecting: false,
            conversations: [],
            currentConversation: null,
            messages: new Map(),
            typingUsers: new Map(),
            onlineUsers: new Set(),
        })
    }, [updateState])

    const selectConversation = useCallback(
        async (conversationId: string) => {
            const conversation = state.conversations.find((c) => c.id === conversationId)
            if (!conversation) return

            updateState({ currentConversation: conversationId })

            // Join the patient room for real-time updates
            chatClient.joinPatientRoom(conversation.patient.id, conversation.partnerDoctor.id)

            // Load messages if not already loaded
            if (!state.messages.has(conversationId)) {
                try {
                    const messagesData = await chatClient.getMessages(conversation.partnerDoctor.id, conversation.patient.id)

                    const newMessages = new Map(state.messages)
                    newMessages.set(conversationId, {
                        messages: messagesData.messages,
                        hasMore: messagesData.hasMore,
                        nextCursor: messagesData.nextCursor,
                    })

                    updateState({ messages: newMessages })

                    // Mark unread messages as read
                    messagesData.messages
                        .filter((msg) => !msg.isRead && msg.receiverId === chatClient.getCurrentUser()?.id)
                        .forEach((msg) => chatClient.markAsRead(msg.id, msg.patientId))
                } catch (error) {
                    console.error("Failed to load messages:", error)
                    toast({
                        title: "Error",
                        description: "Failed to load messages",
                        variant: "destructive",
                    })
                }
            }
        },
        [state.conversations, state.messages, updateState],
    )

    const sendMessage = useCallback(
        async (data: SendMessageDto) => {
            if (!state.isConnected) {
                toast({
                    title: "Not Connected",
                    description: "Please wait for connection to be established",
                    variant: "destructive",
                })
                return
            }

            try {
                chatClient.sendMessage(data)
            } catch (error) {
                console.error("Failed to send message:", error)
                toast({
                    title: "Send Failed",
                    description: "Could not send message",
                    variant: "destructive",
                })
            }
        },
        [state.isConnected],
    )

    const loadMoreMessages = useCallback(
        async (conversationId: string) => {
            const conversation = state.conversations.find((c) => c.id === conversationId)
            const currentMessages = state.messages.get(conversationId)

            if (!conversation || !currentMessages?.hasMore) return

            try {
                const messagesData = await chatClient.getMessages(
                    conversation.partnerDoctor.id,
                    conversation.patient.id,
                    currentMessages.nextCursor,
                )

                const newMessages = new Map(state.messages)
                newMessages.set(conversationId, {
                    messages: [...messagesData.messages.reverse(), ...currentMessages.messages],
                    hasMore: messagesData.hasMore,
                    nextCursor: messagesData.nextCursor,
                })

                updateState({ messages: newMessages })
            } catch (error) {
                console.error("Failed to load more messages:", error)
                toast({
                    title: "Error",
                    description: "Failed to load more messages",
                    variant: "destructive",
                })
            }
        },
        [state.conversations, state.messages, updateState],
    )

    const startTyping = useCallback((receiverId: string, patientId: string) => {
        if (!isTypingRef.current) {
            chatClient.startTyping(receiverId, patientId)
            isTypingRef.current = true
        }

        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            chatClient.stopTyping(receiverId, patientId)
            isTypingRef.current = false
        }, 2000)
    }, [])

    const deleteMessage = useCallback((messageId: string, patientId: string, receiverId: string) => {
        chatClient.deleteMessage(messageId, patientId, receiverId)
    }, [])

    // Set up event listeners
    useEffect(() => {
        const handleNewMessage = (message: Message) => {
            const conversationId =
                message.senderId === chatClient.getCurrentUser()?.id
                    ? `${message.receiverId}-${message.patientId}`
                    : `${message.senderId}-${message.patientId}`

            setState((prev) => {
                const newMessages = new Map(prev.messages)
                const currentMessages = newMessages.get(conversationId) || { messages: [], hasMore: false }

                // Check if message already exists
                const existingIndex = currentMessages.messages.findIndex((m) => m.id === message.id)
                if (existingIndex >= 0) {
                    currentMessages.messages[existingIndex] = message
                } else {
                    currentMessages.messages.push(message)
                }

                newMessages.set(conversationId, currentMessages)

                // Update conversation list
                const newConversations = prev.conversations.map((conv) => {
                    if (conv.id === conversationId) {
                        return {
                            ...conv,
                            lastMessage: message,
                            unreadCount:
                                message.senderId !== chatClient.getCurrentUser()?.id && prev.currentConversation !== conversationId
                                    ? (conv.unreadCount || 0) + 1
                                    : 0,
                        }
                    }
                    return conv
                })

                return {
                    ...prev,
                    messages: newMessages,
                    conversations: newConversations,
                }
            })

            // Auto-mark as read if conversation is open
            if (state.currentConversation === conversationId && message.receiverId === chatClient.getCurrentUser()?.id) {
                chatClient.markAsRead(message.id, message.patientId)
            }
        }

        const handleMessageRead = (data: { messageId: string; readBy: string; patientId: string }) => {
            setState((prev) => {
                const newMessages = new Map(prev.messages)

                for (const [convId, convMessages] of newMessages.entries()) {
                    const messageIndex = convMessages.messages.findIndex((m) => m.id === data.messageId)
                    if (messageIndex >= 0) {
                        convMessages.messages[messageIndex] = {
                            ...convMessages.messages[messageIndex],
                            isRead: true,
                        }
                        newMessages.set(convId, convMessages)
                        break
                    }
                }

                return { ...prev, messages: newMessages }
            })
        }

        const handleTyping = (data: { doctorId: string; patientId: string; isTyping: boolean }) => {
            setState((prev) => {
                const newTypingUsers = new Map(prev.typingUsers)
                const key = `${data.doctorId}-${data.patientId}`

                if (data.isTyping) {
                    const current = newTypingUsers.get(key) || []
                    if (!current.includes(data.doctorId)) {
                        newTypingUsers.set(key, [...current, data.doctorId])
                    }
                } else {
                    const current = newTypingUsers.get(key) || []
                    newTypingUsers.set(
                        key,
                        current.filter((id) => id !== data.doctorId),
                    )
                }

                return { ...prev, typingUsers: newTypingUsers }
            })
        }

        const handleMessageDeleted = (data: { messageId: string; patientId: string }) => {
            setState((prev) => {
                const newMessages = new Map(prev.messages)

                for (const [convId, convMessages] of newMessages.entries()) {
                    const filteredMessages = convMessages.messages.filter((m) => m.id !== data.messageId)
                    if (filteredMessages.length !== convMessages.messages.length) {
                        newMessages.set(convId, { ...convMessages, messages: filteredMessages })
                        break
                    }
                }

                return { ...prev, messages: newMessages }
            })
        }

        const handleDoctorOnline = (data: { doctorId: string }) => {
            setState((prev) => ({
                ...prev,
                onlineUsers: new Set([...prev.onlineUsers, data.doctorId]),
            }))
        }

        const handleDoctorOffline = (data: { doctorId: string }) => {
            setState((prev) => {
                const newOnlineUsers = new Set(prev.onlineUsers)
                newOnlineUsers.delete(data.doctorId)
                return { ...prev, onlineUsers: newOnlineUsers }
            })
        }

        chatClient.on("newMessage", handleNewMessage)
        chatClient.on("messageSent", handleNewMessage)
        chatClient.on("messageRead", handleMessageRead)
        chatClient.on("typing", handleTyping)
        chatClient.on("messageDeleted", handleMessageDeleted)
        chatClient.on("doctorOnline", handleDoctorOnline)
        chatClient.on("doctorOffline", handleDoctorOffline)

        return () => {
            chatClient.off("newMessage", handleNewMessage)
            chatClient.off("messageSent", handleNewMessage)
            chatClient.off("messageRead", handleMessageRead)
            chatClient.off("typing", handleTyping)
            chatClient.off("messageDeleted", handleMessageDeleted)
            chatClient.off("doctorOnline", handleDoctorOnline)
            chatClient.off("doctorOffline", handleDoctorOffline)
        }
    }, [state.currentConversation])

    // Auto-connect when session is available
    useEffect(() => {
        if (session?.accessToken && !state.isConnected && !state.isConnecting) {
            connect()
        }
    }, [session?.accessToken, state.isConnected, state.isConnecting, connect])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearTimeout(typingTimeoutRef.current)
            if (state.currentConversation) {
                const conversation = state.conversations.find((c) => c.id === state.currentConversation)
                if (conversation) {
                    chatClient.leavePatientRoom(conversation.patient.id, conversation.partnerDoctor.id)
                }
            }
        }
    }, [state.currentConversation, state.conversations])

    return {
        ...state,
        connect,
        disconnect,
        selectConversation,
        sendMessage,
        loadMoreMessages,
        startTyping,
        deleteMessage,
        chatClient,
    }
}
