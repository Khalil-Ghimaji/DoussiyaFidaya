"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { Bell, CheckCircle, Info, AlertTriangle } from "lucide-react"

interface Notification {
  _id: string
  type: string
  content: string
  read: boolean
  createdAt: string
  relatedPatient?: {
    _ref: string
    firstName: string
    lastName: string
  }
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  connectionStatus: "connecting" | "connected" | "disconnected" | "error"
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  deleteNotification: (notificationId: string) => void
  retryConnection: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )
  const [eventSource, setEventSource] = useState<EventSource | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null)
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null)

  const maxRetries = 5
  const baseRetryDelay = 1000 // 1 second

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Bell className="h-4 w-4" />
      case "prescription":
        return <CheckCircle className="h-4 w-4" />
      case "lab_result":
        return <Info className="h-4 w-4" />
      case "emergency_access":
        return <AlertTriangle className="h-4 w-4" />
      case "access_granted":
        return <CheckCircle className="h-4 w-4" />
      case "message":
        return <Info className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case "emergency_access":
        return "destructive"
      case "access_granted":
      case "prescription":
        return "default"
      default:
        return "default"
    }
  }

  const showToastNotification = useCallback(
    (notification: Notification) => {
      const icon = getNotificationIcon(notification.type)
      const variant = getNotificationVariant(notification.type)

      toast({
        title: "Nouvelle notification",
        description: (
          <div className="flex items-center gap-2">
            {icon}
            <span>{notification.content}</span>
          </div>
        ),
        variant: variant as any,
        duration: 5000,
      })
    },
    [toast],
  )

  const connectToSSE = useCallback(() => {
    if (!session?.user) return

    // Close existing connection
    if (eventSource) {
      eventSource.close()
    }

    setConnectionStatus("connecting")

    const url = `/api/sse?userId=${session.user.id}&token=${session.user.accessToken || ""}`
    const newEventSource = new EventSource(url)

    newEventSource.onopen = () => {
      console.log("SSE connection opened")
      setConnectionStatus("connected")
      setRetryCount(0)
      if (retryTimeout) {
        clearTimeout(retryTimeout)
        setRetryTimeout(null)
      }
    }

    newEventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === "notification") {
          const newNotification = data.notification

          // Add to notifications list
          setNotifications((prev) => [newNotification, ...prev])

          // Update unread count
          if (!newNotification.read) {
            setUnreadCount((prev) => prev + 1)
          }

          // Show toast notification
          showToastNotification(newNotification)
        } else if (data.type === "initial_notifications") {
          // Handle initial notifications load
          setNotifications(data.notifications || [])
          setUnreadCount(data.notifications?.filter((n: Notification) => !n.read).length || 0)
        } else if (data.type === "heartbeat") {
          // Handle heartbeat to keep connection alive
          console.log("SSE heartbeat received")
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error)
      }
    }

    newEventSource.onerror = (error) => {
      console.error("SSE connection error:", error)
      setConnectionStatus("error")
      newEventSource.close()

      // Implement exponential backoff for retries
      if (retryCount < maxRetries) {
        const delay = baseRetryDelay * Math.pow(2, retryCount)
        console.log(`Retrying SSE connection in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`)

        const timeout = setTimeout(() => {
          setRetryCount((prev) => prev + 1)
          connectToSSE()
        }, delay)

        setRetryTimeout(timeout)

        toast({
          title: "Connexion interrompue",
          description: `Tentative de reconnexion... (${retryCount + 1}/${maxRetries})`,
          variant: "destructive",
          duration: 3000,
        })
      } else {
        setConnectionStatus("disconnected")
        toast({
          title: "Connexion échouée",
          description: "Impossible de se connecter aux notifications en temps réel. Veuillez rafraîchir la page.",
          variant: "destructive",
          duration: 10000,
        })
      }
    }

    setEventSource(newEventSource)
  }, [session, eventSource, retryCount, retryTimeout, showToastNotification, toast])

  const retryConnection = useCallback(() => {
    setRetryCount(0)
    connectToSSE()
  }, [connectToSSE])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Optimistically update UI
      setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))

      // Make API call
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark notification as read")
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
      // Revert optimistic update
      setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: false } : n)))
      setUnreadCount((prev) => prev + 1)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read)

      // Optimistically update UI
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)

      // Make API call
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read")
      }

      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      // Revert optimistic update
      setNotifications((prev) =>
        prev.map((n) => {
          const wasUnread = notifications.find((orig) => orig._id === n._id && !orig.read)
          return wasUnread ? { ...n, read: false } : n
        }),
      )
      setUnreadCount(notifications.filter((n) => !n.read).length)

      toast({
        title: "Erreur",
        description: "Impossible de marquer les notifications comme lues",
        variant: "destructive",
      })
    }
  }, [notifications, toast])

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const notificationToDelete = notifications.find((n) => n._id === notificationId)
        setNotificationToDelete(notificationToDelete)

        // Optimistically update UI
        setNotifications((prev) => prev.filter((n) => n._id !== notificationId))
        if (notificationToDelete && !notificationToDelete.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }

        // Make API call
        const response = await fetch("/api/notifications/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notificationId }),
        })

        if (!response.ok) {
          throw new Error("Failed to delete notification")
        }

        toast({
          title: "Succès",
          description: "Notification supprimée",
        })
      } catch (error) {
        console.error("Error deleting notification:", error)
        // Revert optimistic update
        if (notificationToDelete) {
          setNotifications((prev) => [notificationToDelete, ...prev])
          if (!notificationToDelete.read) {
            setUnreadCount((prev) => prev + 1)
          }
        }

        toast({
          title: "Erreur",
          description: "Impossible de supprimer la notification",
          variant: "destructive",
        })
      }
    },
    [notifications, toast],
  )

  // Connect to SSE when user is authenticated
  useEffect(() => {
    if (session?.user) {
      connectToSSE()
    }

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close()
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
    }
  }, [session?.user])

  // Cleanup on session change
  useEffect(() => {
    if (!session?.user && eventSource) {
      eventSource.close()
      setEventSource(null)
      setConnectionStatus("disconnected")
      setNotifications([])
      setUnreadCount(0)
    }
  }, [session?.user, eventSource])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    retryConnection,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
