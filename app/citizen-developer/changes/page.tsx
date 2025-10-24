"use client"

import { MainNav } from "@/components/layout/main-nav"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function MyChanges() {
  const navItems = [
    { label: "My Sandbox", href: "/citizen-developer" },
    { label: "My Changes", href: "/citizen-developer/changes" },
    { label: "Request Review", href: "/citizen-developer/review" },
    { label: "Learning Hub", href: "/citizen-developer/learning" },
  ]

  const changes = [
    {
      app: "Marketing Campaign Tracker",
      status: "pending",
      submitted: "Oct 20, 2:30 PM",
      reviewer: "John M.",
      components: 4,
    },
    {
      app: "Sales Dashboard",
      status: "approved",
      submitted: "Oct 19, 10:15 AM",
      reviewer: "Alice W.",
      components: 3,
    },
    {
      app: "Inventory Management",
      status: "draft",
      submitted: "Oct 18, 3:45 PM",
      reviewer: "-",
      components: 2,
    },
  ]

  return (
    <>
      <MainNav
        title="Citizen Developer Portal"
        navItems={navItems}
        userRole="Citizen Developer"
        userName="Sarah K."
        userInitials="SK"
      />

      <PageHeader title="My Changes" description="Track all your submissions and their status" />

      <main className="container mx-auto px-6 py-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-slate-700">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-slate-300">App Name</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Submitted</TableHead>
                    <TableHead className="text-slate-300">Reviewer</TableHead>
                    <TableHead className="text-slate-300">Components</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changes.map((change, idx) => (
                    <TableRow key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-white font-medium">{change.app}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 text-sm ${
                            change.status === "pending"
                              ? "text-yellow-400"
                              : change.status === "approved"
                                ? "text-green-400"
                                : "text-slate-400"
                          }`}
                        >
                          {change.status === "pending" && "🟡"}
                          {change.status === "approved" && "✅"}
                          {change.status === "draft" && "⚪"}
                          {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-300">{change.submitted}</TableCell>
                      <TableCell className="text-slate-300">{change.reviewer}</TableCell>
                      <TableCell className="text-slate-300">{change.components}</TableCell>
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
