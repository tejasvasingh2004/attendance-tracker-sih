import { useApi } from './useApi';
import { default as apiEndpoints } from '../core/api/endpoints';
import type {
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
} from '../core/api/types';

/**
 * Custom hook for attendance operations
 * Wraps attendanceApi methods with useApi for state management
 */

export function useRecordAttendance() {
  return useApi<RecordAttendanceResponse>(
    apiEndpoints.attendanceApi.recordAttendance,
    { showErrorAlert: true }
  );
}

export function useRecordBulkAttendance() {
  return useApi<RecordBulkAttendanceResponse>(
    apiEndpoints.attendanceApi.recordBulkAttendance,
    { showErrorAlert: true }
  );
}

export function useGetSessionAttendance() {
  return useApi<GetSessionAttendanceResponse>(
    apiEndpoints.attendanceApi.getSessionAttendance,
    { showErrorAlert: true }
  );
}

export function useGetAttendanceById() {
  return useApi<GetAttendanceByIdResponse>(
    apiEndpoints.attendanceApi.getAttendanceById,
    { showErrorAlert: true }
  );
}

export function useUpdateAttendance() {
  return useApi<UpdateAttendanceResponse>(
    apiEndpoints.attendanceApi.updateAttendance,
    { showErrorAlert: true }
  );
}

export function useDeleteAttendance() {
  return useApi<DeleteAttendanceResponse>(
    apiEndpoints.attendanceApi.deleteAttendance,
    { showErrorAlert: true }
  );
}

export function useGetAttendanceStats() {
  return useApi<GetAttendanceStatsResponse>(
    apiEndpoints.attendanceApi.getAttendanceStats,
    { showErrorAlert: true }
  );
}
