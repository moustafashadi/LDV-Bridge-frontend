// ============================================
// COMPONENT MANAGEMENT API CLIENT (Task 10)
// ============================================

import { apiClient } from './client';
import {
  Component,
  ComponentVersion,
  CreateComponentDto,
  UpdateComponentDto,
  ExtractComponentsDto,
  ExtractComponentsResponse,
  PaginatedComponentsResponse,
  ComponentFilters,
  ComponentWithVersions,
} from '../types/components';

const BASE_PATH = '/components';

/**
 * Get all components with optional filters
 */
export async function getComponents(
  filters?: ComponentFilters
): Promise<PaginatedComponentsResponse> {
  const response = await apiClient.get<PaginatedComponentsResponse>(BASE_PATH, {
    params: filters,
  });
  return response.data;
}

/**
 * Get a single component by ID
 */
export async function getComponent(id: string): Promise<Component> {
  const response = await apiClient.get<Component>(`${BASE_PATH}/${id}`);
  return response.data;
}

/**
 * Create a new component
 */
export async function createComponent(
  data: CreateComponentDto
): Promise<Component> {
  const response = await apiClient.post<Component>(BASE_PATH, data);
  return response.data;
}

/**
 * Update an existing component
 */
export async function updateComponent(
  id: string,
  data: UpdateComponentDto
): Promise<Component> {
  const response = await apiClient.put<Component>(`${BASE_PATH}/${id}`, data);
  return response.data;
}

/**
 * Delete a component
 */
export async function deleteComponent(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}

/**
 * Extract components from an app
 */
export async function extractComponents(
  data: ExtractComponentsDto
): Promise<ExtractComponentsResponse> {
  const response = await apiClient.post<ExtractComponentsResponse>(
    `${BASE_PATH}/extract`,
    data
  );
  return response.data;
}

/**
 * Get component version history
 */
export async function getComponentVersions(
  id: string
): Promise<ComponentVersion[]> {
  const response = await apiClient.get<ComponentVersion[]>(
    `${BASE_PATH}/${id}/versions`
  );
  return response.data;
}

/**
 * Get component with its version history
 */
export async function getComponentWithVersions(
  id: string
): Promise<ComponentWithVersions> {
  const [component, versions] = await Promise.all([
    getComponent(id),
    getComponentVersions(id),
  ]);

  return {
    ...component,
    versions,
  };
}
