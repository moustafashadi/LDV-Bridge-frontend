"use client";

import { useState } from "react";
import Link from "next/link";
import { RoleLayout } from "@/components/layout/role-layout";
import { PageHeader } from "@/components/layout/page-header";
import { RiskIndicator } from "@/components/layout/risk-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";

export default function ProDeveloperDashboard() {
  const [reviews] = useState([
    {
      id: 1,
      priority: "high",
      app: "Customer Portal",
      submitter: "Sarah K.",
      changes: 12,
      risk: "high",
      submitted: "2h ago",
    },
    {
      id: 2,
      priority: "medium",
      app: "Sales Dashboard",
      submitter: "Mike R.",
      changes: 3,
      risk: "low",
      submitted: "5h ago",
    },
    {
      id: 3,
      priority: "low",
      app: "Marketing Tracker",
      submitter: "Emma L.",
      changes: 1,
      risk: "low",
      submitted: "1d ago",
    },
  ]);

  const [activity] = useState([
    {
      user: "Alice",
      action: "Approved",
      app: "Inventory App",
      time: "10 min ago",
    },
    {
      user: "Bob",
      action: "Requested changes",
      app: "Finance Portal",
      time: "1h ago",
    },
    { user: "You", action: "Reviewed", app: "4 apps", time: "Today" },
  ]);

  return (
    <RoleLayout>
      <PageHeader
        title="Review Queue"
        description="7 pending reviews"
        actions={
          <div className="flex gap-2">
            <Select defaultValue="priority">
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="priority">Sort by Priority</SelectItem>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="name">Sort by App Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filter Bar */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <Select defaultValue="all">
                <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Apps</SelectItem>
                  <SelectItem value="powerApps">PowerApps</SelectItem>
                  <SelectItem value="mendix">Mendix</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Review Queue Table */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="border-b border-slate-700">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12">
                          <Checkbox className="border-slate-600" />
                        </TableHead>
                        <TableHead className="text-slate-300">
                          Priority
                        </TableHead>
                        <TableHead className="text-slate-300">
                          App Name
                        </TableHead>
                        <TableHead className="text-slate-300">
                          Submitter
                        </TableHead>
                        <TableHead className="text-slate-300">
                          Changes
                        </TableHead>
                        <TableHead className="text-slate-300">Risk</TableHead>
                        <TableHead className="text-slate-300">
                          Submitted
                        </TableHead>
                        <TableHead className="text-slate-300">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviews.map((review) => (
                        <TableRow
                          key={review.id}
                          className="border-b border-slate-700 hover:bg-slate-700/50"
                        >
                          <TableCell>
                            <Checkbox className="border-slate-600" />
                          </TableCell>
                          <TableCell>
                            <span
                              className={`text-lg ${
                                review.priority === "high"
                                  ? "text-red-400"
                                  : review.priority === "medium"
                                  ? "text-yellow-400"
                                  : "text-green-400"
                              }`}
                            >
                              {review.priority === "high"
                                ? "🔴"
                                : review.priority === "medium"
                                ? "🟡"
                                : "🟢"}
                            </span>
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            {review.app}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {review.submitter}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {review.changes} components
                          </TableCell>
                          <TableCell>
                            <RiskIndicator level={review.risk as any} />
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm">
                            {review.submitted}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {review.risk === "low" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-slate-600 text-slate-300 bg-transparent"
                                >
                                  Quick Approve
                                </Button>
                              )}
                              <Link href={`/pro-developer/review/${review.id}`}>
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Review Now
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Team Activity */}
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white text-base">
                  Team Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activity.map((item, idx) => (
                  <div
                    key={idx}
                    className="pb-4 border-b border-slate-700 last:border-0 last:pb-0"
                  >
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold">[{item.user}]</span>{" "}
                      {item.action} "{item.app}"
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base">
                  Your Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Avg Review Time</p>
                  <p className="text-2xl font-bold text-white">2.5h</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Approval Rate</p>
                  <p className="text-2xl font-bold text-white">78%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Pending Reviews</p>
                  <p className="text-2xl font-bold text-white">7</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </RoleLayout>
  );
}
