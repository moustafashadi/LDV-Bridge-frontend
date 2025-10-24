"use client"

import { MainNav } from "@/components/layout/main-nav"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Settings, AlertCircle, CheckCircle2 } from "lucide-react"

export default function PlatformConnectors() {
  const navItems = [
    { label: "Analytics", href: "/admin" },
    { label: "Policies", href: "/admin/policies" },
    { label: "Connectors", href: "/admin/connectors" },
    { label: "Users", href: "/admin/users" },
    { label: "Compliance", href: "/admin/compliance" },
  ]

  const connectors = [
    {
      name: "Microsoft PowerApps",
      status: "connected",
      lastSync: "2 min ago",
      apps: 23,
      interval: "Every 5 min",
    },
    {
      name: "Mendix",
      status: "connected",
      lastSync: "10 min ago",
      apps: 15,
      interval: "Every 10 min",
    },
    {
      name: "OutSystems",
      status: "warning",
      lastSync: "2 hours ago",
      issue: "API rate limit reached (resets in 1h)",
      apps: 8,
      interval: "Every 15 min",
    },
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
        title="Platform Connectors"
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Connector
          </Button>
        }
      />

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* LCNC Connectors */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">LCNC Platform Connectors</h2>
            <div className="space-y-4">
              {connectors.map((connector, idx) => (
                <Card key={idx} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-white">{connector.name}</h3>
                          {connector.status === "connected" ? (
                            <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              Connected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-yellow-400 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              Warning
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 text-sm text-slate-400">
                          <p>Last Sync: {connector.lastSync}</p>
                          <p>Apps: {connector.apps}</p>
                          <p>Sync Interval: {connector.interval}</p>
                          {connector.issue && <p className="text-yellow-400">Issue: {connector.issue}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                          <Settings className="w-4 h-4 mr-1" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                          Test Connection
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* DevOps Integrations */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">DevOps Integrations</h2>
            <div className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Git Repository Integration</h3>
                      <p className="text-sm text-green-400 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Connected to GitHub Enterprise
                      </p>
                      <p className="text-sm text-slate-400">Repository: github.company.com/lcnc-apps</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                        Reconfigure
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                        View Repo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">CI/CD Pipeline Integration</h3>
                      <p className="text-sm text-green-400 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Connected to Jenkins
                      </p>
                      <p className="text-sm text-slate-400">Pipeline: lcnc-build-pipeline</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                        Reconfigure
                      </Button>
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 bg-transparent">
                        View Pipeline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
