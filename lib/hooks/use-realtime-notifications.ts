"use client"

import { useEffect, useCallback, useState } from "react"
import { wsClient } from "@/lib/websocket/client"
import { useToast } from "@/hooks/use-toast"

export interface RealtimeNotification {
  id: number
  type: 
    | "REVIEW_ASSIGNED"
    | "REVIEW_APPROVED"
    | "REVIEW_REJECTED"
    | "CHANGE_REQUESTED"
    | "COMMENT_ADDED"
    | "COMMENT_MENTION"
    | "DEPLOYMENT_SUCCESS"
    | "DEPLOYMENT_FAILED"
    | "SYSTEM"
  title: string
  message: string
  read: boolean
  createdAt: string
  metadata?: Record<string, any>
}

interface UseRealtimeNotificationsProps {
  userId?: string
  organizationId?: string
  enabled?: boolean
}

export function useRealtimeNotifications({
  userId,
  organizationId,
  enabled = true,
}: UseRealtimeNotificationsProps = {}) {
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const { toast } = useToast()

  // Show toast notification based on type
  const showNotificationToast = useCallback((notification: RealtimeNotification) => {
    const getVariant = (type: RealtimeNotification["type"]) => {
      switch (type) {
        case "REVIEW_APPROVED":
        case "DEPLOYMENT_SUCCESS":
          return "default" // Success style
        case "REVIEW_REJECTED":
        case "DEPLOYMENT_FAILED":
          return "destructive" // Error style
        case "REVIEW_ASSIGNED":
        case "CHANGE_REQUESTED":
        case "COMMENT_ADDED":
        case "COMMENT_MENTION":
          return "default" // Info style
        default:
          return "default"
      }
    }

    const getIcon = (type: RealtimeNotification["type"]) => {
      switch (type) {
        case "REVIEW_APPROVED":
          return "✅"
        case "REVIEW_REJECTED":
          return "❌"
        case "REVIEW_ASSIGNED":
          return "📋"
        case "CHANGE_REQUESTED":
          return "🔄"
        case "COMMENT_ADDED":
        case "COMMENT_MENTION":
          return "💬"
        case "DEPLOYMENT_SUCCESS":
          return "🚀"
        case "DEPLOYMENT_FAILED":
          return "⚠️"
        default:
          return "🔔"
      }
    }

    toast({
      title: `${getIcon(notification.type)} ${notification.title}`,
      description: notification.message,
      variant: getVariant(notification.type),
    })
  }, [toast])

  // Connect to WebSocket and listen for notifications
  useEffect(() => {
    if (!enabled || !userId) {
      return
    }

    // Check connection status
    setConnected(wsClient.isConnected())

    // Subscribe to connection status changes
    const unsubscribeStatus = wsClient.onConnectionStatusChanged((event: any) => {
      console.log("🔌 WebSocket connection status changed:", event.connected)
      setConnected(event.connected)
    })

    // Subscribe to notification events
    const unsubscribeNotifications = wsClient.onNotification((notification: RealtimeNotification) => {
      console.log("🔔 Received notification:", notification)
      
      // Add to notifications list
      setNotifications((prev) => [notification, ...prev])

      // Show toast notification
      showNotificationToast(notification)
    })

    // Cleanup on unmount
    return () => {
      unsubscribeStatus()
      unsubscribeNotifications()
    }
  }, [enabled, userId, organizationId, showNotificationToast])

  // Mark notification as read
  const markAsRead = useCallback((notificationId: number) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    )
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    connected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  }
}
