"use client"

import { useState } from "react"
import { MainNav } from "@/components/layout/main-nav"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, Edit2, Trash2 } from "lucide-react"

export default function PolicyConfiguration() {
  const navItems = [
    { label: "Analytics", href: "/admin" },
    { label: "Policies", href: "/admin/policies" },
    { label: "Connectors", href: "/admin/connectors" },
    { label: "Users", href: "/admin/users" },
    { label: "Compliance", href: "/admin/compliance" },
  ]

  const [policies] = useState([
    {
      id: 1,
      category: "Security",
      name: "Mandatory Security Scan",
      trigger: "All production deployments",
      action: "Block deployment if critical issues found",
      override: "Requires admin approval",
    },
    {
      id: 2,
      category: "Security",
      name: "No Hardcoded Secrets",
      trigger: "All submissions",
      action: "Auto-reject if secrets detected",
      override: "N/A",
    },
    {
      id: 3,
      category: "Approval",
      name: "High-Risk Changes",
      trigger: "Database schema changes OR permission changes",
      action: "Require approval from 2 pro developers",
      override: "Requires admin approval",
    },
    {
      id: 4,
      category: "Compliance",
      name: "GDPR Data Access Control",
      trigger: "Changes to data models, Export/download features",
      action: "Require approval from Legal Team",
      override: "Requires admin approval",
    },
  ])

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
        title="Policy Configuration"
        actions={
          <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Policy
          </Button>
        }
      />

      <main className="container mx-auto px-6 py-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {/* Security Policies */}
              <AccordionItem value="security" className="border-slate-700">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  🔐 Security Policies (2 active)
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {policies
                    .filter((p) => p.category === "Security")
                    .map((policy) => (
                      <div key={policy.id} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-white">{policy.name}</h4>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-slate-300">
                          <p>
                            <span className="text-slate-400">Trigger:</span> {policy.trigger}
                          </p>
                          <p>
                            <span className="text-slate-400">Action:</span> {policy.action}
                          </p>
                          <p>
                            <span className="text-slate-400">Override:</span> {policy.override}
                          </p>
                        </div>
                      </div>
                    ))}
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Security Policy
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Approval Workflow Policies */}
              <AccordionItem value="approval" className="border-slate-700">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  ✅ Approval Workflow Policies (1 active)
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {policies
                    .filter((p) => p.category === "Approval")
                    .map((policy) => (
                      <div key={policy.id} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-white">{policy.name}</h4>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-slate-300">
                          <p>
                            <span className="text-slate-400">Trigger:</span> {policy.trigger}
                          </p>
                          <p>
                            <span className="text-slate-400">Action:</span> {policy.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Workflow Policy
                  </Button>
                </AccordionContent>
              </AccordionItem>

              {/* Compliance Policies */}
              <AccordionItem value="compliance" className="border-slate-700">
                <AccordionTrigger className="text-white hover:text-blue-400">
                  📋 Compliance Policies (1 active)
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {policies
                    .filter((p) => p.category === "Compliance")
                    .map((policy) => (
                      <div key={policy.id} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-white">{policy.name}</h4>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm text-slate-300">
                          <p>
                            <span className="text-slate-400">Trigger:</span> {policy.trigger}
                          </p>
                          <p>
                            <span className="text-slate-400">Action:</span> {policy.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 bg-transparent">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Compliance Policy
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
