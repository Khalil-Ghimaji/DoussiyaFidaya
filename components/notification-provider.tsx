"use client"

import type React from "react"
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef
} from "react"
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
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("disconnected")
  const [retryCount, setRetryCount] = useState(0)

  // Use refs to store mutable values that don't trigger re-renders
  const eventSourceRef = useRef<EventSource | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isUnmountedRef = useRef(false)

  const maxRetries = 5
  const baseRetryDelay = 1000 // 1 second

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment": return <Bell className="h-4 w-4" />
      case "prescription": return <CheckCircle className="h-4 w-4" />
      case "lab_result": return <Info className="h-4 w-4" />
      case "emergency_access": return <AlertTriangle className="h-4 w-4" />
      case "access_granted": return <CheckCircle className="h-4 w-4" />
      case "message": return <Info className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case "emergency_access": return "destructive"
      case "access_granted":
      case "prescription": return "default"
      default: return "default"
    }
  }

  const showToastNotification = useCallback((notification: Notification) => {
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
  }, [toast])

  const cleanupConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  const connectToSSE = useCallback(() => {
    // Prevent connection if component is unmounted
    if (isUnmountedRef.current) return

    // Clean up any existing connection
    cleanupConnection()

    setConnectionStatus("connecting")

    try {
      const es = new EventSource("/api/sse-proxy")
      eventSourceRef.current = es

      es.onopen = () => {
        if (isUnmountedRef.current) return
        console.log("SSE connection opened")
        setConnectionStatus("connected")
        setRetryCount(0)
      }

      es.onmessage = (event) => {
        if (isUnmountedRef.current) return

        try {
          console.log("SSE message received:", event.data)
          const parsedData = JSON.parse(event.data)

          // Handle your specific event format: entity.*.action
          if (parsedData.eventName && parsedData.entity) {
            const eventPattern = /^(\w+)\.([^.]+)\.(\w+)$/
            const match = parsedData.eventName.match(eventPattern)

            if (match) {
              const [, entityType, entityId, action] = match
              const entity = parsedData.entity

              // Create notification based on entity type and action
              const getNotificationContent = (entityType: string, action: string, entity: any) => {
                const entityName = entity.first_name && entity.last_name
                    ? `${entity.first_name} ${entity.last_name}`
                    : entity.name || entity.title || entityId

                switch (action) {
                  case 'created':
                    return `New ${entityType.slice(0, -1)} "${entityName}" has been created`
                  case 'updated':
                    return `${entityType.slice(0, -1)} "${entityName}" has been updated`
                  case 'deleted':
                    return `${entityType.slice(0, -1)} "${entityName}" has been deleted`
                  case 'scheduled':
                    return `${entityType.slice(0, -1)} "${entityName}" has been scheduled`
                  case 'cancelled':
                    return `${entityType.slice(0, -1)} "${entityName}" has been cancelled`
                  case 'completed':
                    return `${entityType.slice(0, -1)} "${entityName}" has been completed`
                  default:
                    return `${entityType.slice(0, -1)} "${entityName}" - ${action}`
                }
              }

              const getNotificationType = (entityType: string, action: string) => {
                if (entityType === 'appointments') return 'appointment'
                if (entityType === 'prescriptions') return 'prescription'
                if (entityType === 'lab_results') return 'lab_result'
                if (action === 'deleted' || action === 'cancelled') return 'emergency_access'
                if (action === 'created' || action === 'completed') return 'access_granted'
                return 'message'
              }

              const newNotification: Notification = {
                _id: `${entityType}-${entityId}-${action}-${Date.now()}`,
                type: getNotificationType(entityType, action),
                content: getNotificationContent(entityType, action, entity),
                read: false,
                createdAt: entity.updated_at || entity.created_at || new Date().toISOString(),
                relatedPatient: entity.first_name && entity.last_name ? {
                  _ref: entity.id,
                  firstName: entity.first_name,
                  lastName: entity.last_name
                } : undefined
              }

              setNotifications((prev) => {
                // Avoid duplicates
                const exists = prev.some(n => n._id === newNotification._id)
                if (exists) return prev
                return [newNotification, ...prev]
              })

              setUnreadCount((prev) => prev + 1)
              showToastNotification(newNotification)

              console.log(`Processed ${entityType}.${action} event for entity ${entityId}`)
            } else {
              console.log("Event name doesn't match entity.*.action pattern:", parsedData.eventName)
            }
          }
          // Handle standard notification format
          else if (parsedData.type === "notification") {
            const newNotification = parsedData.notification
            setNotifications((prev) => {
              // Avoid duplicates
              const exists = prev.some(n => n._id === newNotification._id)
              if (exists) return prev
              return [newNotification, ...prev]
            })

            if (!newNotification.read) {
              setUnreadCount((prev) => prev + 1)
            }
            showToastNotification(newNotification)

          } else if (parsedData.type === "initial_notifications") {
            setNotifications(parsedData.notifications || [])
            setUnreadCount(parsedData.notifications?.filter((n: Notification) => !n.read).length || 0)

          } else if (parsedData.type === "ping" || parsedData.type === "heartbeat") {
            // Handle keepalive messages
            console.log("Received keepalive message")
          } else {
            console.log("Unhandled SSE message type:", parsedData)
          }
        } catch (err) {
          console.error("Error parsing SSE message:", err, "Raw data:", event.data)
        }
      }

      es.onerror = (error) => {
        if (isUnmountedRef.current) return

        console.error("SSE connection error:", error)
        setConnectionStatus("error")

        // Close the connection
        es.close()

        if (retryCount < maxRetries) {
          const delay = baseRetryDelay * Math.pow(2, retryCount)
          console.log(`Retrying SSE connection in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`)

          retryTimeoutRef.current = setTimeout(() => {
            if (isUnmountedRef.current) return
            setRetryCount((prev) => prev + 1)
            connectToSSE()
          }, delay)

          // toast({
          //   title: "Connexion interrompue",
          //   description: `Tentative de reconnexion... (${retryCount + 1}/${maxRetries})`,
          //   variant: "destructive",
          //   duration: 3000,
          // })
        } else {
          setConnectionStatus("disconnected")
          // toast({
          //   title: "Connexion échouée",
          //   description: "Impossible de se connecter aux notifications en temps réel. Veuillez rafraîchir la page.",
          //   variant: "destructive",
          //   duration: 10000,
          // })
        }
      }

    } catch (err) {
      console.error("Failed to initialize SSE:", err)
      setConnectionStatus("error")
    }
  }, [retryCount, toast, showToastNotification, cleanupConnection])

  const retryConnection = useCallback(() => {
    console.log("Manual retry connection requested")
    setRetryCount(0)
    connectToSSE()
  }, [connectToSSE])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))

      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ notificationId }),
      })

      if (!response.ok) throw new Error(`Failed to mark as read: ${response.statusText}`)
    } catch (error) {
      // Revert optimistic update
      setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: false } : n)))
      setUnreadCount((prev) => prev + 1)
      console.error("Mark as read failed:", error)

      // toast({
      //   title: "Erreur",
      //   description: "Impossible de marquer la notification comme lue",
      //   variant: "destructive",
      // })
    }
  }, [toast])

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.read)

      // Optimistic update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)

      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) throw new Error(`Failed to mark all as read: ${response.statusText}`)

      toast({
        title: "Succès",
        description: "Toutes les notifications ont été marquées comme lues",
      })
    } catch (error) {
      console.error("Mark all as read failed:", error)

      // Revert optimistic update
      setNotifications((prev) =>
          prev.map((n) => {
            const originalNotification = notifications.find(orig => orig._id === n._id)
            return originalNotification ? { ...n, read: originalNotification.read } : n
          })
      )
      setUnreadCount(notifications.filter((n) => !n.read).length)

      // toast({
      //   title: "Erreur",
      //   description: "Impossible de marquer les notifications comme lues",
      //   variant: "destructive",
      // })
    }
  }, [notifications, toast])

  const deleteNotification = useCallback(async (notificationId: string) => {
    const toDelete = notifications.find((n) => n._id === notificationId)

    try {
      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId))
      if (toDelete && !toDelete.read) setUnreadCount((prev) => prev - 1)

      const response = await fetch("/api/notifications/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ notificationId }),
      })

      if (!response.ok) throw new Error(`Failed to delete notification: ${response.statusText}`)

      toast({ title: "Succès", description: "Notification supprimée" })
    } catch (error) {
      console.error("Delete notification failed:", error)

      // Revert optimistic update
      if (toDelete) {
        setNotifications((prev) => [toDelete, ...prev])
        if (!toDelete.read) setUnreadCount((prev) => prev + 1)
      }

      // toast({
      //   title: "Erreur",
      //   description: "Impossible de supprimer la notification",
      //   variant: "destructive",
      // })
    }
  }, [notifications, toast])

  // Initialize connection on mount
  useEffect(() => {
    isUnmountedRef.current = false
    connectToSSE()

    // Cleanup on unmount
    return () => {
      isUnmountedRef.current = true
      cleanupConnection()
    }
  }, [connectToSSE, cleanupConnection])

  // Add visibility change handler to reconnect when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && connectionStatus === "disconnected") {
        console.log("Tab became visible, attempting to reconnect...")
        retryConnection()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [connectionStatus, retryConnection])

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