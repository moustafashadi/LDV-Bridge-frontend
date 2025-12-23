"use client";

import { use, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Github,
  GitBranch,
  Clock,
  User,
  Layers,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface AppDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AppDetailPage({ params }: AppDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch app details
  const {
    data: app,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["app", id],
    queryFn: async () => {
      const response = await apiClient.get(`/apps/${id}`);
      return response.data;
    },
  });

  // Sync mutation
  const { mutate: syncApp, isPending: isSyncing } = useMutation({
    mutationFn: async () => {
      const connectorPath = app.platform === "MENDIX" ? "mendix" : "powerapps";
      const response = await apiClient.post(
        `/connectors/${connectorPath}/apps/${app.externalId}/sync`
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("App synced successfully!");
      queryClient.invalidateQueries({ queryKey: ["app", id] });
    },
    onError: (error: any) => {
      toast.error("Sync failed", {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  // Get platform info
  const getPlatformIcon = (platform: string) => {
    if (platform === "POWERAPPS") return "⚡";
    if (platform === "MENDIX") return "🔷";
    return "📱";
  };

  const getStatusVariant = (
    status: string
  ): "pending" | "live" | "draft" | "failed" => {
    switch (status) {
      case "LIVE":
        return "live";
      case "DRAFT":
        return "draft";
      case "SYNCING":
        return "pending";
      default:
        return "draft";
    }
  };

  if (isLoading) {
    return (
      <RoleLayout>
        <div className="container mx-auto px-6 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </RoleLayout>
    );
  }

  if (error || !app) {
    return (
      <RoleLayout>
        <div className="container mx-auto px-6 py-8">
          <Alert className="bg-red-500/10 border-red-500/50">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">
              Failed to load app. It may have been deleted or you don&apos;t
              have access.
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/citizen-developer")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workspace
          </Button>
        </div>
      </RoleLayout>
    );
  }

  // Extract useful metadata
  const appOpenUrl = app.metadata?.properties?.appOpenUri;
  const appPlayUrl = app.metadata?.properties?.appPlayUri;
  const ownerName =
    app.metadata?.properties?.owner?.displayName || app.owner?.email;
  const lastModified = app.metadata?.properties?.lastModifiedTime;
  const environment = app.metadata?.properties?.environment;

  return (
    <RoleLayout>
      <PageHeader
        title={`${getPlatformIcon(app.platform)} ${app.name}`}
        description={app.description || `${app.platform} application`}
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
              onClick={() => router.push("/citizen-developer")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {appPlayUrl && (
              <Button
                variant="outline"
                className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                onClick={() => window.open(appPlayUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in {app.platform === "POWERAPPS" ? "Power Apps" : "Mendix"}
              </Button>
            )}
            <Button
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => syncApp()}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isSyncing ? "Syncing..." : "Sync Now"}
            </Button>
          </div>
        }
      />

      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Last Synced */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Last Synced</p>
                <p className="text-white font-medium">
                  {app.lastSyncedAt
                    ? formatDistanceToNow(new Date(app.lastSyncedAt), {
                        addSuffix: true,
                      })
                    : "Never"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Owner */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <User className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Owner</p>
                <p className="text-white font-medium">
                  {ownerName || "Unknown"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Environment */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Layers className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Environment</p>
                <p
                  className="text-white font-medium truncate"
                  title={environment?.name}
                >
                  {environment?.location || "Unknown"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* GitHub Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Github className="w-5 h-5" />
              GitHub Repository
            </CardTitle>
          </CardHeader>
          <CardContent>
            {app.githubRepoUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                  <span className="text-slate-300">{app.githubRepoName}</span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                    onClick={() => window.open(app.githubRepoUrl, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on GitHub
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                    onClick={() =>
                      window.open(`${app.githubRepoUrl}/commits/main`, "_blank")
                    }
                  >
                    <GitBranch className="w-4 h-4 mr-2" />
                    View Commits
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="border-slate-600 text-slate-400"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Not Connected
                  </Badge>
                  <span className="text-sm text-slate-400">
                    Repository will be created on next sync
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                  onClick={() => syncApp()}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Sync to Create Repository
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card className="bg-slate-800 border-slate-700">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-slate-700 px-4">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="sandboxes"
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                >
                  Sandboxes ({app.sandboxes?.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="changes"
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                >
                  Changes ({app.changes?.length || 0})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">
                    External ID
                  </h4>
                  <code className="text-sm text-slate-300 bg-slate-900 px-2 py-1 rounded">
                    {app.externalId}
                  </code>
                </div>
                {lastModified && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-1">
                      Last Modified in {app.platform}
                    </h4>
                    <p className="text-slate-300">
                      {formatDistanceToNow(new Date(lastModified), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-slate-400 mb-1">
                    Created in LDV-Bridge
                  </h4>
                  <p className="text-slate-300">
                    {formatDistanceToNow(new Date(app.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sandboxes" className="p-6">
              {app.sandboxes?.length > 0 ? (
                <div className="space-y-3">
                  {app.sandboxes.map((sandbox: any) => (
                    <Card
                      key={sandbox.id}
                      className="bg-slate-900/50 border-slate-700"
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium">
                            {sandbox.name}
                          </p>
                          <p className="text-sm text-slate-400">
                            Created{" "}
                            {formatDistanceToNow(new Date(sandbox.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/citizen-developer/sandbox/${sandbox.id}`
                            )
                          }
                        >
                          Open
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GitBranch className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">
                    No sandboxes created for this app yet
                  </p>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Sandbox
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="changes" className="p-6">
              {app.changes?.length > 0 ? (
                <div className="space-y-3">
                  {app.changes.map((change: any) => (
                    <Card
                      key={change.id}
                      className="bg-slate-900/50 border-slate-700"
                    >
                      <CardContent className="p-4">
                        <p className="text-white">{change.summary}</p>
                        <p className="text-sm text-slate-400">
                          {formatDistanceToNow(new Date(change.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">
                    No changes detected yet. Sync the app to check for changes.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </RoleLayout>
  );
}
