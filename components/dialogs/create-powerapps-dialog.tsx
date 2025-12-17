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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { useCreatePowerAppsApp } from "@/hooks/use-connectors";
import { toast } from "sonner";

interface CreatePowerAppsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  environmentId: string;
  environmentName: string;
}

export function CreatePowerAppsDialog({
  open,
  onOpenChange,
  environmentId,
  environmentName,
}: CreatePowerAppsDialogProps) {
  const [appName, setAppName] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [creationResult, setCreationResult] = useState<{
    message: string;
    studioUrl: string;
    instructions: string[];
  } | null>(null);

  const createAppMutation = useCreatePowerAppsApp();

  const handleCreateApp = async () => {
    if (!appName.trim()) {
      toast.error("Please enter an app name");
      return;
    }

    try {
      const result = await createAppMutation.mutateAsync({
        environmentId,
        appName: appName.trim(),
      });

      setCreationResult(result);
      setShowInstructions(true);
    } catch (error: any) {
      toast.error("Failed to initialize app creation", {
        description: error.message,
      });
    }
  };

  const handleClose = () => {
    setAppName("");
    setShowInstructions(false);
    setCreationResult(null);
    onOpenChange(false);
  };

  const handleOpenStudio = () => {
    if (creationResult?.studioUrl) {
      window.open(creationResult.studioUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>
            {showInstructions ? "Create Your Canvas App" : "New Canvas App"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {showInstructions
              ? "Follow these steps to create your app in Power Apps Studio"
              : `Create a new Canvas App in ${environmentName}`}
          </DialogDescription>
        </DialogHeader>

        {!showInstructions ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="appName" className="text-slate-200">
                App Name
              </Label>
              <Input
                id="appName"
                placeholder="e.g., My Business App"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                disabled={createAppMutation.isPending}
              />
            </div>

            <Alert className="bg-blue-950/30 border-blue-900/50">
              <AlertDescription className="text-blue-200 text-sm">
                <strong>Note:</strong> Microsoft doesn't provide a direct API
                for creating Canvas Apps. You'll be guided to create the app in
                Power Apps Studio.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <Alert className="bg-green-950/30 border-green-900/50">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-200 text-sm ml-2">
                {creationResult?.message}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-200">Instructions:</h4>
              <ol className="space-y-2 text-sm text-slate-300">
                {creationResult?.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <p className="text-sm text-slate-400 mb-3">
                Your app name:{" "}
                <span className="text-white font-semibold">{appName}</span>
              </p>
              <Button
                onClick={handleOpenStudio}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Power Apps Studio
              </Button>
            </div>

            <Alert className="bg-slate-700/50 border-slate-600">
              <AlertDescription className="text-slate-300 text-sm">
                After creating your app in Power Apps Studio, return to this
                page and click "Refresh Apps" to see it in your environment.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          {!showInstructions ? (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                disabled={createAppMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateApp}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={createAppMutation.isPending || !appName.trim()}
              >
                {createAppMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Continue
              </Button>
            </>
          ) : (
            <Button
              onClick={handleClose}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
            >
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
