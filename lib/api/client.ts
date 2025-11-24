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
 * Request interceptor - Add token from storage if available
 */
apiClient.interceptors.request.use(
  (config) => {
    // Token is already set via setAuthToken, but we can add other headers here
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
  (error: AxiosError) => {
    // Handle specific error statuses
    if (error.response?.status === 401) {
      // Only log/redirect for non-public endpoints
      // Public endpoints like setup-instructions should not trigger this
      const url = error.config?.url || '';
      const isPublicEndpoint = url.includes('/setup-instructions') || url.includes('/callback');
      
      if (!isPublicEndpoint) {
        console.error('Unauthorized access - redirecting to login');
        // Could trigger logout here
      }
    } else if (error.response?.status === 403) {
      // Forbidden
      console.error('Access forbidden');
    } else if (error.response?.status === 404) {
      // Not found
      console.error('Resource not found');
    } else if (error.response?.status === 500) {
      // Server error
      console.error('Server error occurred');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
