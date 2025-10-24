"use client"

import { useState } from "react"
import Link from "next/link"
import { MainNav } from "@/components/layout/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, AlertCircle, CheckCircle2 } from "lucide-react"

export default function VisualDiffViewer({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("visual")
  const [showAnnotation, setShowAnnotation] = useState(false)

  const navItems = [
    { label: "Review Queue", href: "/pro-developer" },
    { label: "Change History", href: "/pro-developer/history" },
    { label: "CI/CD Pipelines", href: "/pro-developer/pipelines" },
    { label: "Audit Logs", href: "/pro-developer/audit" },
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

      <div className="border-b border-slate-700 bg-slate-800/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/pro-developer">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Queue
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Review: Customer Portal v3.2</h1>
              <p className="text-sm text-slate-400">Submitted by Sarah K. | Risk: High</p>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">Test in Staging</Button>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
                <TabsTrigger value="visual" className="text-slate-300 data-[state=active]:text-white">
                  Visual Diff
                </TabsTrigger>
                <TabsTrigger value="code" className="text-slate-300 data-[state=active]:text-white">
                  Code Diff
                </TabsTrigger>
                <TabsTrigger value="security" className="text-slate-300 data-[state=active]:text-white">
                  Security
                </TabsTrigger>
                <TabsTrigger value="summary" className="text-slate-300 data-[state=active]:text-white">
                  Summary
                </TabsTrigger>
              </TabsList>

              {/* Visual Diff */}
              <TabsContent value="visual" className="mt-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-300 mb-4">Before (Production)</h3>
                        <div className="bg-slate-900 rounded-lg p-6 min-h-64 border border-slate-700 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">📱</div>
                            <p className="text-slate-400 text-sm">Original app state</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-300 mb-4">After (Proposed)</h3>
                        <div className="bg-slate-900 rounded-lg p-6 min-h-64 border border-green-700/50 flex items-center justify-center relative">
                          <div className="absolute top-4 right-4 bg-green-600 text-white text-xs px-2 py-1 rounded">
                            New Button
                          </div>
                          <div className="text-center">
                            <div className="text-4xl mb-2">📱</div>
                            <p className="text-slate-400 text-sm">With export button added</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Annotation */}
                    <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
                      <p className="text-sm text-slate-300 mb-3">
                        <span className="font-semibold">Submit Button:</span> Color changed from #0078D4 to #FF5722
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                        onClick={() => setShowAnnotation(!showAnnotation)}
                      >
                        {showAnnotation ? "Hide" : "Add"} Comment
                      </Button>

                      {showAnnotation && (
                        <div className="mt-4 space-y-3">
                          <Textarea
                            placeholder="Add your comment..."
                            className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Save Comment
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-600 text-slate-300 bg-transparent"
                              onClick={() => setShowAnnotation(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Code Diff */}
              <TabsContent value="code" className="mt-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                      <div className="text-slate-400">
                        <div>
                          {"{"}
                          <div className="ml-4">
                            <span className="text-blue-400">"components"</span>: {"{"}
                            <div className="ml-4">
                              <span className="text-blue-400">"submitButton"</span>: {"{"}
                              <div className="ml-4">
                                <span className="line-through text-red-400">"color": "#0078D4",</span>
                                <br />
                                <span className="text-green-400">"color": "#FF5722",</span>
                                <br />
                                <span className="text-slate-400">"label": "Submit"</span>
                              </div>
                              {"}"}
                            </div>
                            <span className="text-green-400">
                              ,
                              <br />
                              "exportButton": {"{"}
                              <div className="ml-4">
                                <span className="text-blue-400">"type"</span>: "action",
                                <br />
                                <span className="text-blue-400">"label"</span>: "Export Data",
                                <br />
                                <span className="text-blue-400">"icon"</span>: "download"
                              </div>
                              {"}"}
                            </span>
                          </div>
                          {"}"}
                        </div>
                        {"}"}
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-slate-400">
                      <span className="text-green-400">+15 additions</span>
                      <span className="mx-2">-</span>
                      <span className="text-red-400">3 deletions</span>
                      <span className="mx-2">~</span>
                      <span className="text-yellow-400">7 modifications</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Scan */}
              <TabsContent value="security" className="mt-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-400">No Critical Issues Found</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="font-semibold text-yellow-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />2 Warnings
                      </p>
                      <div className="ml-6 space-y-3">
                        <div className="p-3 bg-slate-900 rounded border border-slate-700">
                          <p className="text-sm text-slate-300">New API endpoint has no rate limiting</p>
                          <Button size="sm" variant="link" className="text-blue-400 p-0 h-auto mt-2">
                            View Details
                          </Button>
                        </div>
                        <div className="p-3 bg-slate-900 rounded border border-slate-700">
                          <p className="text-sm text-slate-300">Export button grants download access to all users</p>
                          <Button size="sm" variant="link" className="text-blue-400 p-0 h-auto mt-2">
                            View Policy Recommendation
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-700">
                      <p className="font-semibold text-green-400">Passed Checks (8)</p>
                      <ul className="text-sm text-slate-400 space-y-1 ml-4">
                        <li>✓ No hardcoded secrets</li>
                        <li>✓ SSL certificate valid</li>
                        <li>✓ Input validation present</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Summary */}
              <TabsContent value="summary" className="mt-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-300 mb-2">Changes Summary</p>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>✏️ Modified Components: 3</li>
                        <li>➕ New Components: 1</li>
                        <li>🗑️ Deleted Components: 0</li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-slate-700">
                      <p className="text-sm font-semibold text-slate-300 mb-2">Impact Assessment</p>
                      <div className="space-y-2 text-sm text-slate-400">
                        <p>Affects: 250 daily active users</p>
                        <p>Data access: Low sensitivity</p>
                        <p>Performance impact: Minimal</p>
                        <p className="text-green-400">Compliance: GDPR compliant</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 justify-end">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white bg-transparent">
                Request Changes
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">Approve & Deploy</Button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base">Submitter Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-white">Sarah K.</p>
                  <p className="text-xs text-slate-400">Marketing Manager</p>
                </div>
                <div className="p-3 bg-slate-900 rounded border border-slate-700">
                  <p className="text-xs font-semibold text-slate-300 mb-2">Description:</p>
                  <p className="text-xs text-slate-400">
                    Added export button so managers can download campaign reports to Excel for monthly reviews.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300 mb-2">Sarah's Stats:</p>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>12 previous submissions</li>
                    <li>10 approved (83% rate)</li>
                    <li>Avg approval time: 4 hours</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
