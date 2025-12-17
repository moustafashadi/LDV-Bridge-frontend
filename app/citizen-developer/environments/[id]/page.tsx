"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MainNav } from "@/components/layout/main-nav";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Plus, RefreshCw, ExternalLink } from "lucide-react";
import { useSandboxes } from "@/hooks/use-sandboxes";
import { usePowerAppsApps } from "@/hooks/use-connectors";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { Sandbox } from "@/lib/types/sandboxes";

export default function EnvironmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const environmentId = params.id as string;

  const {
    sandboxes,
    loading: sandboxesLoading,
    fetchMySandboxes,
  } = useSandboxes();
  const [environment, setEnvironment] = useState<Sandbox | null>(null);

  // Get the environment details
  useEffect(() => {
    if (sandboxes.length > 0) {
      const env = sandboxes.find(
        (sb) => sb.id === environmentId && !sb.appId && sb.environmentId
      );
      if (env) {
        setEnvironment(env);
      } else {
        toast.error("Environment not found");
        router.push("/citizen-developer");
      }
    }
  }, [sandboxes, environmentId, router]);

  // Fetch apps from this environment
  const {
    data: apps,
    isLoading: appsLoading,
    refetch: refetchApps,
  } = usePowerAppsApps(environment?.environmentId);

  useEffect(() => {
    fetchMySandboxes();
  }, []);

  const handleRefresh = () => {
    refetchApps();
    toast.success("Apps refreshed");
  };

  const handleSyncApp = async (appId: string) => {
    toast.info("App sync functionality coming soon");
    // TODO: Implement app sync
  };

  const navItems = [
    { label: "My Sandbox", href: "/citizen-developer" },
    { label: "My Changes", href: "/citizen-developer/changes" },
    { label: "Request Review", href: "/citizen-developer/review" },
    { label: "Connectors", href: "/citizen-developer/connectors" },
    { label: "Learning Hub", href: "/citizen-developer/learning" },
  ];

  if (sandboxesLoading || !environment) {
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
        <main className="container mx-auto px-6 py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-64 w-full" />
        </main>
      </>
    );
  }

  const icon = environment.platform === "POWERAPPS" ? "⚡" : "🔷";

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
                <p className="text-green-400 font-semibold">Active</p>
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

        {/* Apps in Environment */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Apps in Environment
            </h2>
            {environment.environmentUrl && (
              <a
                href={environment.environmentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New App
                </Button>
              </a>
            )}
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
          ) : !apps || apps.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-12 text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No apps found
                </h3>
                <p className="text-slate-400 mb-6">
                  Create your first app in this environment to get started
                </p>
                {environment.environmentUrl && (
                  <a
                    href={environment.environmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create App in {environment.platform}
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.map((app: any) => (
                <Card
                  key={app.name}
                  className="bg-slate-800 border-slate-700 hover:border-blue-600 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {app.properties?.displayName || app.name}
                        </h3>
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
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 w-full"
                        onClick={() => handleSyncApp(app.name)}
                      >
                        Sync to LDV-Bridge
                      </Button>
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
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
