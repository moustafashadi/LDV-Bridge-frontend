"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  GitBranch,
  Upload,
  FileCheck,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_TITLE_LENGTH = 75;

// Sync step icons
const STEP_ICONS: Record<number, React.ReactNode> = {
  1: <FileCheck className="w-4 h-4" />,
  2: <GitBranch className="w-4 h-4" />,
  3: <Loader2 className="w-4 h-4" />,
  4: <FileCheck className="w-4 h-4" />,
  5: <Upload className="w-4 h-4" />,
  6: <GitBranch className="w-4 h-4" />,
  7: <Search className="w-4 h-4" />,
  8: <CheckCircle2 className="w-4 h-4" />,
};

interface SyncProgressState {
  step: number;
  totalSteps: number;
  status: "idle" | "pending" | "in-progress" | "completed" | "error";
  message: string;
  details?: string;
}

interface ChangeTitleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appName: string;
  onSubmit: (changeTitle: string) => void;
  isLoading?: boolean;
  error?: string | null;
  sandboxId?: string;
  syncProgress?: SyncProgressState;
}

export function ChangeTitleDialog({
  open,
  onOpenChange,
  appName,
  onSubmit,
  isLoading = false,
  error = null,
  sandboxId,
  syncProgress,
}: ChangeTitleDialogProps) {
  const [title, setTitle] = useState("");

  // Reset title when dialog closes
  useEffect(() => {
    if (!open) {
      setTitle("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && !isLoading) {
      onSubmit(title.trim());
    }
  };

  const handleClose = () => {
    // Only allow closing if not syncing or if sync is complete/errored
    if (
      !isLoading ||
      syncProgress?.status === "completed" ||
      syncProgress?.status === "error"
    ) {
      setTitle("");
      onOpenChange(false);
    }
  };

  const remainingChars = MAX_TITLE_LENGTH - title.length;
  const isValid = title.trim().length > 0 && title.length <= MAX_TITLE_LENGTH;

  // Calculate progress percentage
  const progressPercent = syncProgress?.totalSteps
    ? Math.round((syncProgress.step / syncProgress.totalSteps) * 100)
    : 0;

  // Check if we're in sync mode (loading with progress)
  const isSyncing = isLoading && syncProgress && syncProgress.status !== "idle";
  const isComplete = syncProgress?.status === "completed";
  const hasError = syncProgress?.status === "error" || !!error;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-white">
              {isSyncing ? "Syncing Changes" : "Describe Your Changes"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {isSyncing ? (
                <>
                  Syncing your changes from{" "}
                  <span className="font-semibold text-white">{appName}</span> to
                  GitHub...
                </>
              ) : (
                <>
                  Enter a short title describing what you&apos;ve changed in{" "}
                  <span className="font-semibold text-white">{appName}</span>.
                  This helps track different versions of your work.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {!isSyncing ? (
              // Input phase
              <div className="space-y-2">
                <Label htmlFor="changeTitle" className="text-slate-300">
                  Change Title
                </Label>
                <Input
                  id="changeTitle"
                  placeholder="e.g., Add new login page"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))
                  }
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                  disabled={isLoading}
                  autoFocus
                />
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs ${
                      remainingChars < 10 ? "text-orange-400" : "text-slate-500"
                    }`}
                  >
                    {remainingChars} characters remaining
                  </span>
                </div>
              </div>
            ) : (
              // Progress phase
              <div className="space-y-4">
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span
                      className={cn(
                        "font-medium",
                        isComplete
                          ? "text-green-400"
                          : hasError
                          ? "text-red-400"
                          : "text-blue-400"
                      )}
                    >
                      {progressPercent}%
                    </span>
                  </div>
                  <Progress
                    value={progressPercent}
                    className={cn(
                      "h-2",
                      isComplete && "[&>div]:bg-green-500",
                      hasError && "[&>div]:bg-red-500"
                    )}
                  />
                </div>

                {/* Current step indicator */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    isComplete
                      ? "bg-green-900/20 border-green-800"
                      : hasError
                      ? "bg-red-900/20 border-red-800"
                      : "bg-slate-800/50 border-slate-700"
                  )}
                >
                  <div
                    className={cn(
                      "shrink-0",
                      isComplete
                        ? "text-green-400"
                        : hasError
                        ? "text-red-400"
                        : "text-blue-400 animate-pulse"
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : hasError ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      STEP_ICONS[syncProgress?.step || 1] || (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      )
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "font-medium truncate",
                        isComplete
                          ? "text-green-300"
                          : hasError
                          ? "text-red-300"
                          : "text-white"
                      )}
                    >
                      {syncProgress?.message || "Preparing..."}
                    </p>
                    {syncProgress?.details && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {syncProgress.details}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-xs text-slate-500">
                    Step {syncProgress?.step || 0} of{" "}
                    {syncProgress?.totalSteps || 8}
                  </div>
                </div>

                {/* Step list preview (collapsed) */}
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: syncProgress?.totalSteps || 8 }).map(
                    (_, i) => {
                      const stepNum = i + 1;
                      const isCurrentStep = stepNum === syncProgress?.step;
                      const isPastStep = stepNum < (syncProgress?.step || 0);
                      const isFutureStep = stepNum > (syncProgress?.step || 0);

                      return (
                        <div
                          key={stepNum}
                          className={cn(
                            "h-1.5 rounded-full transition-colors",
                            isPastStep && "bg-green-500",
                            isCurrentStep &&
                              (hasError ? "bg-red-500" : "bg-blue-500"),
                            isFutureStep && "bg-slate-700"
                          )}
                        />
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Error display */}
            {(error || (hasError && syncProgress?.details)) && (
              <div className="mt-4 flex items-start gap-2 p-3 bg-red-900/30 border border-red-800 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-300">
                  {error || syncProgress?.details}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            {!isSyncing || isComplete || hasError ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading && !isComplete && !hasError}
                  className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                >
                  {isComplete || hasError ? "Close" : "Cancel"}
                </Button>
                {!isComplete && !hasError && (
                  <Button
                    type="submit"
                    disabled={!isValid || isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading && !isSyncing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      "Start Sync"
                    )}
                  </Button>
                )}
              </>
            ) : (
              // During sync - show only a cancel option (disabled)
              <Button
                type="button"
                variant="outline"
                disabled
                className="border-slate-600 text-slate-500 bg-transparent cursor-not-allowed"
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
