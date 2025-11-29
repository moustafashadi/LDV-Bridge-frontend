// ============================================
// API CLIENT
// ============================================

import { useEffect } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * Axios instance for API requests
 * Auto-includes Auth0 JWT token in all requests
 */
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Setup axios interceptor to add auth token
 * Call this in your App component or auth provider
 */
export function setupApiClient(getAccessTokenSilently: () => Promise<string>) {
  // Request interceptor to add auth token
  apiClient.interceptors.request.use(
    async (config) => {
      try {
        const token = await getAccessTokenSilently();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to get access token:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        // Server responded with error status
        console.error('API Error:', error.response.status, error.response.data);
        
        // Handle 401 Unauthorized
        if (error.response.status === 401) {
          console.error('Unauthorized - redirecting to login');
          // You can add redirect logic here
        }
        
        // Handle 403 Forbidden
        if (error.response.status === 403) {
          console.error('Forbidden - insufficient permissions');
        }
      } else if (error.request) {
        // Request made but no response
        console.error('No response from server');
      } else {
        // Error in request setup
        console.error('Request error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );
}

/**
 * Hook to setup API client with Auth0 token
 * Use this in your root component
 */
export function useApiSetup() {
  const { getAccessTokenSilently } = useAuth0();
  
  useEffect(() => {
    setupApiClient(getAccessTokenSilently);
  }, [getAccessTokenSilently]);
}
