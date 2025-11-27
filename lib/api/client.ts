import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Create axios instance with default configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Set authorization token for API requests
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

/**
 * Request interceptor - Add token from storage if available and log requests in development
 */
apiClient.interceptors.request.use(
  (config) => {
    // Debug: Log request details in development
    if (process.env.NODE_ENV === 'development') {
      const hasAuth = !!config.headers['Authorization'];
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url} ${hasAuth ? '🔒' : '🔓'}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    const url = error.config?.url || '';
    const method = error.config?.method?.toUpperCase() || 'REQUEST';
    
    // Handle specific error statuses
    if (error.response?.status === 401) {
      // List of public endpoints that don't require authentication
      const publicEndpoints = [
        '/setup-instructions',
        '/callback',
      ];
      
      // List of connector endpoints that might return 401 when not connected
      const connectorEndpoints = [
        '/status',
        '/environments',
        '/projects',
        '/apps',
        '/test',
        '/connect',
        '/disconnect',
      ];
      
      const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint));
      const isConnectorEndpoint = connectorEndpoints.some(endpoint => url.includes(endpoint));
      
      // Only log error for unexpected 401s
      if (!isPublicEndpoint && !isConnectorEndpoint) {
        console.error(`🚫 ${method} ${url} - Unauthorized (401)`);
        console.error('This might indicate:');
        console.error('1. User is not authenticated with Auth0');
        console.error('2. JWT token is invalid or expired');
        console.error('3. User has not completed onboarding (missing organizationId)');
      } else if (isConnectorEndpoint && process.env.NODE_ENV === 'development') {
        // For connector endpoints, just debug log
        console.debug(`⚠️  ${method} ${url} - Not connected or not authenticated`);
      }
      
    } else if (error.response?.status === 403) {
      console.error(`🚫 ${method} ${url} - Forbidden (403)`);
      console.error('User does not have permission to access this resource');
      
    } else if (error.response?.status === 404) {
      // 404 is common for "not connected" scenarios, only log in development
      if (process.env.NODE_ENV === 'development') {
        console.debug(`❓ ${method} ${url} - Not Found (404)`);
      }
      
    } else if (error.response?.status === 500) {
      console.error(`💥 ${method} ${url} - Server Error (500)`);
      if (error.response?.data?.message) {
        console.error(`Error: ${error.response.data.message}`);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
