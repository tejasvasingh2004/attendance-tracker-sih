/**
 * Centralized API Client
 * Handles all HTTP requests with proper error handling and response parsing
 */

const BASE_URL = 'http://10.0.2.2:3000/api';

/**
 * Generic fetch wrapper with error handling and response parsing
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = (await response.json()) as any;

    if (!response.ok) {
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
