/**
 * Generic API Hook
 * Provides a clean interface for making API requests with built-in state management
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { handleApiError } from '../core/api/client';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export interface UseApiOptions {
  showErrorAlert?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for API calls with loading and error states
 */
export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {},
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const { showErrorAlert = true, onSuccess, onError } = options;

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunction(...args);
        setState(prev => ({ ...prev, data: result, loading: false }));

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        const errorMessage = handleApiError(error);
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));

        if (onError) {
          onError(errorMessage);
        }

        if (showErrorAlert) {
          Alert.alert('Error', errorMessage);
        }

        return null;
      }
    },
    [apiFunction, showErrorAlert, onSuccess, onError],
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

export default useApi;
