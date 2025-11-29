"use client"
import { Play, Pause, Edit, Save, X } from "lucide-react"
import { PolicyForm, PolicyStatusBadge } from "@/components/policies"
import { usePolicy, usePolicyMutations } from "@/lib/hooks/use-policies"
import { CreatePolicyDto, PolicyStatus } from "@/lib/types/policies"
import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { RoleLayout } from "@/components/layout/role-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, } from "lucide-react"

interface PolicyEditorPageProps {
  params: Promise<{ id: string }>
}

export default function PolicyEditorPage({ params }: PolicyEditorPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  // Fetch policy details
  const { policy, loading, error, refetch } = usePolicy(resolvedParams.id)

  // Mutations
  const { updatePolicy, deletePolicy } = usePolicyMutations()

  const handleUpdate = async (data: CreatePolicyDto) => {
    if (!policy) return

    try {
      await updatePolicy(policy.id, data)
      setIsEditing(false)
      refetch()
    } catch (err) {
      console.error('Failed to update policy:', err)
    }
  }

  const handleToggleStatus = async () => {
    if (!policy) return

    try {
      await updatePolicy(policy.id, {
        status: policy.status === PolicyStatus.ACTIVE ? PolicyStatus.INACTIVE : PolicyStatus.ACTIVE,
      })
      refetch()
    } catch (err) {
      console.error('Failed to toggle policy status:', err)
    }
  }

  const handleDelete = async () => {
    if (!policy) return
    
    if (!confirm(`Are you sure you want to delete the policy "${policy.name}"?`)) {
      return
    }

    try {
      await deletePolicy(policy.id)
      router.push('/admin/policies')
    } catch (err) {
      console.error('Failed to delete policy:', err)
    }
  }

  const handleTestPolicy = () => {
    // TODO: Implement policy testing functionality
    alert('Policy testing functionality coming soon!')
  }

  // Loading state
  if (loading) {
    return (
      <RoleLayout>
        <PageHeader title="Loading Policy..." />
        <div className="space-y-6 mt-6">
          <Skeleton className="h-32 bg-slate-800" />
          <Skeleton className="h-64 bg-slate-800" />
          <Skeleton className="h-96 bg-slate-800" />
        </div>
      </RoleLayout>
    )
  }

  // Error state
  if (error || !policy) {
    return (
      <RoleLayout>
        <PageHeader title="Policy Not Found" />
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>
            {error?.message || 'Policy not found'}
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => router.push('/admin/policies')}
          className="mt-4"
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Policies
        </Button>
      </RoleLayout>
    )
  }

  return (
    <RoleLayout>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/policies')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{policy.name}</h1>
            <PolicyStatusBadge status={policy.status} />
          </div>
          {policy.description && (
            <p className="text-slate-400 mt-1">{policy.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Button
                  variant="outline"
                  onClick={handleTestPolicy}
                  className="border-slate-600 text-slate-300 hover:text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Test Policy
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleToggleStatus}
                  className={
                    policy.status === 'ACTIVE'
                      ? 'border-yellow-600 text-yellow-400 hover:text-yellow-300'
                      : 'border-green-600 text-green-400 hover:text-green-300'
                  }
                >
                  {policy.status === 'ACTIVE' ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </>
            )}

            {isEditing && (
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
        </div>
      </div>

      <div className="mt-6">
        {isEditing ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Edit Policy</CardTitle>
              <CardDescription className="text-slate-400">
                Update policy configuration and rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PolicyForm
                initialData={policy}
                onSubmit={handleUpdate}
                onCancel={() => setIsEditing(false)}
                isEdit={true}
              />
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="rules" className="data-[state=active]:bg-blue-600">
                Rules ({policy.rules.length})
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-blue-600">
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Policy Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Name</p>
                    <p className="text-white">{policy.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-1">Description</p>
                    <p className="text-white">{policy.description || 'No description'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-1">Target Platform</p>
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                      {policy.targetPlatform}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-1">Status</p>
                    <PolicyStatusBadge status={policy.status} />
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-1">Created</p>
                    <p className="text-white">
                      {new Date(policy.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-1">Last Updated</p>
                    <p className="text-white">
                      {new Date(policy.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Policy Rules</CardTitle>
                  <CardDescription className="text-slate-400">
                    Conditions and actions for this policy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {policy.rules.length === 0 ? (
                    <Alert className="bg-slate-900/50 border-slate-700">
                      <AlertDescription className="text-slate-400">
                        No rules defined for this policy yet.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {policy.rules.map((rule, index) => (
                        <Card key={index} className="bg-slate-900/50 border-slate-700">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="text-white font-medium">{rule.name}</h4>
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                {rule.action}
                              </Badge>
                            </div>

                            {rule.description && (
                              <p className="text-sm text-slate-400 mb-4">{rule.description}</p>
                            )}

                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="text-slate-400">Conditions: </span>
                                <div className="mt-2 space-y-2">
                                  {rule.conditions.map((condition, condIndex) => (
                                    <div key={condIndex} className="flex items-center gap-2 text-xs">
                                      <code className="text-blue-400 bg-slate-950 px-2 py-1 rounded">
                                        {condition.field}
                                      </code>
                                      <span className="text-slate-500">{condition.operator}</span>
                                      <code className="text-green-400 bg-slate-950 px-2 py-1 rounded">
                                        {JSON.stringify(condition.value)}
                                      </code>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {rule.severity && (
                                <div>
                                  <span className="text-slate-400">Severity: </span>
                                  <Badge
                                    variant={rule.severity >= 7 ? 'destructive' : 'secondary'}
                                    className={
                                      rule.severity >= 7
                                        ? 'bg-red-500/10 text-red-400'
                                        : 'bg-yellow-500/10 text-yellow-400'
                                    }
                                  >
                                    {rule.severity}/10
                                  </Badge>
                                </div>
                              )}

                              {rule.message && (
                                <div>
                                  <span className="text-slate-400">Message: </span>
                                  <p className="text-white mt-1">{rule.message}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                  <CardDescription className="text-slate-400">
                    Policy execution history and events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="bg-slate-900/50 border-slate-700">
                    <AlertDescription className="text-slate-400">
                      Activity tracking coming soon. This will show when the policy was triggered
                      and what actions were taken.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Danger Zone */}
      {!isEditing && (
        <Card className="bg-slate-800 border-red-900/50 mt-6">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
            <CardDescription className="text-slate-400">
              Irreversible actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Policy
            </Button>
          </CardContent>
        </Card>
      )}
    </RoleLayout>
  )
}
