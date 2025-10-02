/**
 * API Type Definitions
 * Centralized type definitions for all API interactions
 */

// Base API response structure
export interface BaseApiResponse {
  message?: string;
  error?: string;
  success?: boolean;
}

// Student related types
export interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  rollNumber: string;
  year: number;
  section: string;
  hardwareId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentLoginRequest {
  email: string;
  hardwareId: string;
}

export interface StudentLoginResponse extends BaseApiResponse {
  user: Student;
  token: string;
}

export interface StudentSignupRequest {
  email: string;
  name: string;
  rollNumber: string;
  year: number;
  section: string;
  hardwareId: string;
  otp: string;
}

export interface StudentCheckRequest {
  email?: string;
  hardwareId?: string;
  rollNumber?: string;
}

export interface StudentCheckResponse extends BaseApiResponse {
  exists: boolean;
}

export interface StudentSignupResponse extends BaseApiResponse {
  user: Student;
  token: string;
}

// OTP related types
export interface OTPGenerateRequest {
  email: string;
}

export interface OTPGenerateResponse extends BaseApiResponse {
  expiresIn?: number;
  alreadyExists?: boolean;
}

export interface OTPResendRequest {
  email: string;
}

export interface OTPResendResponse extends BaseApiResponse {
  expiresIn?: number;
}

// Teacher related types
export interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  employeeId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherLoginRequest {
  email: string;
  password: string;
}

export interface TeacherLoginResponse extends BaseApiResponse {
  user: Teacher;
  token: string;
}

export interface TeacherSignupRequest {
  email: string;
  name: string;
  employeeId: string;
  department: string;
  otp: string;
}

export interface TeacherSignupResponse extends BaseApiResponse {
  user: Teacher;
  token: string;
}

export interface TeacherCheckRequest {
  email?: string;
  employeeId?: string;
}

export interface TeacherCheckResponse extends BaseApiResponse {
  exists: boolean;
}

// Attendance related types
export interface Attendance {
  id: string;
  studentId: string;
  teacherId: string;
  subject: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  timestamp: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface AttendanceRequest {
  studentId: string;
  teacherId: string;
  subject: string;
  status: 'present' | 'absent' | 'late';
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface AttendanceResponse extends BaseApiResponse {
  attendance: Attendance;
}

// Error types
export interface ApiError {
  error: string;
  message?: string;
  code?: string;
  details?: any;
}

// Request configuration types
export interface RequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends BaseApiResponse {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Generic API response wrapper
export interface ApiResponse<T = any> extends BaseApiResponse {
  data?: T;
}

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API endpoint types
export type ApiEndpoint =
  | '/students/login'
  | '/students/signup'
  | '/students/profile'
  | '/otp/generate'
  | '/otp/verify'
  | '/otp/resend'
  | '/teachers/login'
  | '/attendance/mark'
  | '/attendance/history'
  | '/health';
