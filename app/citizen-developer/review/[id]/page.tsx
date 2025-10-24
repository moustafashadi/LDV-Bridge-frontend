"use client"

import { useState } from "react"
import Link from "next/link"
import { MainNav } from "@/components/layout/main-nav"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Send } from "lucide-react"

export default function ReviewStatus({ params }: { params: { id: string } }) {
  const [comments, setComments] = useState([
    {
      author: "John Miller",
      role: "Pro Dev",
      time: "30 min ago",
      message: "Quick question - should this export include historical data or just current campaigns?",
    },
  ])
  const [newComment, setNewComment] = useState("")

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

      <PageHeader
        title="Review Status: Marketing Campaign Tracker v2.1"
        actions={
          <Link href="/citizen-developer">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:text-white bg-transparent">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to My Apps
            </Button>
          </Link>
        }
      />

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Submitted */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                        ✓
                      </div>
                      <div className="w-1 h-12 bg-slate-700 mt-2"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Submitted by You</p>
                      <p className="text-sm text-slate-400">Oct 20, 2025 at 2:30 PM</p>
                    </div>
                  </div>

                  {/* Under Review */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold animate-spin">
                        ⟳
                      </div>
                      <div className="w-1 h-12 bg-slate-700 mt-2"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Under Review by John Miller (Pro Dev)</p>
                      <p className="text-sm text-slate-400">Started: Oct 20, 2025 at 3:15 PM</p>
                      <p className="text-sm text-slate-400">Est. completion: Oct 21, 2025</p>
                      <p className="text-sm text-blue-400 mt-2">💬 2 comments</p>
                    </div>
                  </div>

                  {/* Awaiting Approval */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 font-bold">
                        ⏳
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-400">Awaiting Approval</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Conversation with Review Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {comments.map((comment, idx) => (
                  <div key={idx} className="pb-6 border-b border-slate-700 last:border-0 last:pb-0">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {comment.author[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">
                          {comment.author} <span className="text-sm text-slate-400 font-normal">- {comment.role}</span>
                        </p>
                        <p className="text-xs text-slate-500 mb-2">{comment.time}</p>
                        <p className="text-slate-300">{comment.message}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Reply Input */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-sm font-semibold text-white mb-3">Your Reply:</p>
                  <Textarea
                    placeholder="Type your response..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white placeholder-slate-500 mb-3"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send Comment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-base">What's Being Reviewed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-semibold text-slate-300 mb-2">Modified Components:</p>
                  <ul className="space-y-1 text-slate-400 text-xs">
                    <li>✏️ Submit Button - Color changed</li>
                    <li>✏️ Email Field - Validation added</li>
                    <li>✏️ Dashboard Chart - Filter changed</li>
                  </ul>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:text-white text-sm bg-transparent"
                >
                  View Changes in Detail
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
