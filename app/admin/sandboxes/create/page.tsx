"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoleLayout } from "@/components/layout/role-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useSandboxes } from "@/hooks/use-sandboxes";
import { SandboxPlatform, SandboxType } from "@/lib/types/sandboxes";
import { ChevronLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function CreateSandboxPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { createSandbox, checkQuota, loading, error } = useSandboxes();

  const [isCreating, setIsCreating] = useState(false);
  const [provisioningStatus, setProvisioningStatus] = useState<string | null>(
    null
  );
  const [quotaInfo, setQuotaInfo] = useState<{
    canCreate: boolean;
    currentCount: number;
    maxAllowed: number;
    reason?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    platform: "",
    type: "",
    region: "",
    expirationDays: "30",
  });

  // Check quota on mount
  useEffect(() => {
    loadQuotaInfo();
  }, []);

  const loadQuotaInfo = async () => {
    const quota = await checkQuota();
    setQuotaInfo(quota);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check quota before creating
    if (quotaInfo && !quotaInfo.canCreate) {
      toast({
        title: "Quota Limit Reached",
        description:
          quotaInfo.reason ||
          "You have reached the maximum number of sandboxes",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    setProvisioningStatus("Preparing sandbox...");

    try {
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(
        expiresAt.getDate() + parseInt(formData.expirationDays)
      );

      // Create sandbox
      const sandbox = await createSandbox({
        name: formData.name,
        description: formData.description || undefined,
        platform: formData.platform as SandboxPlatform,
        type: formData.type as SandboxType,
        region: formData.region || undefined,
        expiresAt: expiresAt.toISOString(),
      });

      if (sandbox) {
        setProvisioningStatus("Sandbox created! Provisioning environment...");

        toast({
          title: "Success",
          description:
            "Sandbox created successfully. Environment is being provisioned.",
        });

        // Redirect to sandbox detail page after short delay
        setTimeout(() => {
          router.push(`/admin/sandboxes/${sandbox.id}`);
        }, 2000);
      } else {
        throw new Error("Failed to create sandbox");
      }
    } catch (err) {
      console.error("Failed to create sandbox:", err);
      toast({
        title: "Error",
        description: error || "Failed to create sandbox. Please try again.",
        variant: "destructive",
      });
      setProvisioningStatus(null);
    } finally {
      setIsCreating(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    formData.name && formData.platform && formData.type && formData.region;
  const canSubmit =
    isFormValid && !isCreating && (!quotaInfo || quotaInfo.canCreate);

  return (
    <RoleLayout>
      <PageHeader
        title="Create New Sandbox"
        description="Provision a new development environment"
      />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/admin/sandboxes">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Sandboxes
            </Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {quotaInfo && !quotaInfo.canCreate && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {quotaInfo.reason ||
                `Quota limit reached: ${quotaInfo.currentCount} of ${quotaInfo.maxAllowed} sandboxes used`}
            </AlertDescription>
          </Alert>
        )}

        {quotaInfo && quotaInfo.canCreate && (
          <Alert className="mb-6 bg-blue-500/10 border-blue-500/30">
            <CheckCircle2 className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-400">
              {quotaInfo.currentCount} of {quotaInfo.maxAllowed} sandboxes used.
              You can create {quotaInfo.maxAllowed - quotaInfo.currentCount}{" "}
              more.
            </AlertDescription>
          </Alert>
        )}

        {provisioningStatus && (
          <Alert className="mb-6 bg-green-500/10 border-green-500/30">
            <Loader2 className="h-4 w-4 text-green-400 animate-spin" />
            <AlertDescription className="text-green-400">
              {provisioningStatus}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
                <CardDescription>
                  Provide basic details about the sandbox
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300">
                    Sandbox Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., PowerApps Dev Environment"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose of this sandbox..."
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    className="bg-slate-900 border-slate-700 text-white min-h-24"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Platform Configuration */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Platform Configuration
                </CardTitle>
                <CardDescription>
                  Select the platform and environment settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform" className="text-slate-300">
                      Platform *
                    </Label>
                    <Select
                      value={formData.platform}
                      onValueChange={(value) => handleChange("platform", value)}
                    >
                      <SelectTrigger
                        id="platform"
                        className="bg-slate-900 border-slate-700 text-white"
                      >
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="POWERAPPS">PowerApps</SelectItem>
                        <SelectItem value="MENDIX">Mendix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-slate-300">
                      Sandbox Type *
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleChange("type", value)}
                    >
                      <SelectTrigger
                        id="type"
                        className="bg-slate-900 border-slate-700 text-white"
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERSONAL">Personal</SelectItem>
                        <SelectItem value="TEAM">Team</SelectItem>
                        <SelectItem value="TRIAL">Trial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region" className="text-slate-300">
                    Region *
                  </Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => handleChange("region", value)}
                  >
                    <SelectTrigger
                      id="region"
                      className="bg-slate-900 border-slate-700 text-white"
                    >
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.platform === "POWERAPPS" && (
                        <>
                          <SelectItem value="unitedstates">
                            United States
                          </SelectItem>
                          <SelectItem value="europe">Europe</SelectItem>
                          <SelectItem value="asia">Asia</SelectItem>
                          <SelectItem value="australia">Australia</SelectItem>
                          <SelectItem value="canada">Canada</SelectItem>
                        </>
                      )}
                      {formData.platform === "MENDIX" && (
                        <>
                          <SelectItem value="us-east-1">
                            US East (Virginia)
                          </SelectItem>
                          <SelectItem value="eu-west-1">
                            EU West (Ireland)
                          </SelectItem>
                          <SelectItem value="ap-southeast-1">
                            Asia Pacific (Singapore)
                          </SelectItem>
                          <SelectItem value="ap-northeast-1">
                            Asia Pacific (Tokyo)
                          </SelectItem>
                        </>
                      )}
                      {!formData.platform && (
                        <SelectItem value="" disabled>
                          Select a platform first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Expiration Settings */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Expiration Settings
                </CardTitle>
                <CardDescription>Configure automatic cleanup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="expirationDays" className="text-slate-300">
                    Expiration Period
                  </Label>
                  <Select
                    value={formData.expirationDays}
                    onValueChange={(value) =>
                      handleChange("expirationDays", value)
                    }
                  >
                    <SelectTrigger
                      id="expirationDays"
                      className="bg-slate-900 border-slate-700 text-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days (1 week)</SelectItem>
                      <SelectItem value="14">14 days (2 weeks)</SelectItem>
                      <SelectItem value="30">30 days (1 month)</SelectItem>
                      <SelectItem value="60">60 days (2 months)</SelectItem>
                      <SelectItem value="90">90 days (3 months)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-500">
                    Sandbox will be automatically deleted after this period. You
                    can extend later.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Resource Quotas Info */}
            <Card className="bg-slate-800 border-slate-700 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white text-base">
                  Resource Quotas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {formData.type === "PERSONAL" && (
                  <div className="space-y-2">
                    <p className="text-slate-300 font-semibold">
                      Personal Sandbox Limits:
                    </p>
                    <ul className="space-y-1 text-slate-400">
                      <li>• Maximum 3 apps</li>
                      <li>• 10,000 API calls per day</li>
                      <li>• 500 MB storage</li>
                    </ul>
                  </div>
                )}
                {formData.type === "TEAM" && (
                  <div className="space-y-2">
                    <p className="text-slate-300 font-semibold">
                      Team Sandbox Limits:
                    </p>
                    <ul className="space-y-1 text-slate-400">
                      <li>• Maximum 10 apps</li>
                      <li>• 50,000 API calls per day</li>
                      <li>• 2 GB storage</li>
                    </ul>
                  </div>
                )}
                {formData.type === "TRIAL" && (
                  <div className="space-y-2">
                    <p className="text-slate-300 font-semibold">
                      Trial Sandbox Limits:
                    </p>
                    <ul className="space-y-1 text-slate-400">
                      <li>• Maximum 1 app</li>
                      <li>• 1,000 API calls per day</li>
                      <li>• 100 MB storage</li>
                      <li>• Limited to 30 days</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <Link href="/admin/sandboxes">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:text-white"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Sandbox...
                  </>
                ) : (
                  "Create Sandbox"
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </RoleLayout>
  );
}
