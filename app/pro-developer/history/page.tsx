"use client";

import { RoleLayout } from "@/components/layout/role-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, RotateCcw } from "lucide-react";

export default function ChangeHistory() {
  const changes = [
    {
      date: "Oct 24, 2025",
      time: "10:05 AM",
      action: "Deployed",
      app: "Customer Portal v3.2",
      by: "John M.",
      approved: "Sarah K.",
    },
    {
      date: "Oct 24, 2025",
      time: "09:30 AM",
      action: "Feedback sent",
      app: "Sales Dashboard",
      by: "Alice W.",
      to: "Mike R.",
    },
    {
      date: "Oct 24, 2025",
      time: "08:15 AM",
      action: "Approved",
      app: "Marketing Tracker",
      by: "Bob L.",
      approved: "Emma L.",
    },
  ];

  return (
    <RoleLayout>
      <PageHeader
        title="Change History & Audit Log"
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        }
      />

      <main className="container mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex gap-3 mb-8 flex-wrap">
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
              <SelectItem value="all">All Apps</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {changes.map((change, idx) => (
            <Card key={idx} className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {change.action === "Deployed" && "🚀"}
                        {change.action === "Feedback sent" && "💬"}
                        {change.action === "Approved" && "✅"}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white">
                          {change.time}
                        </p>
                        <span className="text-xs text-slate-500">-</span>
                        <p className="text-sm text-slate-400">{change.date}</p>
                      </div>
                      <p className="text-white mb-2">
                        {change.action === "Deployed" &&
                          `${change.app} Deployed`}
                        {change.action === "Feedback sent" &&
                          `Feedback sent on ${change.app}`}
                        {change.action === "Approved" &&
                          `${change.app} Approved`}
                      </p>
                      <p className="text-sm text-slate-400">
                        {change.action === "Deployed" &&
                          `By: ${change.by} | Approved change by: ${change.approved}`}
                        {change.action === "Feedback sent" &&
                          `By: ${change.by} → ${change.to}`}
                        {change.action === "Approved" &&
                          `By: ${change.by} | Changes by: ${change.approved}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300 bg-transparent"
                    >
                      View Details
                    </Button>
                    {change.action === "Deployed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 bg-transparent"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Rollback
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </RoleLayout>
  );
}
