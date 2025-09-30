/**
 * Authentication Hooks
 * Specialized hooks for authentication-related operations
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { studentApi, otpApi } from '../core/api/endpoints';
import { handleApiError } from '../core/api/client';
import { StudentSignupRequest } from '../core/api/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook specifically for OTP operations
 */
export function useOTP() {
  const [loading, setLoading] = useState(false);

  const generateOTP = useCallback(async (userId: string, email: string) => {
    setLoading(true);
    try {
      const result = await otpApi.generate(userId, email);
      Alert.alert('OTP Sent', 'A 6-digit OTP has been sent to your email.');
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.alert('Error', 'Failed to send OTP. Try again.');
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

const verifyOTP = useCallback(async (userId: string, otp: string) => {
  setLoading(true);
  try {
    const result = await otpApi.verify(userId, otp);

    if (result.message === 'OTP verified successfully') {
      if (result.token) {
        await AsyncStorage.setItem('JWT_TOKEN', result.token);
      }
      Alert.alert('Success', 'OTP verified successfully');
      return result;
    } else {
      Alert.alert('Error', result.message || 'OTP verification failed.');
      return null;
    }
  } catch (error) {
    const errorMessage = handleApiError(error);
    Alert.alert('Error', 'OTP verification failed.');
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
}, []);


  const resendOTP = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const result = await otpApi.resend(userId);
      Alert.alert('OTP Resent', 'A new OTP has been sent to your email.');
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.alert('Error', 'Failed to resend OTP.');
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    generateOTP,
    verifyOTP,
    resendOTP,
  };
}

/**
 * Hook for authentication utilities
 */
export function useAuth() {
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('JWT_TOKEN');
      Alert.alert('Logged out', 'You have been logged out successfully.');
    } catch (error) {
      console.error('Failed to logout', error);
      Alert.alert('Error', 'Failed to logout.');
    }
  }, []);

  return {
    logout,
  };
}

/**
 * Hook for student authentication
 */
export function useStudentAuth() {
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, hardwareId: string) => {
    setLoading(true);
    try {
      const result = await studentApi.login(email, hardwareId);
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.alert('Error', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (userData: StudentSignupRequest) => {
      setLoading(true);
      try {
        const result = await studentApi.signup(userData);
        Alert.alert('Success', result.message);
        return result;
      } catch (error) {
        const errorMessage = handleApiError(error);
        Alert.alert('Error', errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const checkStudent = useCallback(async (params: { email?: string; hardwareId?: string }) => {
    setLoading(true);
    try {
      const result = await studentApi.checkStudent(params);
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.alert('Error', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    login,
    signup,
    checkStudent,
  };
}

