"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Bell, Check, Trash2, Wifi, WifiOff, AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/components/notification-provider"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function NotificationBell({ user }: { user: any }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    retryConnection,
  } = useNotifications()

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification._id)
    }

    // Rediriger en fonction du type de notification
    if (notification.type === "appointment") {
      router.push(`/${user.role}/appointments`)
    } else if (notification.type === "prescription") {
      router.push(`/${user.role}/prescriptions`)
    } else if (notification.type === "lab_result") {
      router.push(`/${user.role}/lab-results`)
    } else if (notification.type === "emergency_access") {
      router.push("/patient/authorizations")
    } else if (notification.type === "access_granted") {
      router.push(`/doctor/patients/${notification.relatedPatient?._ref}`)
    } else if (notification.type === "message") {
      router.push("/doctor/messages")
    }

    setOpen(false)
  }

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    await deleteNotification(notificationId)
  }

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-3 w-3 text-green-500" />
      case "connecting":
        return <Wifi className="h-3 w-3 text-yellow-500 animate-pulse" />
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-500" />
      case "disconnected":
        return <WifiOff className="h-3 w-3 text-gray-500" />
      default:
        return null
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connecté"
      case "connecting":
        return "Connexion..."
      case "error":
        return "Erreur de connexion"
      case "disconnected":
        return "Déconnecté"
      default:
        return "Inconnu"
    }
  }

  if (!user) return null

  return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
            )}
            {connectionStatus !== "connected" && (
                <div className="absolute -bottom-1 -right-1">{getConnectionStatusIcon()}</div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 font-medium flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>Notifications</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {getConnectionStatusIcon()}
                <span>{getConnectionStatusText()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus === "error" || connectionStatus === "disconnected" ? (
                  <Button variant="ghost" size="sm" onClick={retryConnection} className="h-8 text-xs">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Reconnecter
                  </Button>
              ) : unreadCount > 0 ? (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-xs">
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Tout marquer
                  </Button>
              ) : null}
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-80">
            {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification</p>
                </div>
            ) : (
                <div>
                  {notifications.map((notification) => (
                      <div
                          key={notification._id}
                          className={cn(
                              "p-4 cursor-pointer hover:bg-accent transition-colors relative group",
                              !notification.read && "bg-muted/50 border-l-2 border-l-primary",
                          )}
                          onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          {!notification.read && <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm leading-relaxed", !notification.read && "font-medium")}>
                              {notification.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.createdAt).toLocaleString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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
          {connectionStatus === "error" && (
              <>
                <Separator />
                <div className="p-3 bg-destructive/10 text-destructive text-xs text-center">
                  Connexion aux notifications interrompue. Cliquez sur "Reconnecter" pour réessayer.
                </div>
              </>
          )}
        </PopoverContent>
      </Popover>
  )
}
