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
import { Loader2, GitBranch, Info, Cloud } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sandboxesApi } from "@/lib/api/sandboxes-api";
import { toast } from "sonner";

// Validation constants matching backend CreateFeatureSandboxDto
const FEATURE_NAME_MIN_LENGTH = 3;
const FEATURE_NAME_MAX_LENGTH = 50;
const FEATURE_NAME_PATTERN = /^[a-zA-Z0-9\s\-_]+$/;
const DESCRIPTION_MAX_LENGTH = 500;

interface PowerAppsFeatureSandboxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: string;
  appName: string;
  onSuccess?: () => void;
}

export function PowerAppsFeatureSandboxDialog({
  open,
  onOpenChange,
  appId,
  appName,
  onSuccess,
}: PowerAppsFeatureSandboxDialogProps) {
  const queryClient = useQueryClient();
  const [featureName, setFeatureName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{
    featureName?: string;
    description?: string;
  }>({});

  // Generate sandbox name preview
  const sandboxSlug = featureName
    ? featureName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    : "";

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: { featureName?: string; description?: string } = {};

    // Feature name validation
    const trimmedName = featureName.trim();
    if (!trimmedName) {
      newErrors.featureName = "Feature name is required";
    } else if (trimmedName.length < FEATURE_NAME_MIN_LENGTH) {
      newErrors.featureName = `Feature name must be at least ${FEATURE_NAME_MIN_LENGTH} characters`;
    } else if (trimmedName.length > FEATURE_NAME_MAX_LENGTH) {
      newErrors.featureName = `Feature name must be at most ${FEATURE_NAME_MAX_LENGTH} characters`;
    } else if (!FEATURE_NAME_PATTERN.test(trimmedName)) {
      newErrors.featureName =
        "Feature name can only contain letters, numbers, spaces, hyphens, and underscores";
    }

    // Description validation
    if (description && description.length > DESCRIPTION_MAX_LENGTH) {
      newErrors.description = `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { mutate: createSandbox, isPending } = useMutation({
    mutationFn: () =>
      sandboxesApi.createPowerAppsFeatureSandbox({
        appId,
        featureName: featureName.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: (sandbox) => {
      // Get the studio URL from sandbox environment metadata
      const environment = (sandbox as any).environment || {};
      const studioUrl = environment.studioUrl;

      toast.success("PowerApps sandbox created!", {
        description: studioUrl
          ? "Opening Power Apps Studio to work on your sandbox app..."
          : `Sandbox "${sandbox.name}" created with dev environment and GitHub branch.`,
        duration: 5000,
      });

      queryClient.invalidateQueries({ queryKey: ["app", appId] });
      queryClient.invalidateQueries({ queryKey: ["sandboxes"] });
      handleClose();
      onSuccess?.();

      // Redirect to Power Apps Studio to edit the copied app
      if (studioUrl) {
        setTimeout(() => {
          window.open(studioUrl, "_blank");
        }, 500);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create PowerApps sandbox";
      if (Array.isArray(errorMessage)) {
        setErrors({ featureName: errorMessage.join(", ") });
      } else {
        setErrors({ featureName: errorMessage });
      }
    },
  });

  const handleClose = () => {
    setFeatureName("");
    setDescription("");
    setErrors({});
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    createSandbox();
  };

  // Real-time validation feedback
  const handleFeatureNameChange = (value: string) => {
    setFeatureName(value);
    if (errors.featureName) {
      setErrors((prev) => ({ ...prev, featureName: undefined }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
  };

  // Calculate remaining characters
  const featureNameRemaining = FEATURE_NAME_MAX_LENGTH - featureName.length;
  const descriptionRemaining = DESCRIPTION_MAX_LENGTH - description.length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            <Cloud className="w-5 h-5 text-purple-400" />
            New PowerApps Feature
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a feature sandbox for{" "}
            <strong className="text-white">{appName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info Alert */}
          <Alert className="bg-purple-500/10 border-purple-500/50 [&>svg]:text-purple-400">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-purple-200 text-sm [&>p]:leading-relaxed">
              <p>
                This will create a <strong>dev environment</strong> with a copy
                of your app and a <strong>GitHub branch</strong> for version
                control. Work on the copied app, then use <strong>Sync</strong>{" "}
                to push your changes.
              </p>
            </AlertDescription>
          </Alert>

          {/* Feature Name */}
          <div className="space-y-2">
            <Label htmlFor="featureName" className="text-slate-200">
              Feature Name *
            </Label>
            <Input
              id="featureName"
              placeholder="e.g., User Dashboard, Payment Form"
              value={featureName}
              onChange={(e) => handleFeatureNameChange(e.target.value)}
              className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
                errors.featureName ? "border-red-500 focus:border-red-500" : ""
              }`}
              maxLength={FEATURE_NAME_MAX_LENGTH}
              autoFocus
            />
            <div className="flex justify-between items-center">
              {errors.featureName ? (
                <p className="text-sm text-red-400">{errors.featureName}</p>
              ) : (
                <p className="text-xs text-slate-500">
                  Letters, numbers, spaces, hyphens, and underscores only
                </p>
              )}
              <span
                className={`text-xs ${
                  featureNameRemaining < 10
                    ? "text-amber-400"
                    : "text-slate-500"
                }`}
              >
                {featureNameRemaining} chars left
              </span>
            </div>
          </div>

          {/* Sandbox Preview */}
          {sandboxSlug && (
            <div className="space-y-2">
              <Label className="text-slate-400 text-sm">
                What will be created
              </Label>
              <div className="bg-slate-900 rounded-md p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Cloud className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-500">Dev Environment:</span>
                  <code className="text-purple-400">
                    Dev-{featureName.substring(0, 30)}
                  </code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 ml-6">Copied App:</span>
                  <code className="text-green-400">
                    {appName}-{featureName}
                  </code>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <GitBranch className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-500">GitHub Branch:</span>
                  <code className="text-blue-400">sandbox/{sandboxSlug}</code>
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
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-20 ${
                errors.description ? "border-red-500 focus:border-red-500" : ""
              }`}
              maxLength={DESCRIPTION_MAX_LENGTH}
            />
            <div className="flex justify-between items-center">
              {errors.description ? (
                <p className="text-sm text-red-400">{errors.description}</p>
              ) : (
                <span />
              )}
              <span
                className={`text-xs ${
                  descriptionRemaining < 50
                    ? "text-amber-400"
                    : "text-slate-500"
                }`}
              >
                {descriptionRemaining} chars left
              </span>
            </div>
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
              disabled={
                isPending ||
                !featureName.trim() ||
                featureName.trim().length < FEATURE_NAME_MIN_LENGTH
              }
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 mr-2" />
                  Create Sandbox
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
