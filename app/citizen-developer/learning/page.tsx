"use client"

import { MainNav } from "@/components/layout/main-nav"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, Play } from "lucide-react"

export default function LearningHub() {
  const navItems = [
    { label: "My Sandbox", href: "/citizen-developer" },
    { label: "My Changes", href: "/citizen-developer/changes" },
    { label: "Request Review", href: "/citizen-developer/review" },
    { label: "Learning Hub", href: "/citizen-developer/learning" },
  ]

  const tutorials = [
    { title: "Your First Sandbox", duration: "3 min" },
    { title: "Understanding the Review Process", duration: "5 min" },
    { title: "What Changes Need Approval?", duration: "4 min" },
  ]

  const bestPractices = [
    {
      title: "Writing Good Change Descriptions",
      good: "Added export button to download campaign reports to Excel for manager review",
      bad: "Changed stuff",
    },
    {
      title: "Testing Before You Submit",
      description: "Always test your changes in the sandbox before submitting for review",
    },
    {
      title: "Common Mistakes to Avoid",
      description: "Learn from others' mistakes and avoid common pitfalls",
    },
  ]

  const faqs = [
    {
      question: "Why was my change rejected?",
      answer:
        "Changes can be rejected for security, compliance, or quality reasons. Check the feedback from your reviewer for specific details.",
    },
    {
      question: "How do I undo a mistake?",
      answer: "Use the 'Undo Last Change' button in the sandbox, or 'Discard All Changes' to start fresh.",
    },
    {
      question: "What if production breaks?",
      answer:
        "Professional developers can rollback changes immediately. Contact your DevOps team if you notice issues.",
    },
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

      <PageHeader title="Learning Hub" description="Self-service education and best practices" />

      <main className="container mx-auto px-6 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="How do I submit changes?"
              className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Getting Started */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Getting Started</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {tutorials.map((tutorial, idx) => (
              <Card
                key={idx}
                className="bg-slate-800 border-slate-700 hover:border-blue-600 transition-colors cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Play className="w-8 h-8 text-blue-400" />
                    <span className="text-xs text-slate-400">{tutorial.duration}</span>
                  </div>
                  <p className="text-white font-semibold">{tutorial.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Best Practices</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {bestPractices.map((practice, idx) => (
              <Card key={idx} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-base">{practice.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {practice.good && (
                    <div>
                      <p className="text-xs font-semibold text-green-400 mb-1">✓ Good:</p>
                      <p className="text-sm text-slate-300">{practice.good}</p>
                    </div>
                  )}
                  {practice.bad && (
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-1">✗ Bad:</p>
                      <p className="text-sm text-slate-300">{practice.bad}</p>
                    </div>
                  )}
                  {practice.description && <p className="text-sm text-slate-300">{practice.description}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Troubleshooting */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Troubleshooting</h2>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`faq-${idx}`} className="border-slate-700">
                    <AccordionTrigger className="text-white hover:text-blue-400">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-slate-300">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  )
}
