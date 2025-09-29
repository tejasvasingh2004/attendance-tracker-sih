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

// User related types
export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'STUDENT' | 'TEACHER';
  name?: string;
  createdAt: string;
}

// Student related types
export interface Student {
  id: string;
  userId: string;
  user: User;
  hardwareId?: string;
  rollNumber: string;
  year: number;
  semester: string;
  section?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentLoginRequest {
  email: string;
  hardwareId: string;
}

export interface StudentLoginResponse extends BaseApiResponse {
  user: Student;
  token?: string;
}

export interface StudentSignupRequest {
  email: string;
  name: string;
  rollNumber: string;
  year: number;
  section: string;
  hardwareId: string;
}

export interface StudentSignupResponse extends BaseApiResponse {
  user: Student;
}

// OTP related types
export interface OTPGenerateRequest {
  userId: string;
  email: string;
}

export interface OTPGenerateResponse extends BaseApiResponse {
  otpId?: string;
  expiresAt?: string;
}

export interface OTPVerifyRequest {
  userId: string;
  otp: string;
}

export interface OTPVerifyResponse extends BaseApiResponse {
  verified: boolean;
  token?: string;
}

export interface OTPResendRequest {
  userId: string;
}

export interface OTPResendResponse extends BaseApiResponse {
  otpId?: string;
  expiresAt?: string;
}

// Teacher related types
export interface Teacher {
  id: string;
  userId: string;
  user: User;
  employeeId: string;
  department: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherLoginRequest {
  email: string;
  password: string;
}

export interface TeacherLoginResponse extends BaseApiResponse {
  teacher: Teacher;
  token?: string;
}

// Session related types
export interface Session {
  id: string;
  title: string;
  subject: string;
  startTime: string;
  endTime?: string;
  teacherId: string;
  teacher: Teacher;
  isAutoStart: boolean;
  duration?: number;
  status: 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

// Attendance related types
export interface Attendance {
  id: string;
  studentId: string;
  student: Student;
  sessionId: string;
  session: Session;
  timestamp: string;
  isPresent: boolean;
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

// Attendance API specific types
export interface RecordAttendanceRequest {
  sessionId: string;
  studentId?: string;
  enrollmentNumber?: string;
  bleData?: any;
}

export interface RecordAttendanceResponse extends BaseApiResponse {
  attendance: Attendance;
}

export interface RecordBulkAttendanceRequest {
  sessionId: string;
  attendanceRecords: Array<{
    studentId?: string;
    enrollmentNumber?: string;
    bleData?: any;
  }>;
}

export interface RecordBulkAttendanceResponse extends BaseApiResponse {
  summary: {
    totalProcessed: number;
    created: number;
    skipped: number;
    errors: number;
  };
  createdAttendances: Attendance[];
  skippedRecords: Array<{
    studentId: string;
    rollNumber: string;
    reason: string;
  }>;
  errors: Array<{
    record: any;
    error: string;
  }>;
}

export interface GetSessionAttendanceResponse extends BaseApiResponse {
  session: Session;
  attendances: Attendance[];
  statistics?: AttendanceStatistics;
}

export interface GetAttendanceByIdResponse extends BaseApiResponse {
  attendance: Attendance;
}

export interface UpdateAttendanceRequest {
  isPresent?: boolean;
  // Add other updatable fields if needed
}

export interface UpdateAttendanceResponse extends BaseApiResponse {
  attendance: Attendance;
}

export interface DeleteAttendanceResponse extends BaseApiResponse {
  // message is in BaseApiResponse
}

export interface AttendanceStatistics {
  total: number;
  present: number;
  absent: number;
  attendancePercentage: number;
}

export interface GetAttendanceStatsResponse extends BaseApiResponse {
  sessionId: string;
  statistics: AttendanceStatistics;
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
  | '/attendance/record'
  | '/attendance/bulk'
  | '/attendance/session/:sessionId'
  | '/attendance/:id'
  | '/attendance/session/:sessionId/stats'
  | '/attendance/mark'
  | '/attendance/history'
  | '/health';
