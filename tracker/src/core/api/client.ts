/**
 * Centralized API Client
 * Handles all HTTP requests with proper error handling and response parsing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.10:3000/api';

/**
 * Check if JWT token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Failed to parse token:', error);
    return true; // Consider invalid tokens as expired
  }
}

/**
 * Clear auth data from storage
 */
async function clearAuthData(): Promise<void> {
  try {
    await AsyncStorage.removeItem('JWT_TOKEN');
    await AsyncStorage.removeItem('USER_DATA');
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
}

/**
 * Get JWT token from storage and validate it
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem('JWT_TOKEN');
    
    if (!token) {
      return null;
    }
    
    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('Token expired, clearing auth data');
      await clearAuthData();
      return null;
    }
    
    console.log('Retrieved valid token');
    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    await clearAuthData();
    return null;
  }
}

/**
 * Generic fetch wrapper with error handling and response parsing
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  console.log('URL', url);

  // Get auth token for authenticated requests
  const token = await getAuthToken();
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: text || `HTTP ${response.status}: ${response.statusText}` };
    }

    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401 || response.status === 403) {
        console.log('Token expired or invalid, clearing auth data');
        await clearAuthData();
      }
      
      throw new Error(
        data.error ||
          data.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network request failed');
  }
}

/**
 * Generic API methods for common operations
 */
export const api = {
  /**
   * GET request
   */
  async get<T = any>(endpoint: string, headers?: Record<string, string>) {
    return apiRequest<T>(endpoint, {
      method: 'GET',
      headers,
    });
  },

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>,
  ) {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  },

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>,
  ) {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers,
    });
  },

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, headers?: Record<string, string>) {
    return apiRequest<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  },
};

/**
 * Validate authentication state
 */
export const validateAuthState = async (): Promise<{
  isValid: boolean;
  token: string | null;
  user: any;
}> => {
  try {
    const token = await getAuthToken();
    const userData = await AsyncStorage.getItem('USER_DATA');
    
    if (!token || !userData) {
      await clearAuthData();
      return { isValid: false, token: null, user: null };
    }
    
    const user = JSON.parse(userData);
    return { isValid: true, token, user };
  } catch (error) {
    console.error('Auth validation failed:', error);
    await clearAuthData();
    return { isValid: false, token: null, user: null };
  }
};

/**
 * Error handling utility
 */
export const handleApiError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

/**
 * Network status checker
 */
export const checkNetworkStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
};

export default {
  api,
  handleApiError,
  checkNetworkStatus,
};
