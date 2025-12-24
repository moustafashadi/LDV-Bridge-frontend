"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, GitBranch, Info } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sandboxesApi } from "@/lib/api/sandboxes-api";
import { toast } from "sonner";

interface FeatureSandboxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: string;
  appName: string;
  onSuccess?: () => void;
}

export function FeatureSandboxDialog({
  open,
  onOpenChange,
  appId,
  appName,
  onSuccess,
}: FeatureSandboxDialogProps) {
  const queryClient = useQueryClient();
  const [featureName, setFeatureName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Generate branch name preview
  const branchName = featureName
    ? `feature/${featureName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")}`
    : "";

  const { mutate: createSandbox, isPending } = useMutation({
    mutationFn: () =>
      sandboxesApi.createFeatureSandbox({
        appId,
        featureName,
        description: description || undefined,
      }),
    onSuccess: (sandbox) => {
      // Get the studio URL from sandbox environment metadata
      const environment = (sandbox as any).environment || {};
      const studioUrl = environment.studioUrl || sandbox.metadata?.studioUrl;

      toast.success("Feature branch created!", {
        description: studioUrl
          ? "Opening Mendix Portal to start working on your branch..."
          : `Branch "${sandbox.mendixBranch}" created in Team Server and GitHub.`,
        duration: 5000,
      });

      queryClient.invalidateQueries({ queryKey: ["app", appId] });
      queryClient.invalidateQueries({ queryKey: ["sandboxes"] });
      handleClose();
      onSuccess?.();

      // Redirect to Mendix Portal to open the branch in Studio Pro
      if (studioUrl) {
        // Open in new tab after a short delay to let the toast show
        setTimeout(() => {
          window.open(studioUrl, "_blank");
        }, 500);
      }
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create feature sandbox"
      );
    },
  });

  const handleClose = () => {
    setFeatureName("");
    setDescription("");
    setError(null);
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!featureName.trim()) {
      setError("Feature name is required");
      return;
    }

    if (featureName.length < 3) {
      setError("Feature name must be at least 3 characters");
      return;
    }

    createSandbox();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-400" />
            New Feature
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a feature branch for{" "}
            <strong className="text-white">{appName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="bg-red-500/10 border-red-500/50">
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Info Alert */}
          <Alert className="bg-blue-500/10 border-blue-500/50 [&>svg]:text-blue-400">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-blue-200 text-sm [&>p]:leading-relaxed">
              <p>This will create a branch in both <strong>Mendix Team Server</strong> and <strong>GitHub</strong>. Work in Mendix, then use <strong>Sync</strong> to push your changes to GitHub.</p>
            </AlertDescription>
          </Alert>

          {/* Feature Name */}
          <div className="space-y-2">
            <Label htmlFor="featureName" className="text-slate-200">
              Feature Name *
            </Label>
            <Input
              id="featureName"
              placeholder="e.g., User Dashboard, Payment Integration"
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              autoFocus
            />
          </div>

          {/* Branch Preview */}
          {branchName && (
            <div className="space-y-2">
              <Label className="text-slate-400 text-sm">Branch Names</Label>
              <div className="bg-slate-900 rounded-md p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Mendix:</span>
                  <code className="text-green-400">{branchName}</code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">GitHub:</span>
                  <code className="text-purple-400">
                    sandbox/{branchName.replace("feature/", "")}
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-200">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what this feature will do..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-20"
            />
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !featureName.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <GitBranch className="w-4 h-4 mr-2" />
                  Create Feature Branch
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
