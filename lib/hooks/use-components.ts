// ============================================
// COMPONENT MANAGEMENT HOOKS (Task 10)
// ============================================

import { useState, useEffect, useCallback } from 'react';
import {
  Component,
  ComponentType,
  ComponentVersion,
  PaginatedComponentsResponse,
  ComponentFilters,
  CreateComponentDto,
  UpdateComponentDto,
  ExtractComponentsResponse,
  ComponentWithVersions,
} from '../types/components';
import * as componentsApi from '../api/components-api';

/**
 * Hook to fetch components with filters
 */
export function useComponents(filters?: ComponentFilters) {
  const [data, setData] = useState<PaginatedComponentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComponents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await componentsApi.getComponents(filters);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [
    filters?.type,
    filters?.platform,
    filters?.appId,
    filters?.isReusable,
    filters?.search,
    filters?.page,
    filters?.limit,
  ]);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  return {
    components: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 20,
    loading,
    error,
    refetch: fetchComponents,
  };
}

/**
 * Hook to fetch a single component
 */
export function useComponent(id: string | null) {
  const [data, setData] = useState<Component | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComponent = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await componentsApi.getComponent(id);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComponent();
  }, [fetchComponent]);

  return {
    component: data,
    loading,
    error,
    refetch: fetchComponent,
  };
}

/**
 * Hook to fetch component versions
 */
export function useComponentVersions(componentId: string | null) {
  const [data, setData] = useState<ComponentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVersions = useCallback(async () => {
    if (!componentId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await componentsApi.getComponentVersions(componentId);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [componentId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  return {
    versions: data,
    loading,
    error,
    refetch: fetchVersions,
  };
}

/**
 * Hook to fetch component with all versions
 */
export function useComponentWithVersions(id: string | null) {
  const [data, setData] = useState<ComponentWithVersions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchComponentWithVersions = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await componentsApi.getComponentWithVersions(id);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComponentWithVersions();
  }, [fetchComponentWithVersions]);

  return {
    component: data || null,
    versions: data?.versions || [],
    loading,
    error,
    refetch: fetchComponentWithVersions,
  };
}

/**
 * Hook for component mutations
 */
export function useComponentMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createComponent = async (data: CreateComponentDto): Promise<Component> => {
    try {
      setLoading(true);
      setError(null);
      const result = await componentsApi.createComponent(data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateComponent = async (
    id: string,
    data: UpdateComponentDto
  ): Promise<Component> => {
    try {
      setLoading(true);
      setError(null);
      const result = await componentsApi.updateComponent(id, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteComponent = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await componentsApi.deleteComponent(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const extractComponents = async (
    appId: string,
    componentTypes?: ComponentType[],
    includeNested?: boolean
  ): Promise<ExtractComponentsResponse> => {
    try {
      setLoading(true);
      setError(null);
      const result = await componentsApi.extractComponents({
        appId,
        componentTypes,
        includeNested,
      });
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createComponent,
    updateComponent,
    deleteComponent,
    extractComponents,
    loading,
    error,
  };
}
