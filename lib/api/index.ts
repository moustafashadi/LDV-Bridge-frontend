import apiClient from './client';

// ========================================
// ONBOARDING API
// ========================================

export interface OnboardingStatus {
  onboarded: boolean;
  status: 'needs_onboarding' | 'pending_approval' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  role?: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  pendingRequests?: Array<{
    id: string;
    organizationName: string;
    requestedRole: string;
    createdAt: string;
  }>;
}

export interface SearchOrganizationResult {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  userCount: number;
}

export interface CompleteOnboardingRequest {
  flow: 'create_org' | 'join_org' | 'use_code';
  email: string;
  name?: string;
  createOrg?: {
    name: string;
    slug?: string;
    domain?: string;
    settings?: Record<string, any>;
  };
  joinOrg?: {
    organizationId: string;
    requestedRole: string;
    message?: string;
  };
  invitationCode?: string;
}

export const onboardingApi = {
  getStatus: () =>
    apiClient.get<OnboardingStatus>('/onboarding/status'),

  searchOrganizations: (query?: string, domain?: string, limit = 10) =>
    apiClient.get<SearchOrganizationResult[]>('/onboarding/organizations/search', {
      params: { query, domain, limit },
    }),

  complete: (data: CompleteOnboardingRequest) =>
    apiClient.post('/onboarding/complete', data),
};

// ========================================
// ORGANIZATIONS API
// ========================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  settings?: Record<string, any>;
  subscriptionPlan: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationStats {
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  pendingRequests: number;
  apps: number;
  policies: number;
}

export interface JoinRequest {
  id: string;
  email: string;
  name?: string;
  requestedRole: string;
  message?: string;
  status: string;
  createdAt: string;
}

export interface InvitationCode {
  id: string;
  code: string;
  organizationId: string;
  role: string;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export const organizationsApi = {
  getById: (id: string) =>
    apiClient.get<Organization>(`/organizations/${id}`),

  update: (id: string, data: Partial<Organization>) =>
    apiClient.patch<Organization>(`/organizations/${id}`, data),

  getStats: (id: string) =>
    apiClient.get<OrganizationStats>(`/organizations/${id}/stats`),

  // Join Requests
  getPendingJoinRequests: (organizationId: string) =>
    apiClient.get<JoinRequest[]>(`/organizations/${organizationId}/join-requests`),

  approveJoinRequest: (organizationId: string, requestId: string, role: string) =>
    apiClient.post(`/organizations/${organizationId}/join-requests/${requestId}/approve`, { role }),

  rejectJoinRequest: (organizationId: string, requestId: string, reason?: string) =>
    apiClient.post(`/organizations/${organizationId}/join-requests/${requestId}/reject`, { reason }),

  // Invitation Codes
  createInvitationCode: (organizationId: string, data: {
    role: string;
    maxUses?: number;
    expiresAt?: string;
  }) =>
    apiClient.post<InvitationCode>(`/organizations/${organizationId}/invitation-codes`, data),

  listInvitationCodes: (organizationId: string) =>
    apiClient.get<InvitationCode[]>(`/organizations/${organizationId}/invitation-codes`),

  updateInvitationCode: (organizationId: string, codeId: string, data: {
    isActive?: boolean;
    expiresAt?: string;
  }) =>
    apiClient.patch<InvitationCode>(`/organizations/${organizationId}/invitation-codes/${codeId}`, data),

  deleteInvitationCode: (organizationId: string, codeId: string) =>
    apiClient.delete(`/organizations/${organizationId}/invitation-codes/${codeId}`),
};

// ========================================
// USERS API
// ========================================

export interface User {
  id: string;
  organizationId: string;
  auth0Id: string;
  email: string;
  name?: string;
  displayName?: string;
  avatarUrl?: string;
  role: string;
  status: string;
  settings?: Record<string, any>;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const usersApi = {
  getMe: () =>
    apiClient.get<User>('/users/me'),

  getById: (id: string) =>
    apiClient.get<User>(`/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    apiClient.patch<User>(`/users/${id}`, data),

  list: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }) =>
    apiClient.get<{
      data: User[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/users', { params }),
};

// ========================================
// AUTH API
// ========================================

export const authApi = {
  getProfile: () =>
    apiClient.get('/auth/profile'),

  verify: () =>
    apiClient.get('/auth/verify'),

  health: () =>
    apiClient.get('/auth/health'),
};
