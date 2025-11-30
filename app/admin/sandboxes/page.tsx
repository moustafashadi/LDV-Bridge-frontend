"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { MainNav } from "@/components/layout/main-nav";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Filter, RefreshCw, Play, Square, Trash2, Clock, Server } from "lucide-react";
import Link from "next/link";

// Mock data for now - will be replaced with API calls
const mockSandboxes = [
  {
    id: "1",
    name: "PowerApps Dev Environment",
    platform: "POWERAPPS",
    status: "ACTIVE",
    type: "PERSONAL",
    owner: "Sarah K.",
    region: "unitedstates",
    expiresAt: "2025-12-15T10:00:00Z",
    createdAt: "2025-11-01T10:00:00Z",
    resourceUsage: { apps: 3, apiCalls: 1240, storage: 156 },
  },
  {
    id: "2",
    name: "Mendix Trial Sandbox",
    platform: "MENDIX",
    status: "STOPPED",
    type: "TRIAL",
    owner: "John D.",
    region: "us-east-1",
    expiresAt: "2025-12-01T10:00:00Z",
    createdAt: "2025-10-25T10:00:00Z",
    resourceUsage: { apps: 1, apiCalls: 350, storage: 45 },
  },
  {
    id: "3",
    name: "Team Collaboration Space",
    platform: "POWERAPPS",
    status: "ACTIVE",
    type: "TEAM",
    owner: "Admin",
    region: "europe",
    expiresAt: "2026-01-15T10:00:00Z",
    createdAt: "2025-11-10T10:00:00Z",
    resourceUsage: { apps: 8, apiCalls: 5670, storage: 890 },
  },
  {
    id: "4",
    name: "Testing Environment",
    platform: "MENDIX",
    status: "PROVISIONING",
    type: "PERSONAL",
    owner: "Mike T.",
    region: "asia",
    expiresAt: "2025-12-20T10:00:00Z",
    createdAt: "2025-11-25T10:00:00Z",
    resourceUsage: { apps: 0, apiCalls: 0, storage: 0 },
  },
];

const statusColors = {
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  STOPPED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  PROVISIONING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  EXPIRED: "bg-red-500/20 text-red-400 border-red-500/30",
  ERROR: "bg-red-500/20 text-red-400 border-red-500/30",
};

const platformColors = {
  POWERAPPS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  MENDIX: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default function AdminSandboxesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const navItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "Sandboxes", href: "/admin/sandboxes", active: true },
    { label: "Connectors", href: "/admin/connectors" },
    { label: "Policies", href: "/admin/policies" },
    { label: "Compliance", href: "/admin/compliance" },
  ];

  const filteredSandboxes = mockSandboxes.filter((sandbox) => {
    const matchesSearch = sandbox.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sandbox.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === "all" || sandbox.platform === platformFilter;
    const matchesStatus = statusFilter === "all" || sandbox.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const stats = {
    total: mockSandboxes.length,
    active: mockSandboxes.filter(s => s.status === "ACTIVE").length,
    stopped: mockSandboxes.filter(s => s.status === "STOPPED").length,
    provisioning: mockSandboxes.filter(s => s.status === "PROVISIONING").length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return "Expired";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days <= 7) return `${days} days`;
    return date.toLocaleDateString();
  };

  return (
    <>
    
      <MainNav
        title="Admin Portal"
        navItems={navItems}
        userRole="Admin"
        userName="Admin User"
        userInitials="AU"
      />

      <PageHeader
        title="Sandbox Management"
        description="Manage development environments across PowerApps and Mendix"
      />

      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Total Sandboxes</CardDescription>
              <CardTitle className="text-3xl text-white">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Active</CardDescription>
              <CardTitle className="text-3xl text-green-400">{stats.active}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Stopped</CardDescription>
              <CardTitle className="text-3xl text-gray-400">{stats.stopped}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-400">Provisioning</CardDescription>
              <CardTitle className="text-3xl text-blue-400">{stats.provisioning}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="bg-slate-800 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search sandboxes by name or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-full md:w-48 bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="POWERAPPS">PowerApps</SelectItem>
                  <SelectItem value="MENDIX">Mendix</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="STOPPED">Stopped</SelectItem>
                  <SelectItem value="PROVISIONING">Provisioning</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Link href="/admin/sandboxes/create">
                <Button className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Sandbox
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Sandboxes Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Sandboxes</CardTitle>
                <CardDescription>
                  {filteredSandboxes.length} of {mockSandboxes.length} sandboxes
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-slate-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-slate-700/50">
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Platform</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Type</TableHead>
                    <TableHead className="text-slate-300">Owner</TableHead>
                    <TableHead className="text-slate-300">Resources</TableHead>
                    <TableHead className="text-slate-300">Expires</TableHead>
                    <TableHead className="text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSandboxes.map((sandbox) => (
                    <TableRow key={sandbox.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="font-medium text-white">
                        <Link href={`/admin/sandboxes/${sandbox.id}`} className="hover:text-blue-400">
                          {sandbox.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={platformColors[sandbox.platform as keyof typeof platformColors]}>
                          {sandbox.platform}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[sandbox.status as keyof typeof statusColors]}>
                          {sandbox.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">{sandbox.type}</TableCell>
                      <TableCell className="text-slate-300">{sandbox.owner}</TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        <div className="space-y-1">
                          <div>{sandbox.resourceUsage.apps} apps</div>
                          <div className="text-xs">{sandbox.resourceUsage.apiCalls} API calls</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {formatDate(sandbox.expiresAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {sandbox.status === "STOPPED" && sandbox.platform === "MENDIX" && (
                            <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {sandbox.status === "ACTIVE" && sandbox.platform === "MENDIX" && (
                            <Button variant="ghost" size="sm" className="text-yellow-400 hover:text-yellow-300">
                              <Square className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
