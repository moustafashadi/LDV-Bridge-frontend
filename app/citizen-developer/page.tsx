"use client"

import { useState } from "react"
import Link from "next/link"
import { MainNav } from "@/components/layout/main-nav"
import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/layout/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, HelpCircle } from "lucide-react"

export default function CitizenDeveloperHome() {
  const [apps] = useState([
    {
      id: 1,
      name: "Marketing Campaign Tracker",
      platform: "PowerApps",
      status: "pending",
      lastModified: "2 hours ago",
      icon: "📊",
    },
    {
      id: 2,
      name: "Sales Dashboard",
      platform: "Mendix",
      status: "live",
      lastModified: "1 day ago",
      icon: "📈",
    },
    {
      id: 3,
      name: "Inventory Management",
      platform: "OutSystems",
      status: "draft",
      lastModified: "3 days ago",
      icon: "📦",
    },
  ])

  const [activity] = useState([
    { type: "submitted", app: "Customer Portal v2", time: "2h ago" },
    { type: "approved", app: "Sales Dashboard", time: "1 day ago", reviewer: "John" },
    { type: "comment", app: "Inventory App", time: "2 days ago", team: "DevOps" },
  ])

  const navItems = [
    { label: "My Sandbox", href: "/citizen-developer" },
    { label: "My Changes", href: "/citizen-developer/changes" },
    { label: "Request Review", href: "/citizen-developer/review" },
    { label: "Learning Hub", href: "/citizen-developer/learning" },
  ]

  return (
    <>
      <MainNav
        title="Citizen Developer Portal"
        navItems={navItems}
        userRole="Citizen Developer"
        userName="Sarah K."
        userInitials="SK"
        notificationCount={2}
      />

      <PageHeader
        title="Welcome back, Sarah!"
        description="You have 2 apps in progress"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white bg-transparent">
              View Guides
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Create New App</Button>
          </div>
        }
      />

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Active Apps */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6">My Active Apps</h2>
            <div className="space-y-4">
              {apps.map((app) => (
                <Card key={app.id} className="bg-slate-800 border-slate-700 hover:border-blue-600 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="text-3xl">{app.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{app.name}</h3>
                          <p className="text-sm text-slate-400 mb-3">{app.platform}</p>
                          <div className="flex items-center gap-2">
                            <StatusBadge
                              status={app.status as any}
                              label={
                                app.status === "pending"
                                  ? "Review Pending"
                                  : app.status === "live"
                                    ? "Live in Production"
                                    : "Draft"
                              }
                              icon={app.status === "pending" ? "🟡" : app.status === "live" ? "🟢" : "⚪"}
                            />
                            <span className="text-xs text-slate-500">Last modified {app.lastModified}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link href={`/citizen-developer/sandbox/${app.id}`}>
                          <Button className="bg-blue-600 hover:bg-blue-700">Continue Editing</Button>
                        </Link>
                        {app.status === "pending" && (
                          <Link href={`/citizen-developer/review/${app.id}`}>
                            <Button
                              variant="outline"
                              className="border-slate-600 text-slate-300 hover:text-white w-full bg-transparent"
                            >
                              View Status
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6 space-y-4">
                {activity.map((item, idx) => (
                  <div key={idx} className="flex gap-3 pb-4 border-b border-slate-700 last:border-0 last:pb-0">
                    <div className="text-xl flex-shrink-0">
                      {item.type === "submitted" && "📝"}
                      {item.type === "approved" && "✅"}
                      {item.type === "comment" && "💬"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300">
                        {item.type === "submitted" && `You submitted "${item.app}" for review`}
                        {item.type === "approved" && `"${item.app}" was approved by ${item.reviewer}`}
                        {item.type === "comment" && `New comment on "${item.app}" from ${item.team} team`}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-slate-800 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/citizen-developer/learning">
                  <Button
                    variant="outline"
                    className="w-full border-slate-600 text-slate-300 hover:text-white justify-start bg-transparent"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Learning Hub
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:text-white bg-transparent"
                >
                  Request Help from IT
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
