"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MainNav } from "@/components/layout/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, RotateCcw, Trash2, CheckCircle, RefreshCw, ExternalLink, AlertCircle } from "lucide-react"
import { useSandboxDetail } from "@/lib/hooks/use-sandbox-detail"
import { useSandboxChanges } from "@/lib/hooks/use-sandbox-changes"
import { ChangeType } from "@/lib/types/changes"

export default function SandboxWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const { sandbox, loading: sandboxLoading, error: sandboxError } = useSandboxDetail(id)
  const { 
    changes, 
    groupedChanges, 
    changeStats,
    loading: changesLoading, 
    syncing,
    syncChanges,
    undoChange,
    discardAllChanges
  } = useSandboxChanges({ 
    sandboxId: id,
    appId: sandbox?.appId,
    enableRealTime: true
  })

  const [embedFailed, setEmbedFailed] = useState(false)
  const [isDiscarding, setIsDiscarding] = useState(false)

  // Get the last change for undo functionality
  const lastChange = changes.length > 0 ? changes[0] : null

  const navItems = [
    { label: "My Sandbox", href: "/citizen-developer" },
    { label: "My Changes", href: "/citizen-developer/changes" },
    { label: "Request Review", href: "/citizen-developer/review" },
    { label: "Learning Hub", href: "/citizen-developer/learning" },
  ]

  const handleUndoLastChange = async () => {
    if (lastChange) {
      await undoChange(lastChange.id)
    }
  }

  const handleDiscardAllChanges = async () => {
    setIsDiscarding(true)
    await discardAllChanges()
    setIsDiscarding(false)
  }

  const handleSubmitReview = () => {
    router.push('/citizen-developer/review')
  }

  // Loading state
  if (sandboxLoading || changesLoading) {
    return (
      <>
        <MainNav
          title="Citizen Developer Portal"
          navItems={navItems}
          userRole="Citizen Developer"
          userName="Sarah K."
          userInitials="SK"
        />
        <div className="container mx-auto px-6 py-8">
          <Skeleton className="h-96 w-full bg-slate-800" />
        </div>
      </>
    )
  }

  // Error state
  if (sandboxError || !sandbox) {
    return (
      <>
        <MainNav
          title="Citizen Developer Portal"
          navItems={navItems}
          userRole="Citizen Developer"
          userName="Sarah K."
          userInitials="SK"
        />
        <div className="container mx-auto px-6 py-8">
          <Alert className="bg-red-900/50 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load sandbox. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </>
    )
  }

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
              <h1 className="text-xl font-bold text-white">
                Sandbox: {sandbox.name}
              </h1>
              <p className="text-sm text-slate-400">
                Platform: {sandbox.platform} • Status: {sandbox.status}
              </p>
            </div>
          </div>
          <Button 
            onClick={syncChanges} 
            disabled={syncing}
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Changes'}
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Your Changes</CardTitle>
                <CardDescription>
                  {changeStats.total} total change{changeStats.total !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {changeStats.modified > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-300 mb-2">
                      Modified ({changeStats.modified})
                    </p>
                    <ul className="space-y-1 text-sm text-slate-400">
                      {changes
                        .filter((c) => c.changeType === ChangeType.UPDATE)
                        .slice(0, 5)
                        .map((c) => (
                          <li key={c.id}>
                            ✏️ {c.title}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
                
                {changeStats.added > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-300 mb-2">
                      Added ({changeStats.added})
                    </p>
                    <ul className="space-y-1 text-sm text-slate-400">
                      {changes
                        .filter((c) => c.changeType === ChangeType.CREATE)
                        .slice(0, 5)
                        .map((c) => (
                          <li key={c.id}>➕ {c.title}</li>
                        ))}
                    </ul>
                  </div>
                )}

                {changeStats.deleted > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-300 mb-2">
                      Deleted ({changeStats.deleted})
                    </p>
                    <ul className="space-y-1 text-sm text-slate-400">
                      {changes
                        .filter((c) => c.changeType === ChangeType.DELETE)
                        .slice(0, 5)
                        .map((c) => (
                          <li key={c.id}>🗑️ {c.title}</li>
                        ))}
                    </ul>
                  </div>
                )}

                {changeStats.total === 0 && (
                  <p className="text-sm text-slate-500">No changes yet</p>
                )}

                {/* Grouped Changes Section */}
                {Object.keys(groupedChanges).length > 0 && (
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm font-semibold text-slate-300 mb-2">
                      By Component
                    </p>
                    {Object.entries(groupedChanges).map(([component, componentChanges]) => (
                      <details key={component} className="mb-2">
                        <summary className="text-sm text-slate-400 cursor-pointer hover:text-white">
                          📦 {component} ({componentChanges.length})
                        </summary>
                        <ul className="ml-4 mt-1 space-y-1 text-xs text-slate-500">
                          {componentChanges.map((c) => (
                            <li key={c.id}>
                              {c.changeType === ChangeType.UPDATE && '✏️ '}
                              {c.changeType === ChangeType.CREATE && '➕ '}
                              {c.changeType === ChangeType.DELETE && '🗑️ '}
                              {c.title}
                            </li>
                          ))}
                        </ul>
                      </details>
                    ))}
                  </div>
                )}
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
                <CardDescription>
                  {sandbox.environmentUrl ? (
                    embedFailed ? 'Click below to open in platform' : 'Live sandbox environment'
                  ) : (
                    'Waiting for environment provisioning...'
                  )}
                </CardDescription>
                
                {/* Mendix Studio Pro Notice */}
                {sandbox.platform === 'MENDIX' && sandbox.environmentUrl && (
                  <Alert className="mt-4 bg-blue-500/10 border-blue-500/50">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-200 text-sm">
                      <strong>Note:</strong> To edit this Mendix app, click "Open in MENDIX" below to access the Developer Portal, 
                      then click <strong>"Edit in Studio Pro"</strong>. Mendix Studio (web) has been merged into Studio Pro (desktop).
                      {' '}
                      <a 
                        href="https://marketplace.mendix.com/link/studiopro/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:text-blue-100"
                      >
                        Download Studio Pro
                      </a>
                    </AlertDescription>
                  </Alert>
                )}
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg min-h-96 border border-slate-700 overflow-hidden">
                  {sandbox.environmentUrl && !embedFailed ? (
                    <iframe
                      src={sandbox.environmentUrl}
                      className="w-full h-96"
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                      onError={() => setEmbedFailed(true)}
                      title={`${sandbox.name} Preview`}
                    />
                  ) : sandbox.environmentUrl && embedFailed ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center space-y-4">
                        <div className="text-6xl mb-4">📱</div>
                        <Alert className="bg-yellow-900/30 border-yellow-800">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Unable to embed preview. Use the button below to open directly.
                          </AlertDescription>
                        </Alert>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => window.open(sandbox.environmentUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in {sandbox.platform}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <div className="text-6xl mb-4">⏳</div>
                        <p className="text-slate-400">Environment provisioning...</p>
                        <p className="text-sm text-slate-500 mt-2">
                          Status: {sandbox.provisioningStatus}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Bar */}
            <div className="flex gap-3 justify-between flex-wrap">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300 hover:text-white bg-transparent"
                  onClick={handleUndoLastChange}
                  disabled={!lastChange || syncing}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Undo Last Change
                </Button>
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-red-400 hover:text-red-300 bg-transparent"
                  onClick={handleDiscardAllChanges}
                  disabled={changes.length === 0 || isDiscarding || syncing}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDiscarding ? 'Discarding...' : 'Discard All Changes'}
                </Button>
              </div>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleSubmitReview}
                disabled={changes.length === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit for Review ({changeStats.total})
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
