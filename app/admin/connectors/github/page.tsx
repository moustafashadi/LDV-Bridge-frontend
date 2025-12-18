"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MainNav } from "@/components/layout/main-nav";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Github,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Unlink,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  useGitHubStatus,
  useDisconnectGitHub,
  useConnectGitHub,
} from "@/lib/hooks/use-github";
import { toast } from "sonner";

export default function GitHubConnectorPage() {
  const searchParams = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: status, isLoading, refetch } = useGitHubStatus();
  const { mutate: disconnectGitHub, isPending: isDisconnecting } =
    useDisconnectGitHub();
  const { mutate: connectGitHub } = useConnectGitHub();

  // Handle callback from GitHub App installation
  useEffect(() => {
    const installationId = searchParams.get("installation_id");
    const callbackStatus = searchParams.get("status");

    if (installationId && callbackStatus === "success" && !status?.connected) {
      setIsConnecting(true);
      toast.info("Connecting GitHub...", { duration: 2000 });

      // Auto-connect using the installation ID
      connectGitHub(
        { installationId },
        {
          onSuccess: () => {
            setIsConnecting(false);
            // Clean up URL params
            window.history.replaceState({}, "", "/admin/connectors/github");
          },
          onError: () => {
            setIsConnecting(false);
          },
        }
      );
    } else if (callbackStatus === "cancelled") {
      toast.error("GitHub installation was cancelled");
      window.history.replaceState({}, "", "/admin/connectors/github");
    }
  }, [searchParams, status?.connected, connectGitHub]);

  const navItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Connectors", href: "/admin/connectors" },
    { label: "Sandboxes", href: "/admin/sandboxes" },
    { label: "Policies", href: "/admin/policies" },
    { label: "Users", href: "/admin/users" },
    { label: "Compliance", href: "/admin/compliance" },
  ];

  const handleConnect = () => {
    // The GitHub App installation URL
    if (status?.installationUrl) {
      window.open(status.installationUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDisconnect = () => {
    if (
      confirm(
        "Are you sure you want to disconnect GitHub? Existing repositories will remain but sync will stop."
      )
    ) {
      disconnectGitHub();
    }
  };

  return (
    <>
      <MainNav
        title="Admin Portal"
        navItems={navItems}
        userRole="Administrator"
        userName="Admin User"
        userInitials="AU"
        notificationCount={3}
      />

      <PageHeader
        title="GitHub Integration"
        description="Connect GitHub for version control and collaborative reviews"
        actions={
          <Link href="/admin/connectors">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
            >
              Back to Connectors
            </Button>
          </Link>
        }
      />

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Connection Status Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Github className="w-6 h-6" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading || isConnecting ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    <span className="text-slate-300">
                      {isConnecting ? "Connecting to GitHub..." : "Loading..."}
                    </span>
                  </div>
                </div>
              ) : status?.connected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-600 text-white">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                    {status.organizationName && (
                      <span className="text-slate-300">
                        Organization:{" "}
                        <strong className="text-white">
                          {status.organizationName}
                        </strong>
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                      onClick={() => refetch()}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Status
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                      onClick={handleDisconnect}
                      disabled={isDisconnecting}
                    >
                      <Unlink className="w-4 h-4 mr-2" />
                      {isDisconnecting ? "Disconnecting..." : "Disconnect"}
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
                  </div>
                  <Button
                    className="bg-[#24292e] hover:bg-[#383f47]"
                    onClick={handleConnect}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Install GitHub App
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* What You Get Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                What GitHub Integration Provides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white">
                      One Repository Per App
                    </strong>
                    <p className="text-sm text-slate-400">
                      Each PowerApps application gets its own private repository
                      to track changes
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white">Human-Readable Diffs</strong>
                    <p className="text-sm text-slate-400">
                      App definitions are extracted as YAML files, making it
                      easy to see what changed
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white">Branch Per Sandbox</strong>
                    <p className="text-sm text-slate-400">
                      When a citizen developer creates a sandbox, a branch is
                      created to track their changes
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-white">
                      Pull Requests for Reviews
                    </strong>
                    <p className="text-sm text-slate-400">
                      Review requests create PRs, so pro-developers can review
                      and merge using familiar tools
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          {!status?.connected && (
            <Alert className="bg-blue-500/10 border-blue-500/50">
              <Github className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                <strong>Setup Instructions:</strong>
                <ol className="mt-2 list-decimal list-inside space-y-1 text-sm">
                  <li>Click &quot;Install GitHub App&quot; above</li>
                  <li>Select your GitHub organization</li>
                  <li>Grant the requested permissions</li>
                  <li>
                    You&apos;ll be redirected back and the connection will be
                    active
                  </li>
                </ol>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </>
  );
}
