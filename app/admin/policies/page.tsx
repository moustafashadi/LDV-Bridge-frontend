"use client";

import { useState, useEffect } from "react";
import { RoleLayout } from "@/components/layout/role-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Power,
  PowerOff,
  Shield,
  CheckCircle,
  FileWarning,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/hooks/use-auth";
import { apiClient } from "@/lib/api/client";

// Types matching backend
interface Policy {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  rules: Record<string, any>;
  isActive: boolean;
  scope?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreatePolicyDto {
  name: string;
  description?: string;
  rules: Record<string, any>;
  scope?: string;
}

// Policy categories for grouping
const POLICY_CATEGORIES = {
  SECURITY: { label: "Security Policies", icon: "🔐", color: "red" },
  APPROVAL: { label: "Approval Workflow Policies", icon: "✅", color: "green" },
  COMPLIANCE: { label: "Compliance Policies", icon: "📋", color: "blue" },
  PERFORMANCE: { label: "Performance Policies", icon: "⚡", color: "yellow" },
};

export default function PolicyConfiguration() {
  const { toast } = useToast();
  const { user } = useAuth();

  // State
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreatePolicyDto>({
    name: "",
    description: "",
    rules: {
      conditions: [],
      actions: [{ type: "WARN", message: "Policy violation detected" }],
    },
    scope: "SECURITY",
  });

  // Rule builder state
  const [newCondition, setNewCondition] = useState({
    field: "",
    operator: "equals",
    value: "",
  });

  // Add condition to rules
  const addCondition = () => {
    if (!newCondition.field) return;
    setFormData({
      ...formData,
      rules: {
        ...formData.rules,
        conditions: [...(formData.rules.conditions || []), { ...newCondition }],
      },
    });
    setNewCondition({ field: "", operator: "equals", value: "" });
  };

  // Remove condition from rules
  const removeCondition = (index: number) => {
    const conditions = [...(formData.rules.conditions || [])];
    conditions.splice(index, 1);
    setFormData({
      ...formData,
      rules: { ...formData.rules, conditions },
    });
  };

  // Update action type
  const updateActionType = (type: string) => {
    setFormData({
      ...formData,
      rules: {
        ...formData.rules,
        actions: [
          {
            type,
            message: `${
              type === "BLOCK"
                ? "Blocked"
                : type === "WARN"
                ? "Warning"
                : "Logged"
            }: Policy violation detected`,
          },
        ],
      },
    });
  };

  // Fetch policies
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Policy[]>("/policies");
      setPolicies(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load policies");
      toast({
        title: "Error",
        description: "Failed to load policies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Create policy
  const handleCreate = async () => {
    try {
      setSaving(true);
      await apiClient.post("/policies", formData);
      toast({
        title: "Success",
        description: "Policy created successfully",
      });
      setCreateDialogOpen(false);
      setFormData({ name: "", description: "", rules: {}, scope: "SECURITY" });
      fetchPolicies();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to create policy",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Update policy
  const handleUpdate = async () => {
    if (!selectedPolicy) return;
    try {
      setSaving(true);
      await apiClient.patch(`/policies/${selectedPolicy.id}`, formData);
      toast({
        title: "Success",
        description: "Policy updated successfully",
      });
      setEditDialogOpen(false);
      setSelectedPolicy(null);
      fetchPolicies();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update policy",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete policy
  const handleDelete = async () => {
    if (!selectedPolicy) return;
    try {
      setSaving(true);
      await apiClient.delete(`/policies/${selectedPolicy.id}`);
      toast({
        title: "Success",
        description: "Policy deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedPolicy(null);
      fetchPolicies();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete policy",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (policy: Policy) => {
    try {
      const endpoint = policy.isActive
        ? `/policies/${policy.id}/deactivate`
        : `/policies/${policy.id}/activate`;
      await apiClient.patch(endpoint);
      toast({
        title: "Success",
        description: `Policy ${policy.isActive ? "deactivated" : "activated"}`,
      });
      fetchPolicies();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to toggle policy status",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (policy: Policy) => {
    setSelectedPolicy(policy);
    // Ensure rules have proper structure
    const rules = policy.rules || {};
    setFormData({
      name: policy.name,
      description: policy.description || "",
      rules: {
        conditions: rules.conditions || [],
        actions: rules.actions || [
          { type: "WARN", message: "Policy violation detected" },
        ],
      },
      scope: policy.scope || "SECURITY",
    });
    setEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (policy: Policy) => {
    setSelectedPolicy(policy);
    setDeleteDialogOpen(true);
  };

  // Group policies by scope
  const groupedPolicies = policies.reduce((acc, policy) => {
    const scope = policy.scope || "SECURITY";
    if (!acc[scope]) acc[scope] = [];
    acc[scope].push(policy);
    return acc;
  }, {} as Record<string, Policy[]>);

  // Get active count per category
  const getActiveCount = (scope: string) => {
    return groupedPolicies[scope]?.filter((p) => p.isActive).length || 0;
  };

  return (
    <RoleLayout>
      <PageHeader
        title="Policy Configuration"
        actions={
          <Button
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            onClick={() => {
              setFormData({
                name: "",
                description: "",
                rules: {},
                scope: "SECURITY",
              });
              setCreateDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add New Policy
          </Button>
        }
      />

      <main className="container mx-auto px-6 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-slate-400">Loading policies...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center py-12 text-red-400">
            <AlertCircle className="w-6 h-6 mr-2" />
            <span>{error}</span>
            <Button variant="outline" className="ml-4" onClick={fetchPolicies}>
              Retry
            </Button>
          </div>
        )}

        {/* Policies List */}
        {!loading && !error && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              {policies.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No policies configured yet.</p>
                  <p className="text-sm">
                    Click "Add New Policy" to create your first policy.
                  </p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {Object.entries(POLICY_CATEGORIES).map(([key, category]) => (
                    <AccordionItem
                      key={key}
                      value={key}
                      className="border-slate-700"
                    >
                      <AccordionTrigger className="text-white hover:text-blue-400">
                        {category.icon} {category.label} ({getActiveCount(key)}{" "}
                        active)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        {(groupedPolicies[key] || []).map((policy) => (
                          <div
                            key={policy.id}
                            className="p-4 bg-slate-900 rounded-lg border border-slate-700"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-white">
                                  {policy.name}
                                </h4>
                                <Badge
                                  variant={
                                    policy.isActive ? "default" : "secondary"
                                  }
                                >
                                  {policy.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={
                                    policy.isActive
                                      ? "text-yellow-400 hover:text-yellow-300"
                                      : "text-green-400 hover:text-green-300"
                                  }
                                  onClick={() => handleToggleActive(policy)}
                                  title={
                                    policy.isActive ? "Deactivate" : "Activate"
                                  }
                                >
                                  {policy.isActive ? (
                                    <PowerOff className="w-4 h-4" />
                                  ) : (
                                    <Power className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-slate-400 hover:text-white"
                                  onClick={() => openEditDialog(policy)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-400 hover:text-red-300"
                                  onClick={() => openDeleteDialog(policy)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm text-slate-300">
                              {policy.description && (
                                <p>
                                  <span className="text-slate-400">
                                    Description:
                                  </span>{" "}
                                  {policy.description}
                                </p>
                              )}
                              <p>
                                <span className="text-slate-400">Rules:</span>{" "}
                                {Object.keys(policy.rules).length > 0
                                  ? `${
                                      Object.keys(policy.rules).length
                                    } rule(s) configured`
                                  : "No rules configured"}
                              </p>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full border-slate-600 text-slate-300 bg-transparent"
                          onClick={() => {
                            setFormData({
                              name: "",
                              description: "",
                              rules: {},
                              scope: key,
                            });
                            setCreateDialogOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add {category.label.replace(" Policies", "")} Policy
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Create Policy Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Create New Policy</DialogTitle>
            <DialogDescription className="text-slate-400">
              Define a new governance policy for your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Policy Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-slate-900 border-slate-600"
                placeholder="e.g., Mandatory Security Scan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-slate-900 border-slate-600"
                placeholder="Describe what this policy does..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scope">Category</Label>
              <Select
                value={formData.scope}
                onValueChange={(value) =>
                  setFormData({ ...formData, scope: value })
                }
              >
                <SelectTrigger className="bg-slate-900 border-slate-600">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(POLICY_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      {category.icon} {category.label.replace(" Policies", "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Type */}
            <div className="space-y-2">
              <Label>Action on Violation</Label>
              <Select
                value={formData.rules.actions?.[0]?.type || "WARN"}
                onValueChange={updateActionType}
              >
                <SelectTrigger className="bg-slate-900 border-slate-600">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="BLOCK">
                    🚫 Block (Stop deployment)
                  </SelectItem>
                  <SelectItem value="WARN">
                    ⚠️ Warn (Allow with warning)
                  </SelectItem>
                  <SelectItem value="LOG">📝 Log (Record only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditions */}
            <div className="space-y-2">
              <Label>Conditions</Label>
              <div className="space-y-2">
                {(formData.rules.conditions || []).map(
                  (cond: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-slate-900 rounded border border-slate-700"
                    >
                      <span className="text-sm text-slate-300 flex-1">
                        {cond.field}{" "}
                        <span className="text-blue-400">{cond.operator}</span>{" "}
                        {cond.value}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400"
                        onClick={() => removeCondition(idx)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Field (e.g., changeType)"
                    value={newCondition.field}
                    onChange={(e) =>
                      setNewCondition({
                        ...newCondition,
                        field: e.target.value,
                      })
                    }
                    className="bg-slate-900 border-slate-600 flex-1"
                  />
                  <Select
                    value={newCondition.operator}
                    onValueChange={(v) =>
                      setNewCondition({ ...newCondition, operator: v })
                    }
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="equals">equals</SelectItem>
                      <SelectItem value="contains">contains</SelectItem>
                      <SelectItem value="startsWith">starts with</SelectItem>
                      <SelectItem value="gt">greater than</SelectItem>
                      <SelectItem value="lt">less than</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Value"
                    value={newCondition.value}
                    onChange={(e) =>
                      setNewCondition({
                        ...newCondition,
                        value: e.target.value,
                      })
                    }
                    className="bg-slate-900 border-slate-600 flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={addCondition}
                    disabled={!newCondition.field}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {(formData.rules.conditions || []).length === 0 && (
                  <p className="text-xs text-slate-500">
                    Add at least one condition for the policy to trigger.
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                saving ||
                !formData.name ||
                (formData.rules.conditions || []).length === 0
              }
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Policy Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Policy</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the policy configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Policy Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-slate-900 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-slate-900 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-scope">Category</Label>
              <Select
                value={formData.scope}
                onValueChange={(value) =>
                  setFormData({ ...formData, scope: value })
                }
              >
                <SelectTrigger className="bg-slate-900 border-slate-600">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(POLICY_CATEGORIES).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      {category.icon} {category.label.replace(" Policies", "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={saving || !formData.name}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Policy</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete "{selectedPolicy?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RoleLayout>
  );
}
