"use client";

import { useState, useEffect } from "react";
import { RoleLayout } from "@/components/layout/role-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Search,
  Edit2,
  Loader2,
  Key,
  Users as UsersIcon,
  MoreVertical,
  UserCheck,
  UserX,
  Ban,
  Shield,
  Code,
  Briefcase,
  Laptop,
  X,
  CheckCircle2,
  Settings2,
  Lock,
  Unlock,
  Mail,
  Send,
} from "lucide-react";
import {
  useUsers,
  useCurrentUser,
  useUpdateUserRole,
  useSuspendUser,
  useDeactivateUser,
  useReactivateUser,
  useInviteUser,
} from "@/lib/hooks/use-users";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { formatDistanceToNow } from "date-fns";
import { InvitationCodesSection } from "@/components/users/invitation-codes-section";
import {
  getUserApps,
  getAllApps,
  grantAppAccess,
  revokeAppAccess,
  type UserAppAccess,
  type App,
} from "@/lib/api/apps-api";
import type { User } from "@/lib/api/users-api";
import { toast } from "sonner";

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");

  // Invite user dialog state
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("CITIZEN_DEVELOPER");
  const [inviteMessage, setInviteMessage] = useState("");

  // App access management state
  const [managingAppsUser, setManagingAppsUser] = useState<User | null>(null);
  const [userApps, setUserApps] = useState<UserAppAccess[]>([]);
  const [allApps, setAllApps] = useState<App[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [userAppCounts, setUserAppCounts] = useState<Map<string, number>>(
    new Map()
  );

  // Fetch users from backend
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useUsers({
    page: currentPage,
    limit: 10,
    search: searchQuery || undefined,
    role: roleFilter !== "all" ? (roleFilter as any) : undefined,
  });

  // Get current user for organization ID
  const { data: currentUser } = useCurrentUser();

  // Mutations
  const updateRoleMutation = useUpdateUserRole();
  const suspendMutation = useSuspendUser();
  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();
  const inviteMutation = useInviteUser();

  // Load app counts for all users on page load
  useEffect(() => {
    if (usersData?.data) {
      loadAllUserAppCounts();
    }
  }, [usersData?.data]);

  const loadAllUserAppCounts = async () => {
    if (!usersData?.data) return;

    const counts = new Map<string, number>();

    // Load app counts for citizen developers only
    await Promise.all(
      usersData.data
        .filter((user) => user.role === "CITIZEN_DEVELOPER")
        .map(async (user) => {
          try {
            const response = await getUserApps(user.id);
            counts.set(user.id, response.data.length);
          } catch (error) {
            counts.set(user.id, 0);
          }
        })
    );

    setUserAppCounts(counts);
  };

  // Load apps when managing apps dialog opens
  useEffect(() => {
    if (managingAppsUser) {
      loadUserApps(managingAppsUser.id);
    }
  }, [managingAppsUser]);

  const loadUserApps = async (userId: string) => {
    setLoadingApps(true);
    try {
      const [userAppsResponse, allAppsResponse] = await Promise.all([
        getUserApps(userId),
        getAllApps(),
      ]);

      setUserApps(userAppsResponse.data);
      setAllApps(allAppsResponse.data);

      // Pre-select apps user already has access to
      const userAppIds = new Set(userAppsResponse.data.map((app) => app.id));
      setSelectedApps(userAppIds);
    } catch (error) {
      console.error("Failed to load apps:", error);
    } finally {
      setLoadingApps(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const configs = {
      ADMIN: {
        color: "bg-red-500/10 text-red-400 border-red-500/20",
        icon: Shield,
        label: "Admin",
      },
      PRO_DEVELOPER: {
        color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        icon: Code,
        label: "Pro Developer",
      },
      CITIZEN_DEVELOPER: {
        color: "bg-green-500/10 text-green-400 border-green-500/20",
        icon: Briefcase,
        label: "Citizen Developer",
      },
    };
    return (
      configs[role as keyof typeof configs] || {
        color: "",
        icon: Shield,
        label: role,
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
      PENDING_APPROVAL: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      INACTIVE: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      SUSPENDED: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return colors[status as keyof typeof colors] || "";
  };

  const handleEditRole = (user: User) => {
    setEditingUser(user);
    setSelectedRole(user.role);
  };

  const handleSaveRole = async () => {
    if (!editingUser || !selectedRole) return;

    await updateRoleMutation.mutateAsync({
      id: editingUser.id,
      role: selectedRole as any,
    });
    setEditingUser(null);
    setSelectedRole("");
  };

  const handleSuspend = async (userId: string) => {
    if (confirm("Are you sure you want to suspend this user?")) {
      await suspendMutation.mutateAsync(userId);
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (
      confirm(
        "Are you sure you want to deactivate this user? They will no longer have access."
      )
    ) {
      await deactivateMutation.mutateAsync(userId);
    }
  };

  const handleReactivate = async (userId: string) => {
    await reactivateMutation.mutateAsync(userId);
  };

  const handleInviteUser = () => {
    setShowInviteDialog(true);
  };

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteRole) return;

    await inviteMutation.mutateAsync({
      email: inviteEmail,
      role: inviteRole as any,
      message: inviteMessage || undefined,
    });

    // Reset form and close dialog
    setShowInviteDialog(false);
    setInviteEmail("");
    setInviteRole("CITIZEN_DEVELOPER");
    setInviteMessage("");
    refetch();
  };

  const handleManageApps = (user: User) => {
    setManagingAppsUser(user);
  };

  const handleToggleAppAccess = (appId: string) => {
    setSelectedApps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else {
        newSet.add(appId);
      }
      return newSet;
    });
  };

  const handleSaveAppAccess = async () => {
    if (!managingAppsUser) return;

    const currentUserAppIds = new Set(userApps.map((app) => app.id));
    const appsToGrant = Array.from(selectedApps).filter(
      (id) => !currentUserAppIds.has(id)
    );
    const appsToRevoke = Array.from(currentUserAppIds).filter(
      (id) => !selectedApps.has(id)
    );

    try {
      // Grant new access
      for (const appId of appsToGrant) {
        await grantAppAccess(appId, {
          userIds: [managingAppsUser.id],
          accessLevel: "EDITOR" as any,
        });
      }

      // Revoke removed access
      for (const appId of appsToRevoke) {
        await revokeAppAccess(appId, managingAppsUser.id);
      }

      toast.success("App access updated", {
        description: `Successfully updated access for ${
          managingAppsUser.displayName || managingAppsUser.email
        }`,
      });

      setManagingAppsUser(null);
      refetch();
      // Reload app counts after changes
      loadAllUserAppCounts();
    } catch (error: any) {
      console.error("Failed to update app access:", error);
      toast.error("Failed to update app access", {
        description: error.response?.data?.message || "Please try again",
      });
    }
  };

  return (
    <ProtectedRoute requiredRoles={["ADMIN"]}>
      <RoleLayout>
        <PageHeader
          title="User Management"
          description="Manage users, roles, and invitation codes"
        />

        <main className="container mx-auto px-6 py-8">
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="invitations"
                className="flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Invitation Codes
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              {/* Search & Filters */}
              <div className="flex gap-3 flex-wrap items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="CITIZEN_DEVELOPER">
                      Citizen Developer
                    </SelectItem>
                    <SelectItem value="PRO_DEVELOPER">Pro Developer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  onClick={handleInviteUser}
                >
                  <Plus className="w-4 h-4" />
                  Invite User
                </Button>
              </div>

              {/* Error State */}
              {error && (
                <Card className="bg-red-500/10 border-red-500/20">
                  <CardContent className="p-6">
                    <p className="text-red-400">
                      Failed to load users. Please try again.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Users Table */}
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="border-b border-slate-700">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-slate-300">Name</TableHead>
                          <TableHead className="text-slate-300">
                            Email
                          </TableHead>
                          <TableHead className="text-slate-300">Role</TableHead>
                          <TableHead className="text-slate-300">
                            Status
                          </TableHead>
                          <TableHead className="text-slate-300">
                            App Access
                          </TableHead>
                          <TableHead className="text-slate-300">
                            Last Active
                          </TableHead>
                          <TableHead className="text-slate-300 text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <div className="flex items-center justify-center gap-2 text-slate-400">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Loading users...
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : usersData?.data.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="text-center py-8 text-slate-400"
                            >
                              No users found
                            </TableCell>
                          </TableRow>
                        ) : (
                          usersData?.data.map((user) => {
                            const roleBadge = getRoleBadge(user.role);
                            const RoleIcon = roleBadge.icon;

                            return (
                              <TableRow
                                key={user.id}
                                className="border-b border-slate-700 hover:bg-slate-700/50"
                              >
                                <TableCell className="text-white font-medium">
                                  {user.displayName || user.name || "Unknown"}
                                </TableCell>
                                <TableCell className="text-slate-300">
                                  {user.email}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={roleBadge.color}
                                  >
                                    <RoleIcon className="w-3 h-3 mr-1" />
                                    {roleBadge.label}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={getStatusBadge(user.status)}
                                  >
                                    {user.status.replace("_", " ")}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-400 text-sm">
                                  {user.role === "ADMIN" ||
                                  user.role === "PRO_DEVELOPER" ? (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-2 cursor-help">
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                                              <span className="text-emerald-400 font-medium text-xs">
                                                Unrestricted Access
                                              </span>
                                            </div>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="top"
                                          className="bg-slate-800 border-slate-700"
                                        >
                                          <p className="text-xs">
                                            {user.role === "ADMIN"
                                              ? "Admins"
                                              : "Pro Developers"}{" "}
                                            have access to all apps in the
                                            organization
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-700/50 border border-slate-600/50">
                                        <Laptop className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-slate-300 font-medium text-xs">
                                          {userAppCounts.get(user.id) ?? 0}{" "}
                                          {userAppCounts.get(user.id) === 1
                                            ? "app"
                                            : "apps"}
                                        </span>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleManageApps(user)}
                                        className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 h-auto py-1 px-2 border border-slate-700 hover:border-blue-500/30"
                                      >
                                        <Settings2 className="w-3 h-3 mr-1" />
                                        Manage
                                      </Button>
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-slate-400 text-sm">
                                  {user.lastLoginAt
                                    ? formatDistanceToNow(
                                        new Date(user.lastLoginAt),
                                        { addSuffix: true }
                                      )
                                    : "Never"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-slate-400 hover:text-white"
                                      onClick={() => handleEditRole(user)}
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-slate-400 hover:text-white"
                                        >
                                          <MoreVertical className="w-4 h-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="bg-slate-800 border-slate-700"
                                      >
                                        <DropdownMenuLabel>
                                          Actions
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-slate-700" />
                                        {user.status === "ACTIVE" && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleSuspend(user.id)
                                            }
                                            className="text-yellow-400 focus:text-yellow-300"
                                          >
                                            <Ban className="w-4 h-4 mr-2" />
                                            Suspend User
                                          </DropdownMenuItem>
                                        )}
                                        {(user.status === "INACTIVE" ||
                                          user.status === "SUSPENDED") && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleReactivate(user.id)
                                            }
                                            className="text-green-400 focus:text-green-300"
                                          >
                                            <UserCheck className="w-4 h-4 mr-2" />
                                            Reactivate User
                                          </DropdownMenuItem>
                                        )}
                                        {user.status !== "INACTIVE" && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleDeactivate(user.id)
                                            }
                                            className="text-red-400 focus:text-red-300"
                                          >
                                            <UserX className="w-4 h-4 mr-2" />
                                            Deactivate User
                                          </DropdownMenuItem>
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination */}
              {usersData && usersData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-slate-400 text-sm">
                    Showing {(currentPage - 1) * 10 + 1} to{" "}
                    {Math.min(currentPage * 10, usersData.total)} of{" "}
                    {usersData.total} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(usersData.totalPages, p + 1)
                        )
                      }
                      disabled={currentPage === usersData.totalPages}
                      className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Invitation Codes Tab */}
            <TabsContent value="invitations">
              {currentUser?.organizationId ? (
                <InvitationCodesSection
                  organizationId={currentUser.organizationId}
                />
              ) : (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <p className="text-slate-400">
                      Loading organization information...
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Edit Role Dialog */}
          <Dialog
            open={!!editingUser}
            onOpenChange={(open) => !open && setEditingUser(null)}
          >
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Edit User Role</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Change the role for{" "}
                  {editingUser?.displayName ||
                    editingUser?.name ||
                    editingUser?.email}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger
                      id="role"
                      className="bg-slate-900 border-slate-700"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-red-400" />
                          <span>Admin</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="PRO_DEVELOPER">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-blue-400" />
                          <span>Pro Developer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="CITIZEN_DEVELOPER">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-green-400" />
                          <span>Citizen Developer</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                  className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveRole}
                  disabled={updateRoleMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateRoleMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Manage App Access Dialog */}
          <Dialog
            open={!!managingAppsUser}
            onOpenChange={(open) => !open && setManagingAppsUser(null)}
          >
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Manage App Access</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Select which apps{" "}
                  {managingAppsUser?.displayName ||
                    managingAppsUser?.name ||
                    managingAppsUser?.email}{" "}
                  can access
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {loadingApps ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    <span className="ml-2 text-slate-400">Loading apps...</span>
                  </div>
                ) : allApps.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Laptop className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No apps available in your organization</p>
                    <p className="text-sm mt-2">
                      Create apps first to grant access
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {allApps.map((app) => (
                        <Card
                          key={app.id}
                          className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-colors"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <Checkbox
                                  id={`app-${app.id}`}
                                  checked={selectedApps.has(app.id)}
                                  onCheckedChange={() =>
                                    handleToggleAppAccess(app.id)
                                  }
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <label
                                    htmlFor={`app-${app.id}`}
                                    className="text-sm font-medium text-white cursor-pointer flex items-center gap-2"
                                  >
                                    {app.name}
                                    <Badge
                                      variant="outline"
                                      className={
                                        app.platform === "POWERAPPS"
                                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                      }
                                    >
                                      {app.platform}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className={
                                        app.status === "LIVE"
                                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                                          : app.status === "APPROVED"
                                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                      }
                                    >
                                      {app.status}
                                    </Badge>
                                  </label>
                                  {app.description && (
                                    <p className="text-xs text-slate-400 mt-1">
                                      {app.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setManagingAppsUser(null)}
                  className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAppAccess}
                  disabled={loadingApps}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Access
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Invite User Dialog */}
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-400" />
                  Invite New User
                </DialogTitle>
                <DialogDescription>
                  Send an invitation to a new user to join your organization
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email" className="text-slate-300">
                    Email Address
                  </Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-role" className="text-slate-300">
                    Role
                  </Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger
                      id="invite-role"
                      className="bg-slate-900 border-slate-700 text-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="CITIZEN_DEVELOPER">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>Citizen Developer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="PRO_DEVELOPER">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          <span>Pro Developer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span>Admin</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-message" className="text-slate-300">
                    Welcome Message{" "}
                    <span className="text-slate-500">(Optional)</span>
                  </Label>
                  <Textarea
                    id="invite-message"
                    placeholder="Add a personalized welcome message..."
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowInviteDialog(false)}
                  className="bg-slate-700 border-slate-600 hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendInvite}
                  disabled={
                    !inviteEmail || !inviteRole || inviteMutation.isPending
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {inviteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </RoleLayout>
    </ProtectedRoute>
  );
}
