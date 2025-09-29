/**
 * Attendance Routes
 * 
 * RESTful endpoints for attendance management operations.
 * Provides comprehensive attendance CRUD operations, BLE data processing,
 * and proxy detection functionality.
 */

import express from 'express';
import {
  recordAttendance,
  recordBulkAttendance,
  getSessionAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats
} from '../controller/attendance';

const router = express.Router();

/**
 * POST /attendance/record
 * Record individual attendance from BLE scan data
 * 
 * Body: {
 *   sessionId: string (required) - Active session ID,
 *   studentId?: string (optional) - Student ID,
 *   enrollmentNumber?: string (optional) - Student enrollment number,
 *   location?: string (optional) - Where attendance was recorded,
 *   bleData?: any (optional) - Raw BLE payload for validation
 * }
 * 
 * Note: Either studentId or enrollmentNumber must be provided
 * 
 * Response: {
 *   message: string,
 *   attendance: Attendance (with student details)
 * }
 */
router.post('/record', recordAttendance);

/**
 * POST /attendance/bulk
 * Record bulk attendance from BLE scan results
 * 
 * Body: {
 *   sessionId: string (required) - Active session ID,
 *   attendanceRecords: Array<{
 *     studentId?: string (optional),
 *     enrollmentNumber?: string (optional),
 *     bleData?: any (optional)
 *   }> (required) - Array of student attendance data from BLE scan,
 *   location?: string (optional) - Common location for all records
 * }
 * 
 * Response: {
 *   message: string,
 *   summary: {
 *     totalProcessed: number,
 *     created: number,
 *     skipped: number,
 *     errors: number
 *   },
 *   createdAttendances: Attendance[],
 *   skippedRecords: Array<{studentId: string, rollNumber: string, reason: string}>,
 *   errors: Array<{record: any, error: string}>
 * }
 */
router.post('/bulk', recordBulkAttendance);

/**
 * GET /attendance/session/:sessionId
 * Retrieve session attendance with optional filtering and statistics
 * 
 * Parameters:
 *   sessionId: string - Session ID
 * 
 * Query Parameters:
 *   includeStats?: boolean - Include attendance statistics (default: false)
 *   status?: AttendanceStatus - Filter by attendance status (PRESENT, LATE, ABSENT)
 *   detectProxy?: boolean - Include proxy detection analysis (default: false)
 * 
 * Response: {
 *   session: {
 *     id: string,
 *     title: string,
 *     subject: string,
 *     startTime: DateTime,
 *     endTime: DateTime,
 *     status: SessionStatus
 *   },
 *   attendances: Attendance[] (with student details),
 *   statistics?: AttendanceStats (if includeStats=true),
 *   proxyAnalysis?: ProxyAnalysis (if detectProxy=true)
 * }
 */
router.get('/session/:sessionId', getSessionAttendance);

/**
 * GET /attendance/:id
 * Retrieve individual attendance record by ID
 * 
 * Parameters:
 *   id: string - Attendance record ID
 * 
 * Response: {
 *   attendance: Attendance (with student and session details)
 * }
 */
router.get('/:id', getAttendanceById);

/**
 * PUT /attendance/:id
 * Update attendance record
 * 
 * Parameters:
 *   id: string - Attendance record ID
 * 
 * Body: {
 *   status?: AttendanceStatus - Update attendance status,
 *   location?: string - Update location,
 *   notes?: string - Add notes (if supported in schema)
 * }
 * 
 * Note: Cannot update attendance for ended sessions
 * 
 * Response: {
 *   message: string,
 *   attendance: Attendance (with student details)
 * }
 */
router.put('/:id', updateAttendance);

/**
 * DELETE /attendance/:id
 * Delete attendance record
 * 
 * Parameters:
 *   id: string - Attendance record ID
 * 
 * Note: Cannot delete attendance for ended sessions
 * 
 * Response: {
 *   message: string
 * }
 */
router.delete('/:id', deleteAttendance);

/**
 * GET /attendance/session/:sessionId/stats
 * Get attendance statistics for a session
 * 
 * Parameters:
 *   sessionId: string - Session ID
 * 
 * Response: {
 *   sessionId: string,
 *   statistics: {
 *     total: number,
 *     present: number,
 *     late: number,
 *     absent: number,
 *     attendancePercentage: number
 *   }
 * }
 */
router.get('/session/:sessionId/stats', getAttendanceStats);

export default router;