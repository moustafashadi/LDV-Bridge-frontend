"use client"

import { MainNav } from "@/components/layout/main-nav"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit2, Trash2 } from "lucide-react"

export default function UserManagement() {
  const navItems = [
    { label: "Analytics", href: "/admin" },
    { label: "Policies", href: "/admin/policies" },
    { label: "Connectors", href: "/admin/connectors" },
    { label: "Users", href: "/admin/users" },
    { label: "Compliance", href: "/admin/compliance" },
  ]

  const users = [
    { name: "Sarah K.", email: "sarah@company.com", role: "Citizen Dev", apps: "3 apps", lastActive: "2 hours ago" },
    { name: "John M.", email: "john@company.com", role: "Pro Dev", apps: "All apps", lastActive: "10 min ago" },
    { name: "Alice W.", email: "alice@company.com", role: "Pro Dev", apps: "All apps", lastActive: "1 day ago" },
    { name: "Emma L.", email: "emma@company.com", role: "Citizen Dev", apps: "1 app", lastActive: "3 days ago" },
  ]

  return (
    <>
      <MainNav
        title="Admin Console"
        navItems={navItems}
        userRole="Administrator"
        userName="Admin User"
        userInitials="AU"
      />

      <PageHeader
        title="User Management"
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Invite User
          </Button>
        }
      />

      <main className="container mx-auto px-6 py-8">
        {/* Search & Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="citizen">Citizen Developer</SelectItem>
              <SelectItem value="pro">Pro Developer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-slate-700">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-slate-300">Name</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Role</TableHead>
                    <TableHead className="text-slate-300">App Access</TableHead>
                    <TableHead className="text-slate-300">Last Active</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, idx) => (
                    <TableRow key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-white font-medium">{user.name}</TableCell>
                      <TableCell className="text-slate-300">{user.email}</TableCell>
                      <TableCell className="text-slate-300">{user.role}</TableCell>
                      <TableCell className="text-slate-300">{user.apps}</TableCell>
                      <TableCell className="text-slate-400 text-sm">{user.lastActive}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
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
  )
}
