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
  OTPResendResponse,
  StudentCheckRequest,
  StudentCheckResponse,
  TeacherLoginResponse,
  TeacherSignupRequest,
  TeacherSignupResponse,
  TeacherCheckRequest,
  TeacherCheckResponse,
} from './types';

export const teacherApi = {
  async login(employeeId: string): Promise<TeacherLoginResponse> {
    return api.post<TeacherLoginResponse>('/teachers/auth/login', { employeeId });
  },

  async signup(userData: TeacherSignupRequest): Promise<TeacherSignupResponse> {
    return api.post<TeacherSignupResponse>('/teachers/auth/signup', userData);
  },

  async checkTeacher(params: TeacherCheckRequest): Promise<TeacherCheckResponse> {
    return api.post<TeacherCheckResponse>('/teachers/auth/check', params);
  },
};

/**
 * Student Authentication API calls
 */
export const studentApi = {
  /**
   * Login student with email and hardware ID
   */
  async login(
    rollNumber: string,
    hardwareId: string,
  ): Promise<StudentLoginResponse> {
    return api.post<StudentLoginResponse>('/students/auth/login', {
      rollNumber,
      hardwareId,
    });
  },

  /**
   * Signup new student
   */
  async signup(userData: StudentSignupRequest): Promise<StudentSignupResponse> {
    return api.post<StudentSignupResponse>('/students/auth/signup', userData);
  },

  /**
   * Check if student exists
   */
  async checkStudent(
    params: StudentCheckRequest,
  ): Promise<StudentCheckResponse> {
    return api.post<StudentCheckResponse>('/students/auth/check', params);
  },
};

/**
 * OTP Management API calls
 */
export const otpApi = {
  async generate(email: string): Promise<OTPGenerateResponse> {
    return api.post<OTPGenerateResponse>('/otp/generate', { email });
  },

  async resend(email: string): Promise<OTPResendResponse> {
    return api.post<OTPResendResponse>('/otp/resend', { email });
  },
};

export default {
  studentApi,
  otpApi,
};
