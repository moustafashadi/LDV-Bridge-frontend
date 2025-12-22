"use client";

import { RoleLayout } from "@/components/layout/role-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RequestReview() {
  return (
    <RoleLayout>
      <PageHeader
        title="Request Review"
        description="Submit your changes for professional developer review"
      />

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Select App
              </label>
              <Select>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Choose an app..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="marketing">
                    Marketing Campaign Tracker
                  </SelectItem>
                  <SelectItem value="sales">Sales Dashboard</SelectItem>
                  <SelectItem value="inventory">
                    Inventory Management
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Describe Your Changes
              </label>
              <Textarea
                placeholder="What did you change and why? This helps reviewers understand your work..."
                className="bg-slate-900 border-slate-700 text-white placeholder-slate-500 min-h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Assign Reviewer
              </label>
              <Select defaultValue="auto">
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="auto">
                    Auto-assign to DevOps Team
                  </SelectItem>
                  <SelectItem value="john">John M. (Pro Dev)</SelectItem>
                  <SelectItem value="alice">Alice W. (Pro Dev)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Submit for Review
              </Button>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </RoleLayout>
  );
}
