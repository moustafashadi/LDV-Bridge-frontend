"use client";

import { RoleLayout } from "@/components/layout/role-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AuditLogs() {
  const logs = [
    {
      timestamp: "Oct 24, 10:05 AM",
      user: "John M.",
      action: "Approved",
      app: "Customer Portal v3.2",
      details: "Deployed to production",
    },
    {
      timestamp: "Oct 24, 09:30 AM",
      user: "Alice W.",
      action: "Requested Changes",
      app: "Sales Dashboard v2.1",
      details: "Performance issues detected",
    },
    {
      timestamp: "Oct 24, 08:15 AM",
      user: "Bob L.",
      action: "Approved",
      app: "Marketing Tracker v1.9",
      details: "Deployed to production",
    },
  ];

  return (
    <RoleLayout>
      <PageHeader
        title="Audit Logs"
        description="Complete audit trail of all platform activities"
      />

      <main className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <Select defaultValue="30">
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs Table */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-slate-700">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-slate-300">Timestamp</TableHead>
                    <TableHead className="text-slate-300">User</TableHead>
                    <TableHead className="text-slate-300">Action</TableHead>
                    <TableHead className="text-slate-300">App</TableHead>
                    <TableHead className="text-slate-300">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, idx) => (
                    <TableRow
                      key={idx}
                      className="border-b border-slate-700 hover:bg-slate-700/50"
                    >
                      <TableCell className="text-slate-300 text-sm">
                        {log.timestamp}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {log.user}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 text-sm ${
                            log.action === "Approved"
                              ? "text-green-400"
                              : log.action === "Requested Changes"
                              ? "text-yellow-400"
                              : "text-blue-400"
                          }`}
                        >
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {log.app}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {log.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </RoleLayout>
  );
}
