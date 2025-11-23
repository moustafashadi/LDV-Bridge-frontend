"use client"

import { useRouter } from "next/navigation"
import { MainNav } from "@/components/layout/main-nav"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { DemoToastButton } from "@/components/layout/demo-toast-button"

export default function AdminDashboard() {
  const router = useRouter()
  const navItems = [
    { label: "Analytics", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "Join Requests", href: "/admin/join-requests" },
    { label: "Invitation Codes", href: "/admin/invitation-codes" },
    { label: "Policies", href: "/admin/policies" },
    { label: "Connectors", href: "/admin/connectors" },
    { label: "Compliance", href: "/admin/compliance" },
  ]

  const submissionData = [
    { date: "Oct 18", submissions: 12, approvals: 10, rejections: 2 },
    { date: "Oct 19", submissions: 15, approvals: 13, rejections: 2 },
    { date: "Oct 20", submissions: 18, approvals: 15, rejections: 3 },
    { date: "Oct 21", submissions: 14, approvals: 12, rejections: 2 },
    { date: "Oct 22", submissions: 20, approvals: 18, rejections: 2 },
    { date: "Oct 23", submissions: 16, approvals: 14, rejections: 2 },
    { date: "Oct 24", submissions: 19, approvals: 17, rejections: 2 },
  ]

  const platformData = [
    { name: "PowerApps", value: 42 },
    { name: "Mendix", value: 28 },
    { name: "OutSystems", value: 18 },
    { name: "Appian", value: 12 },
  ]

  const reviewPerformance = [
    { name: "John M.", time: 2.5 },
    { name: "Alice W.", time: 3.2 },
    { name: "Bob L.", time: 2.8 },
    { name: "Carol D.", time: 4.1 },
  ]

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"]

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
        title="Analytics Dashboard"
        description="Platform usage, compliance, and team performance"
        actions={<DemoToastButton />}
      />

      <main className="container mx-auto px-6 py-8">
        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-2">Total Apps Under V.C.</p>
              <p className="text-3xl font-bold text-white">47</p>
              <p className="text-xs text-green-400 mt-2">↑ +12 (M/M)</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-2">Active Users</p>
              <p className="text-3xl font-bold text-white">128</p>
              <p className="text-xs text-green-400 mt-2">↑ +23 (M/M)</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-2">Avg Review Time</p>
              <p className="text-3xl font-bold text-white">4.2h</p>
              <p className="text-xs text-green-400 mt-2">↓ -0.5 hrs</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 mb-2">Compliance Score</p>
              <p className="text-3xl font-bold text-white">98%</p>
              <p className="text-xs text-green-400 mt-2">✓ Target Met</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Submissions & Approvals */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Submissions & Approvals (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={submissionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                  <Legend />
                  <Line type="monotone" dataKey="submissions" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="approvals" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="rejections" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Platform Distribution */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Apps by LCNC Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Review Performance */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Review Performance by Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reviewPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis
                  stroke="#94a3b8"
                  label={{ value: "Avg Review Time (hours)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }} />
                <Bar dataKey="time" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alerts */}
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base">Compliance Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded">
                <p className="text-sm text-yellow-400 font-semibold">3 Apps Approaching Policy Violation</p>
                <p className="text-xs text-slate-400 mt-1">
                  Marketing Tracker: 89 days since last security scan (Max: 90)
                </p>
              </div>
              <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded">
                <p className="text-sm text-yellow-400 font-semibold">Missing Data Classification</p>
                <p className="text-xs text-slate-400 mt-1">Finance Portal: Missing data classification tags</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-base">Bottleneck Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-orange-900/20 border border-orange-700/50 rounded">
                <p className="text-sm text-orange-400 font-semibold">Review Bottleneck Detected</p>
                <p className="text-xs text-slate-400 mt-1">John M. has 12 pending reviews (Team avg: 4)</p>
              </div>
              <div className="p-3 bg-orange-900/20 border border-orange-700/50 rounded">
                <p className="text-sm text-orange-400 font-semibold">Connector Downtime</p>
                <p className="text-xs text-slate-400 mt-1">PowerApps connector downtime: 2 hours yesterday</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
