"use client";

import { RoleLayout } from "@/components/layout/role-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";

export default function ComplianceReports() {
  const templates = [
    {
      name: "SOX Compliance Report",
      description: "Shows all changes to financial apps with approval chains",
    },
    {
      name: "GDPR Data Access Report",
      description: "Lists all apps with data export capabilities",
    },
    {
      name: "Quarterly Change Summary",
      description: "Summary of all changes in a fiscal quarter",
    },
    {
      name: "Custom Report",
      description: "Build your own compliance report",
    },
  ];

  const recentReports = [
    {
      name: "Q3 2025 SOX Report",
      period: "Jul-Sep 2025",
      generated: "Oct 5, 2025",
      by: "Admin",
      size: "2.3 MB",
    },
    {
      name: "GDPR Audit Sept 2025",
      period: "Sep 2025",
      generated: "Oct 1, 2025",
      by: "Compliance Officer",
      size: "1.8 MB",
    },
  ];

  return (
    <RoleLayout>
      <PageHeader
        title="Compliance Reports"
        description="Generate and view compliance reports for audits"
      />

      <main className="container mx-auto px-6 py-8">
        {/* Report Templates */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">
            Report Templates
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {templates.map((template, idx) => (
              <Card
                key={idx}
                className="bg-slate-800 border-slate-700 hover:border-blue-600 transition-colors cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <FileText className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    {template.description}
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Generate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Reports */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Recent Reports</h2>
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 space-y-4">
              {recentReports.map((report, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700"
                >
                  <div>
                    <h3 className="font-semibold text-white">{report.name}</h3>
                    <p className="text-sm text-slate-400">
                      {report.period} • Generated {report.generated} by{" "}
                      {report.by}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">
                      {report.size}
                    </span>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </RoleLayout>
  );
}
