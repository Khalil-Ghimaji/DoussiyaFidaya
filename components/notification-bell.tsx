"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Bell, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/actions/notifications"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function NotificationBell() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!session?.user) return

    const fetchNotifications = async () => {
      try {
        const result = await getNotifications()
        if (result.success) {
          setNotifications(result.data)
          setUnreadCount(result.data.filter((n) => !n.read).length)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des notifications:", error)
      }
    }

    fetchNotifications()

    // Rafraîchir les notifications toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [session])

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification._id)

        // Mettre à jour l'état local
        setNotifications(notifications.map((n) => (n._id === notification._id ? { ...n, read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (error) {
        console.error("Erreur lors du marquage de la notification comme lue:", error)
      }
    }

    // Rediriger en fonction du type de notification
    if (notification.type === "appointment") {
      router.push(`/${session.user.role}/appointments`)
    } else if (notification.type === "prescription") {
      router.push(`/${session.user.role}/prescriptions`)
    } else if (notification.type === "lab_result") {
      router.push(`/${session.user.role}/lab-results`)
    } else if (notification.type === "emergency_access") {
      router.push("/patient/authorizations")
    } else if (notification.type === "access_granted") {
      router.push(`/doctor/patients/${notification.relatedPatient?._ref}`)
    } else if (notification.type === "message") {
      router.push("/doctor/messages")
    }

    setOpen(false)
  }

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead()

      if (result.success) {
        // Mettre à jour l'état local
        setNotifications(notifications.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)

        toast({
          title: "Succès",
          description: "Toutes les notifications ont été marquées comme lues",
        })
      }
    } catch (error) {
      console.error("Erreur lors du marquage des notifications comme lues:", error)
      toast({
        title: "Erreur",
        description: "Impossible de marquer les notifications comme lues",
        variant: "destructive",
      })
    }
  }

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation() // Empêcher le clic de se propager à la notification

    try {
      const result = await deleteNotification(notificationId)

      if (result.success) {
        // Mettre à jour l'état local
        const updatedNotifications = notifications.filter((n) => n._id !== notificationId)
        setNotifications(updatedNotifications)

        // Recalculer le nombre de notifications non lues
        setUnreadCount(updatedNotifications.filter((n) => !n.read).length)

        toast({
          title: "Succès",
          description: "Notification supprimée",
        })
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la notification:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification",
        variant: "destructive",
      })
    }
  }

  if (!session?.user) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center translate-x-1/3 -translate-y-1/3">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 font-medium flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-8 text-xs">
              <Check className="h-3.5 w-3.5 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">Aucune notification</div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 cursor-pointer hover:bg-accent ${!notification.read ? "bg-muted" : ""} relative`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-2">
                    {!notification.read && <div className="w-2 h-2 mt-1.5 rounded-full bg-primary shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm">{notification.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:opacity-100"
                      onClick={(e) => handleDeleteNotification(e, notification._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

