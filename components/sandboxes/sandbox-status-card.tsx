"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  GitBranch,
  RefreshCw,
  Send,
  Trash2,
  MoreVertical,
  Loader2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  GitMerge,
  Eye,
  Github,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sandboxesApi } from "@/lib/api/sandboxes-api";
import { toast } from "sonner";
import type {
  Sandbox,
  SandboxStatus,
  ConflictStatus,
} from "@/lib/types/sandboxes";
import { ChangeTitleDialog } from "@/components/dialogs/change-title-dialog";
import { useSyncProgress } from "@/hooks/use-sync-progress";

interface SandboxStatusCardProps {
  sandbox: Sandbox;
  appId: string;
  platform: "MENDIX" | "POWERAPPS";
  onViewDetails?: () => void;
}

// Status configuration
const statusConfig: Record<
  string,
  { color: string; icon: React.ReactNode; label: string }
> = {
  ACTIVE: {
    color: "bg-green-600",
    icon: <CheckCircle2 className="w-3 h-3" />,
    label: "Active",
  },
  PENDING_REVIEW: {
    color: "bg-yellow-600",
    icon: <Clock className="w-3 h-3" />,
    label: "Pending Review",
  },
  IN_REVIEW: {
    color: "bg-blue-600",
    icon: <Eye className="w-3 h-3" />,
    label: "In Review",
  },
  APPROVED: {
    color: "bg-green-600",
    icon: <CheckCircle2 className="w-3 h-3" />,
    label: "Approved",
  },
  REJECTED: {
    color: "bg-red-600",
    icon: <XCircle className="w-3 h-3" />,
    label: "Rejected",
  },
  MERGED: {
    color: "bg-purple-600",
    icon: <GitMerge className="w-3 h-3" />,
    label: "Merged",
  },
  CHANGES_REQUESTED: {
    color: "bg-orange-600",
    icon: <AlertTriangle className="w-3 h-3" />,
    label: "Changes Requested",
  },
  ABANDONED: {
    color: "bg-slate-600",
    icon: <Trash2 className="w-3 h-3" />,
    label: "Abandoned",
  },
  PROVISIONING: {
    color: "bg-blue-600",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    label: "Provisioning",
  },
  ERROR: {
    color: "bg-red-600",
    icon: <XCircle className="w-3 h-3" />,
    label: "Error",
  },
};

export function SandboxStatusCard({
  sandbox,
  appId,
  platform,
  onViewDetails,
}: SandboxStatusCardProps) {
  const queryClient = useQueryClient();
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncStarted, setSyncStarted] = useState(false);

  const status = statusConfig[sandbox.status] || statusConfig.ACTIVE;
  const hasConflicts = sandbox.conflictStatus === "NEEDS_RESOLUTION";

  // Sync progress via SSE
  const syncProgress = useSyncProgress({
    sandboxId: sandbox.id,
    enabled: syncStarted && showSyncDialog,
    onComplete: () => {
      // Progress completed - the mutation's onSuccess will handle the rest
    },
    onError: (event) => {
      setSyncError(event.details || event.message);
    },
  });

  // Reset sync state when dialog closes
  useEffect(() => {
    if (!showSyncDialog) {
      setSyncStarted(false);
      syncProgress.reset();
    }
  }, [showSyncDialog]);

  // Sync mutation - routes to correct API based on platform
  const isPowerApps = platform === "POWERAPPS";
  const { mutate: syncSandbox, isPending: isSyncing } = useMutation({
    mutationFn: (changeTitle: string) =>
      isPowerApps
        ? sandboxesApi.syncPowerAppsSandbox(sandbox.id, changeTitle)
        : sandboxesApi.syncSandbox(sandbox.id, changeTitle),
    onMutate: () => {
      // Start listening for progress events when sync begins
      setSyncStarted(true);
    },
    onSuccess: (result) => {
      toast.success("Sync complete!", {
        description: `${result.changesDetected} changes detected. ${
          result.pipelineTriggered ? "Pipeline triggered." : ""
        }`,
      });
      setShowSyncDialog(false);
      setSyncError(null);
      setSyncStarted(false);
      queryClient.invalidateQueries({ queryKey: ["app", appId] });
    },
    onError: (error: any) => {
      setSyncStarted(false);
      if (error.response?.status === 409) {
        setSyncError(
          "A change with this title already exists. Please choose a different title."
        );
      } else {
        setSyncError(
          error.response?.data?.message || error.message || "Sync failed"
        );
      }
    },
  });

  // Submit for review mutation
  const { mutate: submitForReview, isPending: isSubmitting } = useMutation({
    mutationFn: () => sandboxesApi.submitForReview(sandbox.id),
    onSuccess: () => {
      toast.success("Submitted for review!", {
        description: "A Pro Developer will review your changes.",
      });
      queryClient.invalidateQueries({ queryKey: ["app", appId] });
    },
    onError: (error: any) => {
      toast.error("Failed to submit", {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  // Abandon mutation
  const { mutate: abandonSandbox, isPending: isAbandoning } = useMutation({
    mutationFn: () => sandboxesApi.abandonSandbox(sandbox.id),
    onSuccess: () => {
      toast.success("Sandbox abandoned", {
        description: "Branches have been deleted.",
      });
      setShowAbandonDialog(false);
      queryClient.invalidateQueries({ queryKey: ["app", appId] });
    },
    onError: (error: any) => {
      toast.error("Failed to abandon", {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  const canSync = ["ACTIVE", "CHANGES_REQUESTED"].includes(sandbox.status);
  const canSubmit = ["ACTIVE"].includes(sandbox.status);
  const canAbandon = !["MERGED", "ABANDONED"].includes(sandbox.status);

  return (
    <>
      <Card className="bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            {/* Left: Info */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium">{sandbox.name}</span>
                <Badge className={`${status.color} text-white text-xs`}>
                  {status.icon}
                  <span className="ml-1">{status.label}</span>
                </Badge>
                {hasConflicts && (
                  <Badge className="bg-red-600/20 text-red-400 border-red-600/50">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Conflicts
                  </Badge>
                )}
              </div>

              {/* Branch info */}
              <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                {sandbox.mendixBranch && (
                  <span className="flex items-center gap-1">
                    <span className="text-slate-500">Mendix:</span>
                    <code className="text-green-400">
                      {sandbox.mendixBranch}
                    </code>
                  </span>
                )}
                {sandbox.githubBranch && (
                  <span className="flex items-center gap-1">
                    <Github className="w-3 h-3" />
                    <code className="text-purple-400">
                      {sandbox.githubBranch}
                    </code>
                  </span>
                )}
              </div>

              {/* Timestamps */}
              <div className="text-xs text-slate-500">
                Created{" "}
                {formatDistanceToNow(new Date(sandbox.createdAt), {
                  addSuffix: true,
                })}
                {sandbox.metadata?.lastSubmission && (
                  <span className="ml-2">
                    • {sandbox.metadata.lastSubmission.changesDetected} changes
                  </span>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Sync Button */}
              {canSync && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                  onClick={() => setShowSyncDialog(true)}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span className="ml-1">Sync</span>
                </Button>
              )}

              {/* Submit Button */}
              {canSubmit && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={() => submitForReview()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Send className="w-4 h-4 mr-1" />
                  )}
                  Submit
                </Button>
              )}

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700">
                  {onViewDetails && (
                    <DropdownMenuItem
                      className="text-slate-300 hover:text-white hover:bg-slate-700"
                      onClick={onViewDetails}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )}
                  {sandbox.metadata?.lastSubmission?.commitUrl && (
                    <DropdownMenuItem
                      className="text-slate-300 hover:text-white hover:bg-slate-700"
                      onClick={() =>
                        window.open(
                          sandbox.metadata?.lastSubmission?.commitUrl,
                          "_blank"
                        )
                      }
                    >
                      <Github className="w-4 h-4 mr-2" />
                      View on GitHub
                    </DropdownMenuItem>
                  )}
                  {canAbandon && (
                    <>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => setShowAbandonDialog(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Abandon
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Dialog */}
      <ChangeTitleDialog
        open={showSyncDialog}
        onOpenChange={(open) => {
          setShowSyncDialog(open);
          if (!open) {
            setSyncError(null);
            setSyncStarted(false);
          }
        }}
        appName={sandbox.name}
        onSubmit={(title) => syncSandbox(title)}
        isLoading={isSyncing}
        error={syncError}
        sandboxId={sandbox.id}
        syncProgress={
          syncStarted
            ? {
                step: syncProgress.currentStep,
                totalSteps: syncProgress.totalSteps,
                status: syncProgress.status,
                message: syncProgress.message,
                details: syncProgress.details,
              }
            : undefined
        }
      />

      {/* Abandon Confirmation */}
      <AlertDialog open={showAbandonDialog} onOpenChange={setShowAbandonDialog}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Abandon Sandbox?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {isPowerApps
                ? "This will delete the GitHub branch and clean up the dev environment. This action cannot be undone."
                : "This will delete the branches in both Mendix Team Server and GitHub. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-600 text-slate-300 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => abandonSandbox()}
              disabled={isAbandoning}
            >
              {isAbandoning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Abandon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
