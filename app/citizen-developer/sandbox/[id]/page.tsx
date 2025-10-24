"use client"

import { useState } from "react"
import Link from "next/link"
import { MainNav } from "@/components/layout/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, RotateCcw, Trash2, CheckCircle } from "lucide-react"

export default function SandboxWorkspace({ params }: { params: { id: string } }) {
  const [changes] = useState([
    { type: "modified", name: "Submit Button", detail: "Color changed" },
    { type: "modified", name: "Email Field", detail: "Validation rule added" },
    { type: "modified", name: "Dashboard Chart", detail: "Filter changed" },
    { type: "added", name: "Export to Excel", detail: "New button component" },
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
      />

      <div className="border-b border-slate-700 bg-slate-800/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/citizen-developer">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to My Apps
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Sandbox: Marketing Campaign Tracker (Draft)</h1>
              <p className="text-sm text-slate-400">Last auto-saved: 2 min ago</p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Your Changes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-300 mb-2">Modified Components (3)</p>
                  <ul className="space-y-1 text-sm text-slate-400">
                    {changes
                      .filter((c) => c.type === "modified")
                      .map((c, i) => (
                        <li key={i}>
                          ✏️ {c.name} → {c.detail}
                        </li>
                      ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-300 mb-2">New Components (1)</p>
                  <ul className="space-y-1 text-sm text-slate-400">
                    {changes
                      .filter((c) => c.type === "added")
                      .map((c, i) => (
                        <li key={i}>➕ {c.name}</li>
                      ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base">What happens next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <span className="text-slate-300">Make changes in sandbox</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-slate-500">→</span>
                  <span className="text-slate-400">Submit for review</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-slate-500">→</span>
                  <span className="text-slate-400">Pro dev approves</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-slate-500">→</span>
                  <span className="text-slate-400">Goes live</span>
                </div>
                <p className="text-xs text-slate-500 mt-4">Your changes are safe here</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">App Preview</CardTitle>
                <CardDescription>Changes are highlighted in yellow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-8 min-h-96 flex items-center justify-center border border-slate-700">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📱</div>
                    <p className="text-slate-400">App preview would render here</p>
                    <p className="text-sm text-slate-500 mt-2">Connected to PowerApps platform</p>
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Open in PowerApps</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Bar */}
            <div className="flex gap-3 justify-between">
              <div className="flex gap-3">
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white bg-transparent">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Undo Last Change
                </Button>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white bg-transparent">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Discard All Changes
                </Button>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Ready to Submit for Review
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
