"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/layout/main-nav"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/layout/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, HelpCircle, AlertCircle } from "lucide-react"
import { useSandboxes } from "@/hooks/use-sandboxes"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { CreateSandboxModal } from "@/components/sandboxes/create-sandbox-modal"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

// Helper function to map sandbox status to display status
function mapSandboxStatus(status: string): "pending" | "live" | "draft" {
  switch (status) {
    case "ACTIVE":
      return "live"
    case "PROVISIONING":
    case "STARTING":
      return "pending"
    case "STOPPED":
    case "FAILED":
      return "draft"
    default:
      return "draft"
  }
}

// Helper function to get emoji icon based on platform or name
function getAppIcon(platform: string, name: string): string {
  if (platform === "POWERAPPS") return "⚡"
  if (platform === "MENDIX") return "🔷"
  
  // Fallback based on name keywords
  if (name.toLowerCase().includes("dashboard")) return "�"
  if (name.toLowerCase().includes("sales")) return "📈"
  if (name.toLowerCase().includes("inventory")) return "📦"
  if (name.toLowerCase().includes("marketing")) return "📊"
  
  return "📱"
}

// Helper function to format notification type for activity
function formatActivityType(notificationType: string): "submitted" | "approved" | "comment" {
  if (notificationType === "REVIEW_APPROVED") return "approved"
  if (notificationType === "REVIEW_REJECTED" || notificationType === "CHANGE_REQUESTED") return "comment"
  return "submitted"
}

export default function CitizenDeveloperHome() {
  const router = useRouter()
  const { sandboxes, loading: sandboxesLoading, error: sandboxesError, fetchMySandboxes } = useSandboxes()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  
  // Memoize the notification filters to prevent infinite re-renders
  const notificationFilters = useMemo(() => ({
    limit: 5,
    type: ["REVIEW_APPROVED", "REVIEW_REJECTED", "CHANGE_REQUESTED", "REVIEW_ASSIGNED", "COMMENT_ADDED"] as any
  }), [])
  
  const { notifications, loading: notificationsLoading, refetch: refetchNotifications } = useNotifications(notificationFilters)

  // Fetch sandboxes on mount
  useEffect(() => {
    fetchMySandboxes()
  }, [])

  // Show error toast if sandboxes fail to load
  useEffect(() => {
    if (sandboxesError) {
      toast.error("Failed to load sandboxes", {
        description: sandboxesError,
      })
    }
  }, [sandboxesError])

  const handleCreateNewApp = () => {
    setIsCreateModalOpen(true)
  }

  const handleSandboxCreated = () => {
    // Refresh the sandboxes list
    fetchMySandboxes()
  }

  const navItems = [
    { label: "My Sandbox", href: "/citizen-developer" },
    { label: "My Changes", href: "/citizen-developer/changes" },
    { label: "Request Review", href: "/citizen-developer/review" },
    { label: "Learning Hub", href: "/citizen-developer/learning" },
  ]

  return (
    <>
      <MainNav
        title="Citizen Developer Portal"
        navItems={navItems}
        userRole="Citizen Developer"
        userName="Sarah K."
        userInitials="SK"
        notificationCount={2}
      />

      <PageHeader
        title={`Welcome back!`}
        description={`You have ${sandboxes.length} ${sandboxes.length === 1 ? 'sandbox' : 'sandboxes'} in progress`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white bg-transparent">
              View Guides
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateNewApp}>
              Create New App
            </Button>
          </div>
        }
      />

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Active Apps */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">My Active Apps</h2>
            
            {sandboxesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <Skeleton className="h-12 w-12 rounded" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-48" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </div>
                        <Skeleton className="h-10 w-32" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sandboxes.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No sandboxes yet</h3>
                  <p className="text-slate-400 mb-6">
                    Create your first sandbox to start building apps
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateNewApp}>
                    Create New Sandbox
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sandboxes.map((sandbox) => {
                  const displayStatus = mapSandboxStatus(sandbox.status)
                  const icon = getAppIcon(sandbox.platform, sandbox.name)
                  const lastModified = formatDistanceToNow(new Date(sandbox.updatedAt), { addSuffix: true })
                  
                  return (
                    <Card key={sandbox.id} className="bg-slate-800 border-slate-700 hover:border-blue-600 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1">
                            <div className="text-3xl">{icon}</div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white">{sandbox.name}</h3>
                              <p className="text-sm text-slate-400 mb-3">{sandbox.platform}</p>
                              <div className="flex items-center gap-2">
                                <StatusBadge
                                  status={displayStatus}
                                  label={
                                    displayStatus === "pending"
                                      ? "Provisioning"
                                      : displayStatus === "live"
                                        ? "Active"
                                        : "Stopped"
                                  }
                                  icon={displayStatus === "pending" ? "🟡" : displayStatus === "live" ? "🟢" : "⚪"}
                                />
                                <span className="text-xs text-slate-500">Last modified {lastModified}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {sandbox.status === "ACTIVE" && sandbox.environmentUrl ? (
                              <a href={sandbox.environmentUrl} target="_blank" rel="noopener noreferrer">
                                <Button className="bg-blue-600 hover:bg-blue-700">Continue Editing</Button>
                              </a>
                            ) : (
                              <Link href={`/citizen-developer/sandbox/${sandbox.id}`}>
                                <Button className="bg-blue-600 hover:bg-blue-700">View Details</Button>
                              </Link>
                            )}
                            <Link href={`/citizen-developer/review/${sandbox.id}`}>
                              <Button
                                variant="outline"
                                className="border-slate-600 text-slate-300 hover:text-white w-full bg-transparent"
                              >
                                View Status
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6 space-y-4">
                {notificationsLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 pb-4 border-b border-slate-700">
                        <Skeleton className="h-6 w-6 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">�</div>
                    <p className="text-slate-400 text-sm">No recent activity</p>
                  </div>
                ) : (
                  <>
                    {notifications.slice(0, 5).map((notification) => {
                      const activityType = formatActivityType(notification.type)
                      const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                      
                      return (
                        <div key={notification.id} className="flex gap-3 pb-4 border-b border-slate-700 last:border-0 last:pb-0">
                          <div className="text-xl shrink-0">
                            {activityType === "submitted" && "📝"}
                            {activityType === "approved" && "✅"}
                            {activityType === "comment" && "💬"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-300">
                              {notification.message || notification.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{timeAgo}</p>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-slate-800 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/citizen-developer/learning">
                  <Button
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:text-white justify-start bg-transparent"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Learning Hub
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:text-white bg-transparent"
                >
                  Request Help from IT
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Create Sandbox Modal */}
      <CreateSandboxModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleSandboxCreated}
      />
    </>
  )
}
