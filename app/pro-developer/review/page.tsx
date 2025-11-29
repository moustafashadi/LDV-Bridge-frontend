"use client"

import { RoleLayout } from "@/components/layout/role-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileText,
  User
} from "lucide-react"

export default function ReviewsPage() {
  // Mock data for demonstration
  const pendingReviews = [
    {
      id: "1",
      title: "Add customer validation to Sales Dashboard",
      appName: "Sales Dashboard",
      submittedBy: "Jane Doe",
      submittedAt: "2 hours ago",
      risk: "MEDIUM",
      slaStatus: "on-time",
    },
    {
      id: "2",
      title: "Update inventory calculation logic",
      appName: "Inventory Management",
      submittedBy: "John Smith",
      submittedAt: "5 hours ago",
      risk: "HIGH",
      slaStatus: "overdue",
    },
  ]

  const handleViewReview = (reviewId: string) => {
    window.location.href = `/pro-developer/review/${reviewId}`
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW": return "text-green-500"
      case "MEDIUM": return "text-yellow-500"
      case "HIGH": return "text-orange-500"
      case "CRITICAL": return "text-red-500"
      default: return "text-gray-500"
    }
  }

  return (
    <RoleLayout>
      <div className="space-y-6">
        <PageHeader
          title="Code Reviews"
          description="Review and approve changes from citizen developers"
        />

        {/* Status Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <Badge variant="secondary">2</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Overdue</span>
                </div>
                <Badge variant="destructive">1</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
                <Badge variant="secondary">15</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Rejected</span>
                </div>
                <Badge variant="secondary">3</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Tabs */}
        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending (2)
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved (15)
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected (3)
            </TabsTrigger>
            <TabsTrigger value="all">
              All
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <Card key={review.id} className="hover:bg-accent/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{review.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {review.appName}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {review.submittedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {review.submittedAt}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={review.slaStatus === "overdue" ? "destructive" : "secondary"}>
                          {review.slaStatus === "overdue" ? "Overdue" : "On Time"}
                        </Badge>
                        <Badge variant="outline" className={getRiskColor(review.risk)}>
                          {review.risk} Risk
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReview(review.id)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleViewReview(review.id)}
                      >
                        Review Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">15 approved reviews</h3>
                  <p className="text-sm text-muted-foreground">
                    View your approved reviews in the history tab
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <XCircle className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">3 rejected reviews</h3>
                  <p className="text-sm text-muted-foreground">
                    View your rejected reviews in the history tab
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">20 total reviews</h3>
                  <p className="text-sm text-muted-foreground">
                    All reviews across all statuses
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleLayout>
  )
}
