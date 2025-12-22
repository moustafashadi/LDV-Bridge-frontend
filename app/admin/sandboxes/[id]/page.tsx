"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useSandboxes } from "@/hooks/use-sandboxes";
import type { Sandbox, SandboxStats } from "@/lib/types/sandboxes";
import {
  ChevronLeft,
  Play,
  Square,
  RotateCcw,
  Trash2,
  Clock,
  Server,
  Database,
  Activity,
  AlertCircle,
  ExternalLink,
  Calendar,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  STOPPED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  PROVISIONING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  EXPIRED: "bg-red-500/20 text-red-400 border-red-500/30",
  ERROR: "bg-red-500/20 text-red-400 border-red-500/30",
};

const platformColors: Record<string, string> = {
  POWERAPPS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  MENDIX: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default function SandboxDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    fetchSandbox,
    getSandboxStats,
    startSandbox,
    stopSandbox,
    deleteSandbox,
    extendExpiration,
    loading,
    error,
  } = useSandboxes();

  const [sandbox, setSandbox] = useState<Sandbox | null>(null);
  const [stats, setStats] = useState<SandboxStats | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [action, setAction] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch sandbox and stats on mount
  useEffect(() => {
    loadSandboxData();
  }, [params.id]);

  const loadSandboxData = async () => {
    try {
      const sandboxData = await fetchSandbox(params.id);
      if (sandboxData) {
        setSandbox(sandboxData);

        // Only fetch stats if sandbox is active
        if (sandboxData.status === "ACTIVE") {
          const statsData = await getSandboxStats(params.id);
          setStats(statsData);
        }
      } else {
        toast({
          title: "Error",
          description: "Sandbox not found",
          variant: "destructive",
        });
        router.push("/admin/sandboxes");
      }
    } catch (err) {
      console.error("Error loading sandbox:", err);
      toast({
        title: "Error",
        description: "Failed to load sandbox details",
        variant: "destructive",
      });
    }
  };

  const refreshStats = async () => {
    if (!sandbox || sandbox.status !== "ACTIVE") return;

    try {
      const statsData = await getSandboxStats(params.id);
      setStats(statsData);
      toast({
        title: "Success",
        description: "Stats refreshed",
      });
    } catch (err) {
      console.error("Error refreshing stats:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleAction = async (actionType: string) => {
    if (!sandbox) return;

    setIsActionLoading(true);
    setAction(actionType);

    try {
      let success = false;

      switch (actionType) {
        case "start":
          success = await startSandbox(params.id);
          if (success) {
            toast({
              title: "Success",
              description: "Sandbox started successfully",
            });
            await loadSandboxData();
          }
          break;

        case "stop":
          success = await stopSandbox(params.id);
          if (success) {
            toast({
              title: "Success",
              description: "Sandbox stopped successfully",
            });
            await loadSandboxData();
          }
          break;

        case "reset":
          // TODO: Implement reset endpoint
          toast({
            title: "Info",
            description: "Reset functionality coming soon",
          });
          break;

        case "delete":
          setIsDeleting(true);
          success = await deleteSandbox(params.id);
          if (success) {
            toast({
              title: "Success",
              description: "Sandbox deleted successfully",
            });
            router.push("/admin/sandboxes");
          }
          setIsDeleting(false);
          return;

        case "extend":
          const extended = await extendExpiration(params.id, 30);
          if (extended) {
            setSandbox(extended);
            toast({
              title: "Success",
              description: "Sandbox expiration extended by 30 days",
            });
          }
          break;
      }

      if (!success && actionType !== "extend" && actionType !== "reset") {
        toast({
          title: "Error",
          description: error || `Failed to ${actionType} sandbox`,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(`Failed to ${actionType} sandbox:`, err);
      toast({
        title: "Error",
        description: `Failed to ${actionType} sandbox`,
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
      setAction(null);
    }
  };

  // Show loading skeleton while fetching
  if (loading && !sandbox) {
    return (
      <RoleLayout>
        <div className="container mx-auto px-6 py-8">
          <Skeleton className="h-64 w-full bg-slate-800" />
        </div>
      </RoleLayout>
    );
  }

  if (!sandbox) {
    return (
      <RoleLayout>
        <div className="container mx-auto px-6 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sandbox not found or you don't have permission to view it.
            </AlertDescription>
          </Alert>
        </div>
      </RoleLayout>
    );
  }

  const daysRemaining = sandbox.expiresAt
    ? calculateDaysRemaining(sandbox.expiresAt)
    : null;
  const isExpiringSoon =
    daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;
  const isExpired = daysRemaining !== null && daysRemaining < 0;

  return (
    <RoleLayout>
      <div className="border-b border-slate-700 bg-slate-800/50 px-6 py-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/sandboxes">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-white">
                    {sandbox.name}
                  </h1>
                  <Badge
                    variant="outline"
                    className={platformColors[sandbox.platform]}
                  >
                    {sandbox.platform}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={statusColors[sandbox.status]}
                  >
                    {sandbox.status}
                  </Badge>
                </div>
                {sandbox.description && (
                  <p className="text-sm text-slate-400 mt-1">
                    {sandbox.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {sandbox.environmentUrl && (
                <a
                  href={sandbox.environmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-300"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Environment
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Expiration Warning */}
        {isExpiringSoon && !isExpired && daysRemaining !== null && (
          <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/30 text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This sandbox will expire in {daysRemaining} day
              {daysRemaining !== 1 ? "s" : ""}. Consider extending it.
            </AlertDescription>
          </Alert>
        )}
        {isExpired && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This sandbox has expired and will be deleted soon.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base">
                  Sandbox Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-500">Type</p>
                  <p className="text-white">{sandbox.type}</p>
                </div>
                {sandbox.region && (
                  <div>
                    <p className="text-slate-500">Region</p>
                    <p className="text-white">{sandbox.region}</p>
                  </div>
                )}
                {sandbox.environmentId && (
                  <div>
                    <p className="text-slate-500">Environment ID</p>
                    <p className="text-white font-mono text-xs">
                      {sandbox.environmentId}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500">Created</p>
                  <p className="text-white">{formatDate(sandbox.createdAt)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Last Updated</p>
                  <p className="text-white">{formatDate(sandbox.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Expiration */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Expiration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sandbox.expiresAt ? (
                  <>
                    <div>
                      <p className="text-slate-500 text-sm">Expires On</p>
                      <p className="text-white font-medium">
                        {formatDate(sandbox.expiresAt)}
                      </p>
                      {daysRemaining !== null && (
                        <p
                          className={`text-sm mt-1 ${
                            isExpired
                              ? "text-red-400"
                              : isExpiringSoon
                              ? "text-yellow-400"
                              : "text-slate-400"
                          }`}
                        >
                          {isExpired
                            ? "Expired"
                            : `${daysRemaining} days remaining`}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleAction("extend")}
                      disabled={isActionLoading || loading}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {isActionLoading && action === "extend"
                        ? "Extending..."
                        : "Extend 30 Days"}
                    </Button>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm">No expiration set</p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sandbox.status === "STOPPED" &&
                  sandbox.platform === "MENDIX" && (
                    <Button
                      onClick={() => handleAction("start")}
                      disabled={isActionLoading || loading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isActionLoading && action === "start"
                        ? "Starting..."
                        : "Start Sandbox"}
                    </Button>
                  )}
                {sandbox.status === "ACTIVE" &&
                  sandbox.platform === "MENDIX" && (
                    <Button
                      onClick={() => handleAction("stop")}
                      disabled={isActionLoading || loading}
                      variant="outline"
                      className="w-full border-slate-600 text-slate-300"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      {isActionLoading && action === "stop"
                        ? "Stopping..."
                        : "Stop Sandbox"}
                    </Button>
                  )}
                <Button
                  onClick={() => handleAction("reset")}
                  disabled={isActionLoading || loading}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {isActionLoading && action === "reset"
                    ? "Resetting..."
                    : "Reset Environment"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={isActionLoading || loading || isDeleting}
                      variant="outline"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? "Deleting..." : "Delete Sandbox"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-slate-800 border-slate-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">
                        Are you sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the sandbox and all its
                        data. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-slate-600">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleAction("delete")}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resource Usage */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Resource Usage</CardTitle>
                  <div className="flex items-center gap-2">
                    {stats && (
                      <Badge
                        variant="outline"
                        className="text-slate-400 border-slate-600"
                      >
                        Last updated:{" "}
                        {new Date(stats.lastUpdated).toLocaleTimeString()}
                      </Badge>
                    )}
                    <Button
                      onClick={refreshStats}
                      disabled={
                        loading || !sandbox || sandbox.status !== "ACTIVE"
                      }
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>Current usage against quotas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {stats ? (
                  <>
                    {/* Apps */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Server className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-medium">
                            Applications
                          </span>
                        </div>
                        <span className="text-slate-400">
                          {stats.appsCount} / {stats.quotas.maxApps}
                        </span>
                      </div>
                      <Progress
                        value={(stats.appsCount / stats.quotas.maxApps) * 100}
                        className="h-2"
                      />
                    </div>

                    {/* API Calls */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium">
                            API Calls (Today)
                          </span>
                        </div>
                        <span className="text-slate-400">
                          {stats.apiCallsUsed.toLocaleString()} /{" "}
                          {stats.quotas.maxApiCalls.toLocaleString()}
                        </span>
                      </div>
                      <Progress
                        value={
                          (stats.apiCallsUsed / stats.quotas.maxApiCalls) * 100
                        }
                        className="h-2"
                      />
                    </div>

                    {/* Storage */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-green-400" />
                          <span className="text-white font-medium">
                            Storage
                          </span>
                        </div>
                        <span className="text-slate-400">
                          {stats.storageUsed} MB / {stats.quotas.maxStorage} MB
                        </span>
                      </div>
                      <Progress
                        value={
                          (stats.storageUsed / stats.quotas.maxStorage) * 100
                        }
                        className="h-2"
                      />
                    </div>
                  </>
                ) : sandbox.status === "ACTIVE" ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Activity className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
                      <p className="text-slate-400">Loading stats...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-slate-400">
                      Stats unavailable for {sandbox.status.toLowerCase()}{" "}
                      sandboxes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Log */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription>Latest events and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      time: "10 minutes ago",
                      action: "App created",
                      detail: "Marketing Campaign Tracker v2",
                    },
                    {
                      time: "2 hours ago",
                      action: "Environment started",
                      detail: "Provisioning completed",
                    },
                    {
                      time: "1 day ago",
                      action: "Settings updated",
                      detail: "Region changed to US East",
                    },
                    {
                      time: "3 days ago",
                      action: "Sandbox created",
                      detail: "Initial provisioning",
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex gap-4 pb-4 border-b border-slate-700 last:border-0 last:pb-0"
                    >
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-400" />
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {activity.action}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {activity.detail}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </RoleLayout>
  );
}
