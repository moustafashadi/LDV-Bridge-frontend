// ============================================
// NOTIFICATION BELL COMPONENT (WebSocket Enabled)
// ============================================

"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useRealtimeNotifications } from "@/lib/hooks/use-realtime-notifications"

interface NotificationBellProps {
  userId?: string
  organizationId?: string
  className?: string
}

export function NotificationBell({ userId, organizationId, className }: NotificationBellProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, connected } =
    useRealtimeNotifications({
      userId,
      organizationId,
      enabled: !!userId,
    })

  const [isOpen, setIsOpen] = useState(false)

  // Format timestamp
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMins = Math.floor(diffInMs / 60000)

    if (diffInMins < 1) return "Just now"
    if (diffInMins < 60) return `${diffInMins}m ago`
    
    const diffInHours = Math.floor(diffInMins / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  // Get icon for notification type
  const getIcon = (type: string) => {
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className || "relative text-slate-400 hover:text-white"}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          {connected && (
            <span
              className="absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-full"
              title="Connected to real-time notifications"
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[400px] bg-slate-800 border-slate-700"
      >
        <DropdownMenuLabel className="flex items-center justify-between text-white">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-0 text-xs text-blue-400 hover:text-blue-300"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No notifications yet</p>
            {connected && (
              <p className="text-xs text-green-400 mt-2">● Connected</p>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-4 cursor-pointer ${
                  notification.read
                    ? "bg-transparent hover:bg-slate-700/50"
                    : "bg-slate-700/30 hover:bg-slate-700/50"
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3 w-full">
                  <div className="text-2xl flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p
                        className={`text-sm font-medium ${
                          notification.read ? "text-slate-300" : "text-white"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
