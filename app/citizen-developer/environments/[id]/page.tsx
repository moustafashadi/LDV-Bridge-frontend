"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RoleLayout } from "@/components/layout/role-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  useLinkedEnvironment,
  useSyncAppToLDVBridge,
} from "@/lib/hooks/use-linked-environments";
import { usePowerAppsApps } from "@/hooks/use-connectors";
import { CreatePowerAppsDialog } from "@/components/dialogs/create-powerapps-dialog";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { getMyApps } from "@/lib/api/apps-api";
import { useQuery } from "@tanstack/react-query";

export default function EnvironmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const environmentId = params.id as string;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [syncingAppId, setSyncingAppId] = useState<string | null>(null);

  // Fetch the linked environment
  const {
    data: environment,
    isLoading: envLoading,
    error: envError,
  } = useLinkedEnvironment(environmentId);

  // Fetch apps from PowerApps for this environment
  const {
    data: platformApps,
    isLoading: appsLoading,
    refetch: refetchApps,
  } = usePowerAppsApps(environment?.environmentId);

  // Fetch apps we already have in LDV-Bridge to show which are synced
  const { data: myApps } = useQuery({
    queryKey: ["my-apps"],
    queryFn: async () => {
      const response = await getMyApps();
      return response.data;
    },
  });

  // Sync mutation
  const { mutate: syncApp, isPending: isSyncing } = useSyncAppToLDVBridge();

  // Check if an app is already synced to LDV-Bridge
  const isAppSynced = (externalAppId: string) => {
    if (!myApps) return false;
    return myApps.some(
      (app: any) =>
        app.externalId === externalAppId ||
        app.metadata?.externalId === externalAppId
    );
  };

  // Find the internal app ID for a synced app
  const getInternalAppId = (externalAppId: string) => {
    if (!myApps) return null;
    const app = myApps.find(
      (a: any) =>
        a.externalId === externalAppId ||
        a.metadata?.externalId === externalAppId
    );
    return app?.id || null;
  };

  const handleRefresh = () => {
    refetchApps();
    toast.success("Apps refreshed");
  };

  const handleCreateApp = () => {
    if (environment?.platform === "POWERAPPS") {
      setCreateDialogOpen(true);
    } else if (environment?.environmentUrl) {
      window.open(environment.environmentUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleSyncApp = (externalAppId: string, appName: string) => {
    setSyncingAppId(externalAppId);
    syncApp(
      {
        externalAppId,
        appName,
        platform: environment?.platform || "POWERAPPS",
      },
      {
        onSettled: () => {
          setSyncingAppId(null);
        },
        onSuccess: (data) => {
          // Navigate to the app detail page after successful sync
          router.push(`/citizen-developer/apps/${data.appId}`);
        },
      }
    );
  };

  const handleViewApp = (externalAppId: string) => {
    const internalId = getInternalAppId(externalAppId);
    if (internalId) {
      router.push(`/citizen-developer/apps/${internalId}`);
    }
  };

  // Loading state
  if (envLoading) {
    return (
      <RoleLayout>
        <main className="container mx-auto px-6 py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-64 w-full" />
        </main>
      </RoleLayout>
    );
  }

  // Error state
  if (envError || !environment) {
    return (
      <RoleLayout>
        <main className="container mx-auto px-6 py-8">
          <Alert className="bg-red-900/50 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Environment not found or you don&apos;t have access.
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => router.push("/citizen-developer")}
            className="mt-4"
          >
            Back to Workspace
          </Button>
        </main>
      </RoleLayout>
    );
  }

  const icon = environment.platform === "POWERAPPS" ? "⚡" : "🔷";

  return (
    <RoleLayout>
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/citizen-developer">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                </Link>
                <span className="text-2xl">{icon}</span>
                <h1 className="text-2xl font-bold text-white">
                  {environment.name}
                </h1>
              </div>
              <p className="text-slate-400">
                {environment.description ||
                  `${environment.platform} environment`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Apps
              </Button>
              {environment.environmentUrl && (
                <a
                  href={environment.environmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in {environment.platform}
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Environment Info */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Platform</p>
                <p className="text-white font-semibold">
                  {environment.platform}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Status</p>
                <p className="text-green-400 font-semibold">
                  {environment.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Environment ID</p>
                <p className="text-slate-300 text-sm font-mono">
                  {environment.environmentId?.slice(-12)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Linked</p>
                <p className="text-slate-300 text-sm">
                  {formatDistanceToNow(new Date(environment.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <Alert className="bg-blue-500/10 border-blue-500/50 mb-6">
          <Download className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            <strong>Sync apps to LDV-Bridge</strong> to start tracking changes,
            request reviews, and maintain governance. Apps that are already
            synced will show a green checkmark.
          </AlertDescription>
        </Alert>

        {/* Apps in Environment */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Apps in Environment
            </h2>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateApp}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New App
            </Button>
          </div>

          {appsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !platformApps || platformApps.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-12 text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No apps found
                </h3>
                <p className="text-slate-400 mb-6">
                  Create your first app in this environment to get started
                </p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleCreateApp}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create App in {environment.platform}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platformApps.map((app: any) => {
                const appName = app.properties?.displayName || app.name;
                const externalId = app.name; // PowerApps uses 'name' as the unique ID
                const synced = isAppSynced(externalId);
                const isCurrentlySyncing = syncingAppId === externalId;

                return (
                  <Card
                    key={externalId}
                    className={`bg-slate-800 border-slate-700 hover:border-blue-600 transition-colors ${
                      synced ? "border-green-600/50" : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-white">
                              {appName}
                            </h3>
                            {synced && (
                              <Badge
                                variant="outline"
                                className="border-green-600 text-green-400"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Synced
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-400">
                            Modified{" "}
                            {formatDistanceToNow(
                              new Date(
                                app.properties?.lastModifiedTime ||
                                  app.properties?.createdTime
                              ),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {synced ? (
                          <Button
                            className="bg-green-600 hover:bg-green-700 w-full"
                            onClick={() => handleViewApp(externalId)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            View in LDV-Bridge
                          </Button>
                        ) : (
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 w-full"
                            onClick={() => handleSyncApp(externalId, appName)}
                            disabled={isSyncing}
                          >
                            {isCurrentlySyncing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Sync to LDV-Bridge
                              </>
                            )}
                          </Button>
                        )}
                        {app.properties?.appPlayUri && (
                          <a
                            href={app.properties.appPlayUri}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              className="border-slate-600 text-slate-300 hover:text-white bg-transparent w-full"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open App
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Create App Dialog */}
        {environment && (
          <CreatePowerAppsDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            environmentId={environment.environmentId || ""}
            environmentName={environment.name}
          />
        )}
      </main>
    </RoleLayout>
  );
}
