/**
 * Authentication Hooks
 * Specialized hooks for authentication-related operations
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { studentApi, otpApi, teacherApi } from '../core/api/endpoints';
import { handleApiError } from '../core/api/client';
import {
  StudentSignupRequest,
  TeacherCheckRequest,
  TeacherSignupRequest,
} from '../core/api/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook specifically for OTP operations
 */
export function useOTP() {
  const [loading, setLoading] = useState(false);

  const generateOTP = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const result = await otpApi.generate(email);
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.alert('Error', 'Failed to send OTP. Try again.');
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);



  const resendOTP = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const result = await otpApi.resend(email);
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
      await AsyncStorage.removeItem('USER_DATA');
      Alert.alert('Logged out', 'You have been logged out successfully.');
    } catch (error) {
      console.error('Failed to logout', error);
      Alert.alert('Error', 'Failed to logout.');
    }
  }, []);

  const getUser = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('USER_DATA');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data', error);
      return null;
    }
  }, []);

  const isAuthenticated = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('JWT_TOKEN');
      const userData = await AsyncStorage.getItem('USER_DATA');
      return !!(token && userData);
    } catch (error) {
      console.error('Failed to check auth status', error);
      return false;
    }
  }, []);

  return {
    logout,
    getUser,
    isAuthenticated,
  };
}

export function useTeacherAuth() {
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (employeeId: string) => {
    setLoading(true);
    try {
      const result = await teacherApi.login(employeeId);
      
      if (result.token) {
        await AsyncStorage.setItem('JWT_TOKEN', result.token);
      }
      
      // Store user data for role-based navigation and app context
      if (result.user) {
        await AsyncStorage.setItem('USER_DATA', JSON.stringify(result.user));
      }
      
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.alert('Error', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (userData: TeacherSignupRequest) => {
    setLoading(true);
    try {
      const result = await teacherApi.signup(userData);
      
      // Store JWT token if present
      if (result.token) {
        await AsyncStorage.setItem('JWT_TOKEN', result.token);
      }
      
      // Store user data for role-based navigation and app context
      if (result.user) {
        await AsyncStorage.setItem('USER_DATA', JSON.stringify(result.user));
      }
      
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.alert('Error', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkTeacher = useCallback(async (params: TeacherCheckRequest) => {
    setLoading(true);
    try {
      const result = await teacherApi.checkTeacher(params);
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
    checkTeacher,
  };
}

/**
 * Hook for student authentication
 */
export function useStudentAuth() {
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (rollNumber: string, hardwareId: string) => {
    setLoading(true);
    try {
      const result = await studentApi.login(rollNumber, hardwareId);
      
      // Store JWT token if present
      if (result.token) {
        await AsyncStorage.setItem('JWT_TOKEN', result.token);
      }
      
      // Store user data for role-based navigation and app context
      if (result.user) {
        await AsyncStorage.setItem('USER_DATA', JSON.stringify(result.user));
      }
      
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.alert('Error', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (userData: StudentSignupRequest) => {
    setLoading(true);
    try {
      const result = await studentApi.signup(userData);
      
      // Store JWT token if present
      if (result.token) {
        await AsyncStorage.setItem('JWT_TOKEN', result.token);
      }
      
      // Store user data for role-based navigation and app context
      if (result.user) {
        await AsyncStorage.setItem('USER_DATA', JSON.stringify(result.user));
      }
      
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      Alert.alert('Error', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkStudent = useCallback(
    async (params: {
      email?: string;
      hardwareId?: string;
      rollNumber?: string;
    }) => {
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
    },
    [],
  );

  return {
    loading,
    login,
    signup,
    checkStudent,
  };
}
