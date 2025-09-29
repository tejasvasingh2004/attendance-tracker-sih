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
  CreateSessionRequest,
  CreateSessionResponse,
  GetSessionsRequest,
  GetSessionsResponse,
  GetSessionByIdResponse,
  UpdateSessionRequest,
  UpdateSessionResponse,
  DeleteSessionResponse,
  StartSessionResponse,
  EndSessionResponse,
  CheckAutoStartResponse,
  RecordAttendanceRequest,
  RecordAttendanceResponse,
  RecordBulkAttendanceRequest,
  RecordBulkAttendanceResponse,
  GetSessionAttendanceResponse,
  GetAttendanceByIdResponse,
  UpdateAttendanceRequest,
  UpdateAttendanceResponse,
  DeleteAttendanceResponse,
  GetAttendanceStatsResponse,
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

/**
 * Attendance Management API calls
 */
export const attendanceApi = {
  /**
   * Record individual attendance from BLE scan data
   */
  async recordAttendance(data: RecordAttendanceRequest): Promise<RecordAttendanceResponse> {
    return api.post<RecordAttendanceResponse>('/attendance/record', data);
  },

  /**
   * Record bulk attendance from BLE scan results
   */
  async recordBulkAttendance(data: RecordBulkAttendanceRequest): Promise<RecordBulkAttendanceResponse> {
    return api.post<RecordBulkAttendanceResponse>('/attendance/bulk', data);
  },

  /**
   * Get session attendance with optional filtering and statistics
   */
  async getSessionAttendance(sessionId: string, includeStats?: boolean): Promise<GetSessionAttendanceResponse> {
    const url = includeStats ? `/attendance/session/${sessionId}?includeStats=true` : `/attendance/session/${sessionId}`;
    return api.get<GetSessionAttendanceResponse>(url);
  },

  /**
   * Get individual attendance record by ID
   */
  async getAttendanceById(id: string): Promise<GetAttendanceByIdResponse> {
    return api.get<GetAttendanceByIdResponse>(`/attendance/${id}`);
  },

  /**
   * Update attendance record
   */
  async updateAttendance(id: string, data: UpdateAttendanceRequest): Promise<UpdateAttendanceResponse> {
    return api.put<UpdateAttendanceResponse>(`/attendance/${id}`, data);
  },

  /**
   * Delete attendance record
   */
  async deleteAttendance(id: string): Promise<DeleteAttendanceResponse> {
    return api.delete<DeleteAttendanceResponse>(`/attendance/${id}`);
  },

  /**
   * Get attendance statistics for a session
   */
  async getAttendanceStats(sessionId: string): Promise<GetAttendanceStatsResponse> {
    return api.get<GetAttendanceStatsResponse>(`/attendance/session/${sessionId}/stats`);
  },
};

/**
 * Session Management API calls
 */
export const sessionApi = {
  /**
   * Create a new session
   */
  async createSession(data: CreateSessionRequest): Promise<CreateSessionResponse> {
    return api.post<CreateSessionResponse>('/sessions', data);
  },

  /**
   * Get sessions with optional filtering and pagination
   */
  async getSessions(params?: GetSessionsRequest): Promise<GetSessionsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.teacherId) queryParams.append('teacherId', params.teacherId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = queryParams.toString() ? `/sessions?${queryParams.toString()}` : '/sessions';
    return api.get<GetSessionsResponse>(url);
  },

  /**
   * Get session by ID
   */
  async getSessionById(id: string): Promise<GetSessionByIdResponse> {
    return api.get<GetSessionByIdResponse>(`/sessions/${id}`);
  },

  /**
   * Update session details
   */
  async updateSession(id: string, data: UpdateSessionRequest): Promise<UpdateSessionResponse> {
    return api.put<UpdateSessionResponse>(`/sessions/${id}`, data);
  },

  /**
   * Delete session
   */
  async deleteSession(id: string): Promise<DeleteSessionResponse> {
    return api.delete<DeleteSessionResponse>(`/sessions/${id}`);
  },

  /**
   * Start a scheduled session
   */
  async startSession(id: string): Promise<StartSessionResponse> {
    return api.post<StartSessionResponse>(`/sessions/${id}/start`);
  },

  /**
   * End an active session
   */
  async endSession(id: string): Promise<EndSessionResponse> {
    return api.post<EndSessionResponse>(`/sessions/${id}/end`);
  },

  /**
   * Check and start auto-start sessions
   */
  async checkAutoStart(): Promise<CheckAutoStartResponse> {
    return api.get<CheckAutoStartResponse>('/sessions/auto-start');
  },
};

export default {
  studentApi,
  otpApi,
  attendanceApi,
  sessionApi,
};
