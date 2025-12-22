"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoleLayout } from "@/components/layout/role-layout";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  HelpCircle,
  AlertCircle,
  ChevronRight,
  Trash2,
  Link2,
  GitBranch,
  Info,
  Layers,
} from "lucide-react";
import { useSandboxes } from "@/hooks/use-sandboxes";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { useLinkedEnvironments } from "@/lib/hooks/use-linked-environments";
import { CreateSandboxModal } from "@/components/sandboxes/create-sandbox-modal";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getMyApps } from "@/lib/api/apps-api";

// Helper function to map sandbox status to display status
function mapSandboxStatus(status: string): "pending" | "live" | "draft" {
  switch (status) {
    case "ACTIVE":
      return "live";
    case "PROVISIONING":
    case "STARTING":
      return "pending";
    case "STOPPED":
    case "FAILED":
      return "draft";
    default:
      return "draft";
  }
}

// Helper function to get emoji icon based on platform or name
function getAppIcon(platform: string, name: string): string {
  if (platform === "POWERAPPS") return "⚡";
  if (platform === "MENDIX") return "🔷";

  // Fallback based on name keywords
  if (name.toLowerCase().includes("dashboard")) return "📊";
  if (name.toLowerCase().includes("sales")) return "📈";
  if (name.toLowerCase().includes("inventory")) return "📦";
  if (name.toLowerCase().includes("marketing")) return "📊";

  return "📱";
}

// Helper function to format notification type for activity
function formatActivityType(
  notificationType: string
): "submitted" | "approved" | "comment" {
  if (notificationType === "REVIEW_APPROVED") return "approved";
  if (
    notificationType === "REVIEW_REJECTED" ||
    notificationType === "CHANGE_REQUESTED"
  )
    return "comment";
  return "submitted";
}

export default function CitizenDeveloperHome() {
  const router = useRouter();
  const {
    sandboxes,
    loading: sandboxesLoading,
    error: sandboxesError,
    fetchMySandboxes,
    deleteSandbox,
  } = useSandboxes();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("apps");

  // Fetch linked environments via the new API
  const { data: linkedEnvironmentsData, isLoading: linkedEnvLoading } =
    useLinkedEnvironments({ isActive: true });

  // Fetch my apps from the apps API
  const { data: myApps, isLoading: appsLoading } = useQuery({
    queryKey: ["my-apps"],
    queryFn: async () => {
      const response = await getMyApps();
      return response.data;
    },
  });

  // Memoize the notification filters to prevent infinite re-renders
  const notificationFilters = useMemo(
    () => ({
      limit: 5,
      type: [
        "REVIEW_APPROVED",
        "REVIEW_REJECTED",
        "CHANGE_REQUESTED",
        "REVIEW_ASSIGNED",
        "COMMENT_ADDED",
      ] as any,
    }),
    []
  );

  const {
    notifications,
    loading: notificationsLoading,
    refetch: refetchNotifications,
  } = useNotifications(notificationFilters);

  // Separate sandboxes - only those with appId are real sandboxes (app forks)
  const mySandboxes = useMemo(() => {
    return sandboxes.filter((sb) => sb.appId);
  }, [sandboxes]);

  // Fetch sandboxes on mount
  useEffect(() => {
    fetchMySandboxes();
  }, []);

  // Show error toast if sandboxes fail to load
  useEffect(() => {
    if (sandboxesError) {
      toast.error("Failed to load sandboxes", {
        description: sandboxesError,
      });
    }
  }, [sandboxesError]);

  const handleCreateNewApp = () => {
    setIsCreateModalOpen(true);
  };

  const handleSandboxCreated = () => {
    // Refresh the sandboxes list
    fetchMySandboxes();
  };

  const handleDeleteSandbox = async (
    sandboxId: string,
    sandboxName: string
  ) => {
    if (
      confirm(
        `Are you sure you want to delete "${sandboxName}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteSandbox(sandboxId);
        toast.success("Sandbox deleted successfully");
        fetchMySandboxes();
      } catch (error: any) {
        toast.error("Failed to delete sandbox", {
          description: error.message,
        });
      }
    }
  };

  const linkedEnvironments = linkedEnvironmentsData || [];
  const apps = myApps || [];

  return (
    <RoleLayout>
      <PageHeader
        title={`Welcome back!`}
        description={`Track your apps, manage sandboxes, and request reviews for your changes`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
            >
              View Guides
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateNewApp}
            >
              Create New App
            </Button>
          </div>
        }
      />

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Workspace - 3-tab structure */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">My Workspace</h2>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
                <TabsTrigger
                  value="apps"
                  className="data-[state=active]:bg-slate-700"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  My Apps ({apps.length})
                </TabsTrigger>
                <TabsTrigger
                  value="sandboxes"
                  className="data-[state=active]:bg-slate-700"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  My Sandboxes ({mySandboxes.length})
                </TabsTrigger>
                <TabsTrigger
                  value="environments"
                  className="data-[state=active]:bg-slate-700"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Environments ({linkedEnvironments.length})
                </TabsTrigger>
              </TabsList>

              {/* Apps Tab */}
              <TabsContent value="apps" className="mt-6">
                {/* Info Banner */}
                <Alert className="bg-blue-500/10 border-blue-500/50 mb-4">
                  <Info className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200">
                    <strong>Apps</strong> are PowerApps or Mendix applications
                    synced to LDV-Bridge. Changes are tracked and can be
                    reviewed before going live.
                  </AlertDescription>
                </Alert>

                {appsLoading ? (
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
                ) : apps.length === 0 ? (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-12 text-center">
                      <div className="text-4xl mb-4">📱</div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No apps synced yet
                      </h3>
                      <p className="text-slate-400 mb-6">
                        Link an environment and sync your PowerApps or Mendix
                        applications to start tracking changes
                      </p>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleCreateNewApp}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {apps.map((app: any) => {
                      const icon = getAppIcon(app.platform, app.name);
                      const lastModified = formatDistanceToNow(
                        new Date(app.lastSyncedAt || app.updatedAt),
                        { addSuffix: true }
                      );

                      return (
                        <Card
                          key={app.id}
                          className="bg-slate-800 border-slate-700 hover:border-blue-600 transition-colors cursor-pointer"
                          onClick={() =>
                            router.push(`/citizen-developer/apps/${app.id}`)
                          }
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex gap-4 flex-1">
                                <div className="text-3xl">{icon}</div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-white">
                                    {app.name}
                                  </h3>
                                  <p className="text-sm text-slate-400 mb-2">
                                    {app.platform} • Last synced {lastModified}
                                  </p>
                                  {app.description && (
                                    <p className="text-sm text-slate-500">
                                      {app.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 items-end">
                                <StatusBadge
                                  status={
                                    app.status === "LIVE" ? "live" : "draft"
                                  }
                                  label={app.status}
                                />
                                <ChevronRight className="w-5 h-5 text-slate-500" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Sandboxes Tab */}
              <TabsContent value="sandboxes" className="mt-6">
                {/* Info Banner */}
                <Alert className="bg-purple-500/10 border-purple-500/50 mb-4">
                  <GitBranch className="h-4 w-4 text-purple-400" />
                  <AlertDescription className="text-purple-200">
                    <strong>Sandboxes</strong> are safe copies of your apps
                    where you can experiment freely without affecting the
                    original application.
                  </AlertDescription>
                </Alert>

                {sandboxesLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Card key={i} className="bg-slate-800 border-slate-700">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4 flex-1">
                              <Skeleton className="h-12 w-12 rounded" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            </div>
                            <Skeleton className="h-10 w-32" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : mySandboxes.length === 0 ? (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-12 text-center">
                      <div className="text-4xl mb-4">🧪</div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No sandboxes yet
                      </h3>
                      <p className="text-slate-400 mb-6">
                        Create a sandbox by forking an existing app to
                        experiment safely
                      </p>
                      <Button
                        variant="outline"
                        className="border-slate-600 text-slate-300"
                        onClick={() => setActiveTab("apps")}
                      >
                        Browse My Apps
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {mySandboxes.map((sandbox) => {
                      const icon = getAppIcon(sandbox.platform, sandbox.name);
                      const status = mapSandboxStatus(sandbox.status);
                      const lastModified = formatDistanceToNow(
                        new Date(sandbox.updatedAt),
                        { addSuffix: true }
                      );

                      return (
                        <Card
                          key={sandbox.id}
                          className="bg-slate-800 border-slate-700 hover:border-purple-600 transition-colors"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex gap-4 flex-1">
                                <div className="text-3xl">{icon}</div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-white">
                                    {sandbox.name}
                                  </h3>
                                  <p className="text-sm text-slate-400 mb-2">
                                    {sandbox.platform} • Updated {lastModified}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <StatusBadge
                                      status={status}
                                      label={sandbox.status}
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Link
                                  href={`/citizen-developer/sandboxes/${sandbox.id}`}
                                >
                                  <Button
                                    variant="outline"
                                    className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                                  >
                                    Open
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-slate-400 hover:text-red-400 hover:bg-red-900/20"
                                  onClick={() =>
                                    handleDeleteSandbox(
                                      sandbox.id,
                                      sandbox.name
                                    )
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Linked Environments Tab */}
              <TabsContent value="environments" className="mt-6">
                {/* Info Banner */}
                <Alert className="bg-green-500/10 border-green-500/50 mb-4">
                  <Link2 className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-200">
                    <strong>Linked Environments</strong> are your PowerApps
                    environments connected to LDV-Bridge. Browse apps within
                    them and sync to start tracking.
                  </AlertDescription>
                </Alert>

                {linkedEnvLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Card key={i} className="bg-slate-800 border-slate-700">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-4 flex-1">
                              <Skeleton className="h-12 w-12 rounded" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-4 w-32" />
                              </div>
                            </div>
                            <Skeleton className="h-6 w-6" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : linkedEnvironments.length === 0 ? (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-12 text-center">
                      <div className="text-4xl mb-4">🔗</div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No linked environments
                      </h3>
                      <p className="text-slate-400 mb-6">
                        Connect your PowerApps environment to browse and sync
                        your apps
                      </p>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleCreateNewApp}
                      >
                        Connect Environment
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {linkedEnvironments.map((environment) => {
                      const icon =
                        environment.platform === "POWERAPPS" ? "⚡" : "🔷";
                      const lastModified = formatDistanceToNow(
                        new Date(environment.updatedAt),
                        { addSuffix: true }
                      );

                      return (
                        <Card
                          key={environment.id}
                          className="bg-slate-800 border-slate-700 hover:border-green-600 transition-colors cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/citizen-developer/environments/${environment.id}`
                            )
                          }
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex gap-4 flex-1">
                                <div className="text-3xl">{icon}</div>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-white">
                                    {environment.name}
                                  </h3>
                                  <p className="text-sm text-slate-400 mb-1">
                                    {environment.platform} Environment
                                  </p>
                                  {environment.description && (
                                    <p className="text-sm text-slate-500 mb-2">
                                      {environment.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <StatusBadge
                                      status="live"
                                      label="Active"
                                      icon="🟢"
                                    />
                                    <span className="text-sm text-slate-500">
                                      Linked {lastModified}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="w-6 h-6 text-slate-500" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Apps Tracked</span>
                  <span className="text-white font-semibold">
                    {apps.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Active Sandboxes</span>
                  <span className="text-white font-semibold">
                    {mySandboxes.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Linked Environments</span>
                  <span className="text-white font-semibold">
                    {linkedEnvironments.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="text-slate-400 text-sm">No recent activity</p>
                ) : (
                  <div className="space-y-4">
                    {notifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className="flex gap-3">
                        <div className="text-lg">
                          {formatActivityType(notification.type) === "approved"
                            ? "✅"
                            : formatActivityType(notification.type) ===
                              "comment"
                            ? "💬"
                            : "📝"}
                        </div>
                        <div>
                          <p className="text-sm text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-800/50">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <HelpCircle className="w-8 h-8 text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      Need Help?
                    </h3>
                    <p className="text-slate-300 text-sm mb-3">
                      Check out our guides and tutorials to get started.
                    </p>
                    <Link href="/citizen-developer/learning">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-600 text-blue-400 hover:bg-blue-900/50"
                      >
                        Learning Hub
                      </Button>
                    </Link>
                  </div>
                </div>
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
    </RoleLayout>
  );
}
