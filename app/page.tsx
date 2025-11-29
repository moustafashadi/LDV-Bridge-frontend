"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const roles = [
    {
      id: "citizen",
      title: "Citizen Developer",
      description: "Visual-first interface for creating and testing LCNC apps",
      icon: "👤",
      path: "/citizen-developer",
    },
    {
      id: "pro",
      title: "Professional Developer",
      description: "Technical workspace for reviewing and managing changes",
      icon: "👨‍💻",
      path: "/pro-developer",
    },
    {
      id: "admin",
      title: "Admin & Governance",
      description: "Policy management, compliance, and platform oversight",
      icon: "⚙️",
      path: "/admin",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">LDV-Bridge Platform</h1>
          <p className="text-xl text-slate-300">Governance and version control for low-code/no-code applications</p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {roles.map((role) => (
            <Card
              key={role.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:border-blue-500 bg-slate-800 border-slate-700"
              onClick={() => setSelectedRole(role.id)}
            >
              <CardHeader>
                <div className="text-4xl mb-4">{role.icon}</div>
                <CardTitle className="text-white">{role.title}</CardTitle>
                <CardDescription className="text-slate-400">{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push(role.path)} className="w-full bg-blue-600 hover:bg-blue-700">
                  Enter Portal
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
