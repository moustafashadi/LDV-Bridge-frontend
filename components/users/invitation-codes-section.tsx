"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Plus, Trash2, Shield, Code, Briefcase, AlertCircle, Check, Calendar } from "lucide-react"
import { useInvitationCodes, useCreateInvitationCode, useDeactivateInvitationCode } from "@/lib/hooks/use-organizations"
import { toast } from "sonner"

interface InvitationCodesSectionProps {
  organizationId: string
}

export function InvitationCodesSection({ organizationId }: InvitationCodesSectionProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCodeRole, setNewCodeRole] = useState<string>("CITIZEN_DEVELOPER")
  const [maxUses, setMaxUses] = useState<string>("")
  const [expiresInDays, setExpiresInDays] = useState<string>("")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const { data: codes = [], isLoading, refetch } = useInvitationCodes(organizationId)
  const createMutation = useCreateInvitationCode(organizationId)
  const deactivateMutation = useDeactivateInvitationCode(organizationId)

  const handleCreateCode = async () => {
    const expiresAt = expiresInDays
      ? new Date(Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000).toISOString()
      : undefined

    try {
      await createMutation.mutateAsync({
        role: newCodeRole as any,
        maxUses: maxUses ? parseInt(maxUses) : undefined,
        expiresAt,
      })
      setShowCreateDialog(false)
      setNewCodeRole("CITIZEN_DEVELOPER")
      setMaxUses("")
      setExpiresInDays("")
      refetch()
    } catch (error) {
      console.error('Failed to create invitation code:', error)
    }
  }

  const handleDeactivateCode = async (codeId: string) => {
    if (confirm('Are you sure you want to deactivate this invitation code?')) {
      try {
        await deactivateMutation.mutateAsync(codeId)
        refetch()
      } catch (error) {
        console.error('Failed to deactivate code:', error)
      }
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success('Invitation code copied to clipboard')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-3 h-3" />
      case "PRO_DEVELOPER":
        return <Code className="w-3 h-3" />
      case "CITIZEN_DEVELOPER":
        return <Briefcase className="w-3 h-3" />
      default:
        return null
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrator"
      case "PRO_DEVELOPER":
        return "Pro Developer"
      case "CITIZEN_DEVELOPER":
        return "Citizen Developer"
      default:
        return role
    }
  }

  const getRoleBadge = (role: string) => {
    const label = getRoleLabel(role)
    const icon = getRoleIcon(role)
    
    switch (role) {
      case "ADMIN":
        return (
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
            {icon}
            <span className="ml-1">{label}</span>
          </Badge>
        )
      case "PRO_DEVELOPER":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            {icon}
            <span className="ml-1">{label}</span>
          </Badge>
        )
      case "CITIZEN_DEVELOPER":
        return (
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
            {icon}
            <span className="ml-1">{label}</span>
          </Badge>
        )
      default:
        return <Badge>{label}</Badge>
    }
  }

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString()
  }

  const isExpired = (expiresAt: Date | string | undefined) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const isMaxed = (currentUses: number, maxUses: number | undefined) => {
    if (!maxUses) return false
    return currentUses >= maxUses
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Invitation Codes</CardTitle>
            <CardDescription>Generate and manage invitation codes for new users</CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Invitation Code</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newCodeRole} onValueChange={setNewCodeRole}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CITIZEN_DEVELOPER">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Citizen Developer
                        </div>
                      </SelectItem>
                      <SelectItem value="PRO_DEVELOPER">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          Pro Developer
                        </div>
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Administrator
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses (Optional)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresIn">Expires In (Days, Optional)</Label>
                  <Input
                    id="expiresIn"
                    type="number"
                    min="1"
                    placeholder="Never expires"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCode}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Code'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : codes.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No invitation codes yet. Create one to invite new users to your organization.
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((code) => {
                const expired = isExpired(code.expiresAt)
                const maxed = isMaxed(code.currentUses, code.maxUses)
                const inactive = !code.isActive || expired || maxed

                return (
                  <TableRow key={code.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                          {code.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyCode(code.code)}
                        >
                          {copiedCode === code.code ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(code.role)}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {code.currentUses} / {code.maxUses || '∞'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        {code.expiresAt ? (
                          <>
                            <Calendar className="h-3 w-3" />
                            {formatDate(code.expiresAt)}
                            {expired && <span className="text-red-500 ml-1">(Expired)</span>}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {inactive ? (
                        <Badge variant="secondary">
                          {expired ? 'Expired' : maxed ? 'Max Uses' : 'Inactive'}
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-500/10 text-green-400 border-green-500/20">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {code.isActive && !expired && !maxed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeactivateCode(code.id)}
                          disabled={deactivateMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
