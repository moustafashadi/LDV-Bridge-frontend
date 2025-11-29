// ============================================
// POLICY FORM COMPONENT
// ============================================

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreatePolicyDto, PolicyStatus } from '@/lib/types/policies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PolicyFormProps {
  initialData?: Partial<CreatePolicyDto>;
  onSubmit: (data: CreatePolicyDto) => Promise<void>;
  onCancel?: () => void;
  isEdit?: boolean;
}

export function PolicyForm({ initialData, onSubmit, onCancel, isEdit }: PolicyFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreatePolicyDto>({
    defaultValues: initialData || {
      name: '',
      description: '',
      targetPlatform: 'ALL',
      rules: [],
      status: PolicyStatus.DRAFT,
    },
  });

  const targetPlatform = watch('targetPlatform');

  const handleFormSubmit = async (data: CreatePolicyDto) => {
    try {
      setLoading(true);
      setError(null);
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save policy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Policy' : 'Create New Policy'}</CardTitle>
        <CardDescription>
          Define policy rules to enforce governance across your low-code applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Policy Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Policy name is required' })}
              placeholder="e.g., Naming Convention Policy"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe what this policy enforces..."
              rows={3}
            />
          </div>

          {/* Target Platform */}
          <div className="space-y-2">
            <Label htmlFor="targetPlatform">Target Platform *</Label>
            <Select
              value={targetPlatform}
              onValueChange={(value) => setValue('targetPlatform', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Platforms</SelectItem>
                <SelectItem value="PowerApps">Power Apps</SelectItem>
                <SelectItem value="Mendix">Mendix</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              defaultValue={initialData?.status || PolicyStatus.DRAFT}
              onValueChange={(value) => setValue('status', value as PolicyStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PolicyStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={PolicyStatus.INACTIVE}>Inactive</SelectItem>
                <SelectItem value={PolicyStatus.ACTIVE}>Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update Policy' : 'Create Policy'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          {/* Note about rules */}
          <p className="text-sm text-muted-foreground">
            Note: Use the Policy Editor to add and configure rules after creating the policy.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
