"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Info, Link as LinkIcon } from "lucide-react"
import { useSandboxes } from "@/hooks/use-sandboxes"
import { useMyApps } from "@/lib/hooks/use-app-access"
import { usePowerAppsEnvironments } from "@/hooks/use-connectors"
import { SandboxPlatform, SandboxType } from "@/lib/types/sandboxes"
import { toast } from "sonner"

interface CreateSandboxModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateSandboxModal({ open, onOpenChange, onSuccess }: CreateSandboxModalProps) {
  const { createSandbox, linkExistingEnvironment, loading } = useSandboxes()
  const { data: myApps, isLoading: appsLoading } = useMyApps()
  const { data: powerAppsEnvironments, isLoading: environmentsLoading } = usePowerAppsEnvironments()
  
  const [activeTab, setActiveTab] = useState("link")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    platform: "" as SandboxPlatform | "",
    type: SandboxType.PERSONAL,
    region: "",
    sourceAppId: "", // For cloning
    environmentId: "", // For linking existing
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [cloneInfo, setCloneInfo] = useState<{ count: number; appName: string } | null>(null)

  // Filter synced apps based on selected platform (memoized to prevent infinite loops)
  const syncedApps = useMemo(() => {
    if (!myApps) return []
    return myApps.filter(app => {
      if (!formData.platform) return false
      return app.platform === formData.platform && app.lastSyncedAt
    })
  }, [myApps, formData.platform])

  // Fetch clone count when source app is selected (mock for now - backend will validate)
  useEffect(() => {
    if (formData.sourceAppId && activeTab === "clone") {
      const selectedApp = syncedApps.find((a: any) => a.id === formData.sourceAppId)
      if (selectedApp) {
        setCloneInfo({
          count: 1, // Mock - backend will provide actual count
          appName: selectedApp.name
        })
      }
    } else {
      setCloneInfo(null)
    }
  }, [formData.sourceAppId, activeTab]) // Removed syncedApps from deps

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // For clone tab, name is optional - we'll use the app name if not provided
    if (activeTab === "new" && !formData.name.trim()) {
      newErrors.name = "Sandbox name is required"
    }

    // For link tab, name is required
    if (activeTab === "link" && !formData.name.trim()) {
      newErrors.name = "Sandbox name is required"
    }

    if (!formData.platform) {
      newErrors.platform = "Please select a platform"
    }

    // Clone tab specific validation
    if (activeTab === "clone" && !formData.sourceAppId) {
      newErrors.sourceApp = "Please select an app to clone"
    }

    // Link tab specific validation
    if (activeTab === "link" && !formData.environmentId) {
      newErrors.environment = "Please select an environment to link"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      let sandbox;

      if (activeTab === "link") {
        // Link existing environment
        sandbox = await linkExistingEnvironment({
          name: formData.name,
          description: formData.description || undefined,
          platform: formData.platform as SandboxPlatform,
          environmentId: formData.environmentId,
          type: formData.type,
        });

        if (sandbox) {
          toast.success("Environment linked successfully!", {
            description: `${formData.name} is now available in LDV-Bridge`,
          });
        }
      } else {
        // For cloning, use the source app name if no custom name provided
        let sandboxName = formData.name;
        if (activeTab === "clone" && !sandboxName.trim() && cloneInfo) {
          sandboxName = cloneInfo.appName;
        }

        sandbox = await createSandbox({
          name: sandboxName,
          description: formData.description || undefined,
          platform: formData.platform as SandboxPlatform,
          type: formData.type,
          region: formData.region || undefined,
          sourceAppId: activeTab === "clone" ? formData.sourceAppId : undefined,
        });

        if (sandbox) {
          toast.success("Sandbox created successfully!", {
            description: `${sandboxName} is being provisioned...`,
          });
        }
      }

      if (sandbox) {
        // Reset form
        setFormData({
          name: "",
          description: "",
          platform: "",
          type: SandboxType.PERSONAL,
          region: "",
          sourceAppId: "",
          environmentId: "",
        });
        setErrors({});
        setActiveTab("link");
        
        // Close modal and call success callback
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      toast.error(activeTab === "link" ? "Failed to link environment" : "Failed to create sandbox", {
        description: error instanceof Error ? error.message : "An error occurred",
      });
    }
  }

  const handlePlatformSelect = (platform: SandboxPlatform) => {
    setFormData(prev => ({ ...prev, platform }))
    setErrors(prev => ({ ...prev, platform: "" }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Create New Sandbox</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a new sandbox environment to build and test your low-code applications
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger value="new" className="data-[state=active]:bg-slate-600">
                Create New
              </TabsTrigger>
              <TabsTrigger value="link" className="data-[state=active]:bg-slate-600">
                Link Existing
              </TabsTrigger>
              <TabsTrigger value="clone" className="data-[state=active]:bg-slate-600">
                Clone App
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-4 mt-4">
              {/* Mendix Warning */}
              {formData.platform === SandboxPlatform.MENDIX && (
                <Alert className="bg-amber-500/10 border-amber-500/50">
                  <Info className="h-4 w-4 text-amber-500" />
                  <AlertDescription className="text-amber-200 text-sm">
                    <strong>Note:</strong> Creating new Mendix apps via API may require additional permissions. 
                    We recommend selecting an existing app from the <strong>"Clone Existing"</strong> tab, 
                    which will use that app's free environment as your sandbox.
                  </AlertDescription>
                </Alert>
              )}

              {/* Platform Selection */}
              <div className="space-y-2">
                <Label htmlFor="platform" className="text-slate-200">
                  Platform *
                </Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => handlePlatformSelect(value as SandboxPlatform)}
                >
                  <SelectTrigger 
                    className={`bg-slate-700 border-slate-600 text-white ${errors.platform ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value={SandboxPlatform.POWERAPPS} className="text-white hover:bg-slate-600">
                      ⚡ Microsoft PowerApps
                    </SelectItem>
                    <SelectItem value={SandboxPlatform.MENDIX} className="text-white hover:bg-slate-600">
                      🔷 Mendix
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.platform && (
                  <p className="text-sm text-red-500">{errors.platform}</p>
                )}
              </div>

              {/* Sandbox Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">
                  Sandbox Name *
                </Label>
                <Input
                  id="name"
                  placeholder="My Marketing App"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                    setErrors(prev => ({ ...prev, name: "" }))
                  }}
                  className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-200">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this sandbox will be used for..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-20"
                />
              </div>

              {/* Sandbox Type */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-slate-200">
                  Sandbox Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as SandboxType }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value={SandboxType.PERSONAL} className="text-white hover:bg-slate-600">
                      Personal - For individual development
                    </SelectItem>
                    <SelectItem value={SandboxType.TEAM} className="text-white hover:bg-slate-600">
                      Team - Shared with team members
                    </SelectItem>
                    <SelectItem value={SandboxType.TRIAL} className="text-white hover:bg-slate-600">
                      Trial - Temporary testing environment
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Region (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="region" className="text-slate-200">
                  Region (Optional)
                </Label>
                <Input
                  id="region"
                  placeholder="e.g., us-east-1, westeurope"
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-400">
                  Leave empty to use default region for the selected platform
                </p>
              </div>
            </TabsContent>

            <TabsContent value="link" className="space-y-4 mt-4">
              {/* Info Alert */}
              <Alert className="bg-blue-500/10 border-blue-500/50">
                <LinkIcon className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-200 text-sm">
                  <strong>Link Existing Environment:</strong> Connect your existing PowerApps environment to LDV-Bridge 
                  for tracking and governance. This is <strong>instant</strong> - no provisioning required!
                </AlertDescription>
              </Alert>

              {/* Platform Selection */}
              <div className="space-y-2">
                <Label htmlFor="link-platform" className="text-slate-200">
                  Platform *
                </Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => handlePlatformSelect(value as SandboxPlatform)}
                >
                  <SelectTrigger 
                    className={`bg-slate-700 border-slate-600 text-white ${errors.platform ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value={SandboxPlatform.POWERAPPS} className="text-white hover:bg-slate-600">
                      ⚡ Microsoft PowerApps
                    </SelectItem>
                    <SelectItem value={SandboxPlatform.MENDIX} className="text-white hover:bg-slate-600">
                      🔷 Mendix
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.platform && (
                  <p className="text-sm text-red-500">{errors.platform}</p>
                )}
              </div>

              {/* Environment Selection */}
              {formData.platform === SandboxPlatform.POWERAPPS && (
                <div className="space-y-2">
                  <Label htmlFor="environment" className="text-slate-200">
                    PowerApps Environment *
                  </Label>
                  {environmentsLoading ? (
                    <div className="flex items-center justify-center py-4 bg-slate-700 rounded-md">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                      <span className="ml-2 text-slate-400">Loading environments...</span>
                    </div>
                  ) : powerAppsEnvironments && powerAppsEnvironments.length > 0 ? (
                    <>
                      <Select
                        value={formData.environmentId}
                        onValueChange={(value) => {
                          setFormData(prev => ({ ...prev, environmentId: value }))
                          setErrors(prev => ({ ...prev, environment: "" }))
                          // Auto-fill name from environment if not set
                          const selectedEnv = powerAppsEnvironments.find((env: any) => env.id === value)
                          if (selectedEnv && !formData.name) {
                            setFormData(prev => ({ ...prev, name: selectedEnv.properties?.displayName || selectedEnv.name }))
                          }
                        }}
                      >
                        <SelectTrigger 
                          className={`bg-slate-700 border-slate-600 text-white ${errors.environment ? 'border-red-500' : ''}`}
                        >
                          <SelectValue placeholder="Select an environment" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600 max-h-[200px]">
                          {powerAppsEnvironments.map((env: any) => (
                            <SelectItem key={env.id} value={env.id} className="text-white hover:bg-slate-600">
                              {env.properties?.displayName || env.name}
                              {env.properties?.isDefault && " (Default)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.environment && (
                        <p className="text-sm text-red-500">{errors.environment}</p>
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
              )}

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
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                    setErrors(prev => ({ ...prev, name: "" }))
                  }}
                  className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
                    errors.name ? 'border-red-500' : ''
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
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 min-h-20"
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="link-type" className="text-slate-200">
                  Workspace Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as SandboxType }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value={SandboxType.PERSONAL} className="text-white hover:bg-slate-600">
                      Personal (30 days)
                    </SelectItem>
                    <SelectItem value={SandboxType.TEAM} className="text-white hover:bg-slate-600">
                      Team (60 days)
                    </SelectItem>
                    <SelectItem value={SandboxType.TRIAL} className="text-white hover:bg-slate-600">
                      Trial (90 days)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="clone" className="space-y-4 mt-4">
              {/* Mendix Clone Info */}
              {formData.platform === SandboxPlatform.MENDIX && (
                <Alert className="bg-blue-500/10 border-blue-500/50">
                  <Info className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200 text-sm">
                    <strong>Mendix Sandbox:</strong> This will use the selected app's free environment 
                    as your sandbox. Mendix does not support app cloning via API. To create a true copy, 
                    please duplicate the app in Mendix Portal first.
                  </AlertDescription>
                </Alert>
              )}

              {/* Platform Selection (Clone) */}
              <div className="space-y-2">
                <Label htmlFor="clone-platform" className="text-slate-200">
                  Platform *
                </Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, platform: value as SandboxPlatform, sourceAppId: "" }))
                    setErrors(prev => ({ ...prev, platform: "", sourceApp: "" }))
                  }}
                >
                  <SelectTrigger 
                    className={`bg-slate-700 border-slate-600 text-white ${errors.platform ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value={SandboxPlatform.POWERAPPS} className="text-white hover:bg-slate-600">
                      ⚡ Microsoft PowerApps
                    </SelectItem>
                    <SelectItem value={SandboxPlatform.MENDIX} className="text-white hover:bg-slate-600">
                      🔷 Mendix
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.platform && (
                  <p className="text-sm text-red-500">{errors.platform}</p>
                )}
              </div>

              {/* Source App Selection */}
              <div className="space-y-2">
                <Label htmlFor="source-app" className="text-slate-200">
                  Select App to Clone *
                </Label>
                {appsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : syncedApps.length === 0 ? (
                  <Alert className="bg-slate-700 border-slate-600">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-slate-300">
                      {formData.platform 
                        ? `No synced ${formData.platform} apps available for cloning.`
                        : "Please select a platform first."}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Select
                      value={formData.sourceAppId}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, sourceAppId: value }))
                        setErrors(prev => ({ ...prev, sourceApp: "" }))
                      }}
                      disabled={!formData.platform}
                    >
                      <SelectTrigger 
                        className={`bg-slate-700 border-slate-600 text-white ${errors.sourceApp ? 'border-red-500' : ''}`}
                      >
                        <SelectValue placeholder="Select an app to clone" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {syncedApps.map((app: any) => (
                          <SelectItem 
                            key={app.id} 
                            value={app.id}
                            className="text-white hover:bg-slate-600"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{app.name}</span>
                              <span className="text-xs text-slate-400 ml-2">
                                v{app.version || 'N/A'}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sourceApp && (
                      <p className="text-sm text-red-500">{errors.sourceApp}</p>
                    )}
                  </>
                )}
              </div>

              {/* Clone Info & Preview */}
              {cloneInfo && (
                <div className="space-y-3">
                  <Alert className="bg-slate-700 border-slate-600">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-slate-300">
                      <div className="space-y-1">
                        <div className="font-medium">Clone Information</div>
                        <div className="text-sm text-slate-400">
                          • {cloneInfo.count}/3 clones used for this app
                        </div>
                        <div className="text-sm text-slate-400">
                          • New sandbox will be named: <span className="text-blue-400">
                            "Sandbox - {formData.name.trim() || cloneInfo.appName}"
                          </span>
                        </div>
                        <div className="text-sm text-slate-400">
                          • This will create a complete copy with all components
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {cloneInfo.count >= 2 && (
                    <Alert className="bg-yellow-900/20 border-yellow-600">
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                      <AlertDescription className="text-yellow-200">
                        {cloneInfo.count === 2 
                          ? "You have 1 clone remaining for this app (max 3 per app)." 
                          : "Maximum clone limit reached (3/3). You cannot create more clones of this app."}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Custom Name (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="clone-name" className="text-slate-200">
                      Custom Name (Optional)
                    </Label>
                    <Input
                      id="clone-name"
                      placeholder={cloneInfo.appName}
                      value={formData.name}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }))
                      }}
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    />
                    <p className="text-xs text-slate-400">
                      Leave empty to use the original app name. "Sandbox - " prefix will be added automatically.
                    </p>
                  </div>
                </div>
              )}

              {/* Sandbox Type (Clone) */}
              <div className="space-y-2">
                <Label htmlFor="clone-type" className="text-slate-200">
                  Sandbox Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as SandboxType }))}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value={SandboxType.PERSONAL} className="text-white hover:bg-slate-600">
                      Personal
                    </SelectItem>
                    <SelectItem value={SandboxType.TEAM} className="text-white hover:bg-slate-600">
                      Team
                    </SelectItem>
                    <SelectItem value={SandboxType.TRIAL} className="text-white hover:bg-slate-600">
                      Trial
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Region (Clone - Optional) */}
              <div className="space-y-2">
                <Label htmlFor="clone-region" className="text-slate-200">
                  Region (Optional)
                </Label>
                <Input
                  id="clone-region"
                  placeholder="e.g., us-east-1, westeurope"
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-400">
                  Leave empty to use default region for the selected platform
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {activeTab === "link" ? "Linking..." : activeTab === "clone" ? "Cloning..." : "Creating..."}
                </>
              ) : (
                activeTab === "link" ? "Link Environment" : activeTab === "clone" ? "Clone Sandbox" : "Create Sandbox"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
