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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  AlertCircle,
  Info,
  Link as LinkIcon,
  ExternalLink,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { useCreateMendixApp } from "@/lib/hooks/use-app-access";
import { usePowerAppsEnvironments } from "@/hooks/use-connectors";
import { useLinkEnvironment } from "@/lib/hooks/use-linked-environments";
import { toast } from "sonner";

interface CreateSandboxModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateSandboxModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateSandboxModalProps) {
  const { mutate: linkEnvironment, isPending: isLinking } =
    useLinkEnvironment();
  const { data: powerAppsEnvironments, isLoading: environmentsLoading } =
    usePowerAppsEnvironments();

  // Hook for creating new Mendix apps
  const {
    mutate: createMendixApp,
    isPending: isMendixCreating,
    isSuccess: isMendixSuccess,
    data: mendixAppData,
    reset: resetMendixApp,
  } = useCreateMendixApp();

  const [activeTab, setActiveTab] = useState("link");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    environmentId: "", // For linking existing
  });

  // Separate form data for Mendix app creation
  const [mendixAppForm, setMendixAppForm] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Create App tab validation (Mendix only)
    if (activeTab === "create-app") {
      if (!mendixAppForm.name.trim()) {
        newErrors.mendixAppName = "App name is required";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    // For link tab, name is required
    if (activeTab === "link" && !formData.name.trim()) {
      newErrors.name = "Environment name is required";
    }

    // Link tab specific validation - platform is always POWERAPPS
    if (activeTab === "link" && !formData.environmentId) {
      newErrors.environment = "Please select an environment to link";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Handle Create App tab (Mendix only)
    if (activeTab === "create-app") {
      createMendixApp({
        name: mendixAppForm.name.trim(),
        description: mendixAppForm.description.trim() || undefined,
      });
      return;
    }

    try {
      if (activeTab === "link") {
        // Link existing environment - use the new LinkedEnvironment API
        // Get environment details from the selected environment
        const selectedEnv = powerAppsEnvironments?.find(
          (env: any) => env.id === formData.environmentId
        );

        linkEnvironment(
          {
            name: formData.name,
            description: formData.description || undefined,
            platform: "POWERAPPS", // Only PowerApps is supported for linked environments
            environmentId: formData.environmentId,
            environmentUrl: (selectedEnv?.properties as any)
              ?.linkedEnvironmentMetadata?.instanceUrl,
            region: selectedEnv?.location,
          },
          {
            onSuccess: () => {
              toast.success("Environment linked successfully!", {
                description: `${formData.name} is now available in LDV-Bridge`,
              });

              // Reset form
              setFormData({
                name: "",
                description: "",
                environmentId: "",
              });
              setErrors({});
              setActiveTab("link");

              onOpenChange(false);
              onSuccess?.();
            },
            onError: (error) => {
              toast.error("Failed to link environment", {
                description:
                  error instanceof Error ? error.message : "An error occurred",
              });
            },
          }
        );
        return; // Exit early for link tab - mutation handles everything
      }
    } catch (error) {
      toast.error("Failed to link environment", {
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500">
        <style jsx global>{`
          /* Custom scrollbar for this modal */
          .scrollbar-thin::-webkit-scrollbar {
            width: 8px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: rgb(30 41 59); /* slate-800 */
            border-radius: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: rgb(71 85 105); /* slate-600 */
            border-radius: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: rgb(100 116 139); /* slate-500 */
          }
        `}</style>
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            {activeTab === "create-app"
              ? "Create Mendix App"
              : "Link PowerApps Environment"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {activeTab === "create-app"
              ? "Create a new Mendix application with automatic GitHub sync"
              : "Link an existing PowerApps environment to LDV-Bridge"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              // Reset errors when switching tabs
              setErrors({});
              // Reset Mendix app state when switching away
              if (value !== "create-app" && isMendixSuccess) {
                resetMendixApp();
                setMendixAppForm({ name: "", description: "" });
              }
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-slate-700 p-1 relative">
              {/* Sliding background indicator */}
              <div
                className="absolute h-[calc(100%-8px)] top-1 bg-slate-600 rounded-md transition-all duration-300 ease-out"
                style={{
                  width: "calc(50% - 4px)",
                  left: activeTab === "create-app" ? "4px" : "calc(50% + 2px)",
                }}
              />
              <TabsTrigger
                value="create-app"
                className="relative z-10 data-[state=active]:bg-transparent data-[state=active]:text-white transition-colors duration-200"
              >
                <Plus className="w-3 h-3 mr-1" />
                Create Mendix App
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className="relative z-10 data-[state=active]:bg-transparent data-[state=active]:text-white transition-colors duration-200"
              >
                <LinkIcon className="w-3 h-3 mr-1" />
                Link PowerApps
              </TabsTrigger>
            </TabsList>

            {/* Create App Tab - New Mendix apps only */}
            <TabsContent value="create-app" className="space-y-4 mt-4">
              {isMendixSuccess && mendixAppData?.data ? (
                // Success state
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">
                      Mendix app created successfully!
                    </span>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-slate-400">App Name</p>
                      <p className="text-white font-medium">
                        {mendixAppData.data.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">Status</p>
                      <p className="text-white">
                        {mendixAppData.data.status === "synced" &&
                          "✅ Deployed & Synced"}
                        {mendixAppData.data.status === "deployed" &&
                          "✅ Deployed (sync pending)"}
                        {mendixAppData.data.status === "created" &&
                          "⚠️ Created (deployment pending)"}
                      </p>
                    </div>

                    {mendixAppData.data.appUrl && (
                      <div>
                        <p className="text-sm text-slate-400">App URL</p>
                        <a
                          href={mendixAppData.data.appUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          Open App <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {mendixAppData.data.portalUrl && (
                      <div>
                        <p className="text-sm text-slate-400">Mendix Portal</p>
                        <a
                          href={mendixAppData.data.portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          Open in Portal <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {mendixAppData.data.githubRepoUrl && (
                      <div>
                        <p className="text-sm text-slate-400">
                          GitHub Repository
                        </p>
                        <a
                          href={mendixAppData.data.githubRepoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          View Repository <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {mendixAppData.data.syncMessage && (
                      <div>
                        <p className="text-sm text-slate-400">Sync Status</p>
                        <p className="text-slate-300 text-sm">
                          {mendixAppData.data.syncMessage}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={() => {
                        resetMendixApp();
                        setMendixAppForm({ name: "", description: "" });
                      }}
                    >
                      Create Another
                    </Button>
                    <Button
                      type="button"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        resetMendixApp();
                        setMendixAppForm({ name: "", description: "" });
                        onOpenChange(false);
                        onSuccess?.();
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                // Form state
                <>
                  <Alert className="bg-blue-500/10 border-blue-500/50">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-200 text-sm">
                      <strong>Create a new Mendix app</strong> directly from
                      LDV-Bridge. The app will be deployed to the Mendix cloud
                      and synced to your GitHub repository for version control.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="mendix-app-name" className="text-slate-200">
                      App Name *
                    </Label>
                    <Input
                      id="mendix-app-name"
                      placeholder="My New Mendix App"
                      value={mendixAppForm.name}
                      onChange={(e) => {
                        setMendixAppForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }));
                        setErrors((prev) => ({ ...prev, mendixAppName: "" }));
                      }}
                      className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
                        errors.mendixAppName ? "border-red-500" : ""
                      }`}
                      disabled={isMendixCreating}
                    />
                    {errors.mendixAppName && (
                      <p className="text-sm text-red-500">
                        {errors.mendixAppName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="mendix-app-description"
                      className="text-slate-200"
                    >
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="mendix-app-description"
                      placeholder="Describe what this app will be used for..."
                      value={mendixAppForm.description}
                      onChange={(e) =>
                        setMendixAppForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-20"
                      disabled={isMendixCreating}
                    />
                  </div>

                  <Alert className="bg-slate-700/50 border-slate-600">
                    <AlertCircle className="h-4 w-4 text-slate-400" />
                    <AlertDescription className="text-slate-300 text-sm">
                      <strong>What happens when you create an app:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                        <li>
                          A new Mendix project is created via the Build API
                        </li>
                        <li>The app is deployed to the Mendix cloud</li>
                        <li>
                          A GitHub repository is created for version control
                        </li>
                        <li>
                          Initial sync exports your app structure to GitHub
                        </li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </TabsContent>

            <TabsContent value="link" className="space-y-4 mt-4">
              {/* Info Alert */}
              <Alert className="bg-blue-500/10 border-blue-500/50">
                <LinkIcon className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-200 text-sm">
                  <strong>Link PowerApps Environment:</strong> Connect your
                  existing PowerApps environment to LDV-Bridge for tracking and
                  governance. This is <strong>instant</strong> - no provisioning
                  required!
                </AlertDescription>
              </Alert>

              {/* Environment Selection */}
              <div className="space-y-2">
                <Label htmlFor="environment" className="text-slate-200">
                  PowerApps Environment *
                </Label>
                {environmentsLoading ? (
                  <div className="flex items-center justify-center py-4 bg-slate-700 rounded-md">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    <span className="ml-2 text-slate-400">
                      Loading environments...
                    </span>
                  </div>
                ) : powerAppsEnvironments &&
                  powerAppsEnvironments.length > 0 ? (
                  <>
                    <Select
                      value={formData.environmentId}
                      onValueChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          environmentId: value,
                        }));
                        setErrors((prev) => ({ ...prev, environment: "" }));
                        // Auto-fill name from environment if not set
                        const selectedEnv = powerAppsEnvironments.find(
                          (env: any) => env.id === value
                        );
                        if (selectedEnv && !formData.name) {
                          setFormData((prev) => ({
                            ...prev,
                            name:
                              selectedEnv.properties?.displayName ||
                              selectedEnv.name,
                          }));
                        }
                      }}
                    >
                      <SelectTrigger
                        className={`bg-slate-700 border-slate-600 text-white ${
                          errors.environment ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select an environment" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600 max-h-[200px]">
                        {powerAppsEnvironments.map((env: any) => (
                          <SelectItem
                            key={env.id}
                            value={env.id}
                            className="text-white hover:bg-slate-600"
                          >
                            {env.properties?.displayName || env.name}
                            {env.properties?.isDefault && " (Default)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.environment && (
                      <p className="text-sm text-red-500">
                        {errors.environment}
                      </p>
                    )}
                  </>
                ) : (
                  <Alert className="bg-amber-500/10 border-amber-500/50">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-amber-200 text-sm">
                      No PowerApps environments found. Make sure you're connected to PowerApps.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="link-name" className="text-slate-200">
                  Workspace Name *
                </Label>
                <Input
                  id="link-name"
                  placeholder="e.g., My Production Environment"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
                <p className="text-xs text-slate-400">
                  Display name for this workspace in LDV-Bridge
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="link-description" className="text-slate-200">
                  Description
                </Label>
                <Textarea
                  id="link-description"
                  placeholder="What will you use this workspace for?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-20"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Only show footer buttons for non-create-app tabs, or when not in success state */}
          {(activeTab !== "create-app" || !isMendixSuccess) && (
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                disabled={isLinking || isMendixCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLinking || isMendixCreating}
              >
                {isLinking || isMendixCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {activeTab === "create-app"
                      ? "Creating App..."
                      : "Linking..."}
                  </>
                ) : activeTab === "create-app" ? (
                  "Create Mendix App"
                ) : (
                  "Link Environment"
                )}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
