"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Bell, Search, LogOut, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useNotifications,
  useNotificationActions,
} from "@/lib/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface MainNavProps {
  title: string;
  navItems: NavItem[];
  userRole: string;
  userName: string;
  userInitials: string;
  notificationCount?: number;
}

// Get icon for notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "REVIEW_APPROVED":
      return "✅";
    case "REVIEW_REJECTED":
      return "❌";
    case "REVIEW_ASSIGNED":
      return "📋";
    case "CHANGE_REQUESTED":
      return "🔄";
    case "COMMENT_ADDED":
    case "COMMENT_MENTION":
      return "💬";
    case "DEPLOYMENT_SUCCESS":
      return "🚀";
    case "DEPLOYMENT_FAILED":
      return "⚠️";
    case "SANDBOX_CREATED":
      return "📦";
    case "SANDBOX_EXPIRED":
      return "⏰";
    default:
      return "🔔";
  }
};

export function MainNav({
  title,
  navItems,
  userRole,
  userName,
  userInitials,
}: MainNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Fetch notifications
  const { notifications, unreadCount, loading, refetch } = useNotifications({
    limit: 10,
  });
  const { markAsRead, markAllAsRead } = useNotificationActions();

  // Refetch when dropdown opens
  useEffect(() => {
    if (isNotificationsOpen) {
      refetch();
    }
  }, [isNotificationsOpen, refetch]);

  const handleSignOut = () => {
    router.push("/auth/logout");
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    refetch();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    refetch();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-white hover:text-blue-400"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                LB
              </div>
              <span className="hidden sm:inline">{title}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-slate-800 border-slate-700 text-white placeholder-slate-500 w-48"
                />
              </div>
            </div>

            {/* Notifications */}
            <DropdownMenu
              open={isNotificationsOpen}
              onOpenChange={setIsNotificationsOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-slate-300 hover:text-white"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-96 bg-slate-800 border-slate-700"
              >
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="font-semibold text-white">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-blue-400 hover:text-blue-300"
                      onClick={handleMarkAllAsRead}
                    >
                      <CheckCheck className="w-3 h-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-slate-700" />

                {loading ? (
                  <div className="px-4 py-8 text-center text-slate-400">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-400">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-80">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-slate-700/50 cursor-pointer border-b border-slate-700/50 last:border-0 ${
                          !notification.isRead ? "bg-slate-700/30" : ""
                        }`}
                        onClick={() =>
                          !notification.isRead &&
                          handleMarkAsRead(notification.id)
                        }
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white truncate">
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-slate-300 hover:text-white"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-slate-800 border-slate-700"
              >
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-white">{userName}</p>
                  <p className="text-xs text-slate-400">{userRole}</p>
                </div>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem className="text-slate-300 cursor-pointer">
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 cursor-pointer">
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem
                  className="text-red-400 cursor-pointer flex items-center gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-300 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
