"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Shield, Code, Briefcase, AlertCircle, Calendar, Loader2 } from "lucide-react"
import { useAllApps, useUserApps, useGrantAppAccess, useUpdateAppAccess, useRevokeAppAccess } from "@/lib/hooks/use-app-access"
import type { AppAccessLevel } from "@/lib/api/apps-api"
import { toast } from "sonner"

interface ManageAppAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  userEmail: string
}

export function ManageAppAccessDialog({
  open,
  onOpenChange,
  userId,
  userName,
  userEmail,
}: ManageAppAccessDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedApps, setSelectedApps] = useState<Record<string, AppAccessLevel>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Fetch all apps in the organization
  const { data: allApps = [], isLoading: isLoadingAllApps } = useAllApps(open)
  
  // Fetch apps this user already has access to
  const { data: userApps = [], isLoading: isLoadingUserApps } = useUserApps(userId, open)

  // Initialize selected apps with user's current access
  useMemo(() => {
    if (userApps.length > 0) {
      const initial: Record<string, AppAccessLevel> = {}
      userApps.forEach((app) => {
        initial[app.id] = app.accessLevel
      })
      setSelectedApps(initial)
    }
  }, [userApps])

  // Filter apps by search query
  const filteredApps = allApps.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleApp = (appId: string, checked: boolean) => {
    if (checked) {
      setSelectedApps((prev) => ({ ...prev, [appId]: 'VIEWER' }))
    } else {
      setSelectedApps((prev) => {
        const newState = { ...prev }
        delete newState[appId]
        return newState
      })
    }
  }

  const handleAccessLevelChange = (appId: string, accessLevel: AppAccessLevel) => {
    setSelectedApps((prev) => ({ ...prev, [appId]: accessLevel }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Determine which apps need to be granted/updated/revoked
      const currentAppIds = userApps.map(app => app.id)
      const selectedAppIds = Object.keys(selectedApps)

      // Apps to grant (new selections)
      const toGrant = selectedAppIds.filter(appId => !currentAppIds.includes(appId))
      
      // Apps to update (existing with changed access level)
      const toUpdate = selectedAppIds.filter(appId => {
        const existingApp = userApps.find(app => app.id === appId)
        return existingApp && existingApp.accessLevel !== selectedApps[appId]
      })

      // Apps to revoke (previously had access, now unchecked)
      const toRevoke = currentAppIds.filter(appId => !selectedAppIds.includes(appId))

      // Execute all operations
      const operations = []

      // Grant access to new apps (batch)
      if (toGrant.length > 0) {
        for (const appId of toGrant) {
          operations.push(
            fetch(`/api/v1/apps/${appId}/access`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userIds: [userId],
                accessLevel: selectedApps[appId],
              }),
            })
          )
        }
      }

      // Update existing access levels
      for (const appId of toUpdate) {
        operations.push(
          fetch(`/api/v1/apps/${appId}/access/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessLevel: selectedApps[appId],
            }),
          })
        )
      }

      // Revoke access from apps
      for (const appId of toRevoke) {
        operations.push(
          fetch(`/api/v1/apps/${appId}/access/${userId}`, {
            method: 'DELETE',
          })
        )
      }

      await Promise.all(operations)

      toast.success('App access updated', {
        description: `Updated access for ${userName}`,
      })

      onOpenChange(false)
    } catch (error) {
      console.error('Error updating app access:', error)
      toast.error('Failed to update app access', {
        description: 'Please try again',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getPlatformBadge = (platform: string) => {
    const variants = {
      POWERAPPS: { label: 'PowerApps', className: 'bg-purple-500/20 text-purple-400' },
      MENDIX: { label: 'Mendix', className: 'bg-blue-500/20 text-blue-400' },
    }
    const variant = variants[platform as keyof typeof variants] || { label: platform, className: '' }
    return <Badge className={variant.className}>{variant.label}</Badge>
  }

  const getAccessLevelIcon = (level: AppAccessLevel) => {
    const icons = {
      OWNER: Shield,
      EDITOR: Code,
      VIEWER: Briefcase,
    }
    const Icon = icons[level] || Briefcase
    return <Icon className="w-4 h-4" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage App Access</DialogTitle>
          <DialogDescription>
            Grant or revoke app access for <span className="font-medium text-white">{userName || userEmail}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search apps..."
            className="pl-10 bg-slate-800 border-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Apps List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {isLoadingAllApps || isLoadingUserApps ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-5 w-5" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-9 w-32" />
              </div>
            ))
          ) : filteredApps.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {searchQuery ? 'No apps found matching your search' : 'No apps available'}
              </AlertDescription>
            </Alert>
          ) : (
            filteredApps.map((app) => {
              const isSelected = app.id in selectedApps
              const accessLevel = selectedApps[app.id]
              const userApp = userApps.find((ua) => ua.id === app.id)

              return (
                <div
                  key={app.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-slate-700 border-blue-500'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleToggleApp(app.id, e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 checked:bg-blue-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{app.name}</span>
                        {getPlatformBadge(app.platform)}
                        {userApp?.expiresAt && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Expires: {new Date(userApp.expiresAt).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      {app.description && (
                        <p className="text-sm text-slate-400 mt-1">{app.description}</p>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Select
                      value={accessLevel}
                      onValueChange={(value: AppAccessLevel) => handleAccessLevelChange(app.id, value)}
                    >
                      <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VIEWER">
                          <div className="flex items-center gap-2">
                            {getAccessLevelIcon('VIEWER')}
                            Viewer
                          </div>
                        </SelectItem>
                        <SelectItem value="EDITOR">
                          <div className="flex items-center gap-2">
                            {getAccessLevelIcon('EDITOR')}
                            Editor
                          </div>
                        </SelectItem>
                        <SelectItem value="OWNER">
                          <div className="flex items-center gap-2">
                            {getAccessLevelIcon('OWNER')}
                            Owner
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )
            })
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-slate-400">
              {Object.keys(selectedApps).length} app(s) selected
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving || isLoadingAllApps || isLoadingUserApps}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
