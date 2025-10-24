"use client"

import { MainNav } from "@/components/layout/main-nav"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CICDPipelines() {
  const navItems = [
    { label: "Review Queue", href: "/pro-developer" },
    { label: "Change History", href: "/pro-developer/history" },
    { label: "CI/CD Pipelines", href: "/pro-developer/pipelines" },
    { label: "Audit Logs", href: "/pro-developer/audit" },
  ]

  const pipelines = [
    {
      app: "Customer Portal",
      version: "v3.2",
      status: "passed",
      duration: "3m 42s",
      triggered: "John M.",
      time: "10:05 AM",
    },
    {
      app: "Sales Dashboard",
      version: "v2.1",
      status: "failed",
      duration: "2m 18s",
      triggered: "Alice W.",
      time: "09:30 AM",
    },
    {
      app: "Marketing Tracker",
      version: "v1.9",
      status: "passed",
      duration: "4m 05s",
      triggered: "Scheduled",
      time: "08:00 AM",
    },
  ]

  return (
    <>
      <MainNav
        title="Professional Developer Dashboard"
        navItems={navItems}
        userRole="Professional Developer"
        userName="John M."
        userInitials="JM"
      />

      <PageHeader
        title="CI/CD Pipeline Dashboard"
        description="Monitor automated build, test, and deployment pipelines"
      />

      <main className="container mx-auto px-6 py-8">
        {/* Featured Pipeline */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Customer Portal - v3.2 Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-green-400">Passed</p>
                  <p className="text-sm text-slate-400">5 min ago | Duration: 3m 42s</p>
                </div>
              </div>
            </div>

            {/* Pipeline Steps */}
            <div className="flex items-center justify-between gap-2 py-4 px-4 bg-slate-900 rounded-lg">
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xl">✅</span>
                <span className="text-xs text-slate-400">Build</span>
              </div>
              <div className="flex-1 h-1 bg-green-600"></div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xl">✅</span>
                <span className="text-xs text-slate-400">Test</span>
              </div>
              <div className="flex-1 h-1 bg-green-600"></div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xl">⚠️</span>
                <span className="text-xs text-slate-400">Security</span>
              </div>
              <div className="flex-1 h-1 bg-green-600"></div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-xl">✅</span>
                <span className="text-xs text-slate-400">Deploy</span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm text-slate-300">
              <p>Build: Artifacts packaged successfully</p>
              <p>Test: 47/47 tests passed</p>
              <p className="text-yellow-400">Security Scan: 2 warnings (non-blocking)</p>
              <p>Deploy: Deployed to production (10:05 AM)</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                View Full Logs
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                Re-run Pipeline
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Pipelines */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Pipeline Runs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-slate-700">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-slate-300">App</TableHead>
                    <TableHead className="text-slate-300">Version</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Duration</TableHead>
                    <TableHead className="text-slate-300">Triggered By</TableHead>
                    <TableHead className="text-slate-300">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pipelines.map((pipeline, idx) => (
                    <TableRow key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="text-white font-medium">{pipeline.app}</TableCell>
                      <TableCell className="text-slate-300">{pipeline.version}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 ${
                            pipeline.status === "passed" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {pipeline.status === "passed" ? "✅" : "❌"}{" "}
                          {pipeline.status === "passed" ? "Passed" : "Failed"}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-300">{pipeline.duration}</TableCell>
                      <TableCell className="text-slate-300">{pipeline.triggered}</TableCell>
                      <TableCell className="text-slate-400 text-sm">{pipeline.time}</TableCell>
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
