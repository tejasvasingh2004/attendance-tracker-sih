/**
 * API Endpoints
 * Centralized endpoint definitions and API service methods
 */
import { api } from './client';
import {
  StudentLoginResponse,
  StudentSignupRequest,
  StudentSignupResponse,
  OTPGenerateResponse,
  OTPVerifyResponse,
  OTPResendResponse,
} from './types';

/**
 * Student Authentication API calls
 */
export const studentApi = {
  /**
   * Login student with email and hardware ID
   */
  async login(email: string, hardwareId: string): Promise<StudentLoginResponse> {
    return api.post<StudentLoginResponse>('/students/login', { email, hardwareId });
  },

  /**
   * Signup new student
   */
  async signup(userData: StudentSignupRequest): Promise<StudentSignupResponse> {
    return api.post<StudentSignupResponse>('/students/signup', userData);
  },
};

/**
 * OTP Management API calls
 */
export const otpApi = {
  async generate(userId: string, email: string): Promise<OTPGenerateResponse> {
    return api.post<OTPGenerateResponse>('/otp/generate', { userId, email });
  },

  async verify(userId: string, otp: string): Promise<OTPVerifyResponse> {
    return api.post<OTPVerifyResponse>('/otp/verify', { userId, otp });
  },

  async resend(userId: string): Promise<OTPResendResponse> {
    return api.post<OTPResendResponse>('/otp/resend', { userId });
  },
};

export default {
  studentApi,
  otpApi,
};
