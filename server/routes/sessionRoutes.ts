/**
 * Session Routes
 * 
 * RESTful endpoints for session management operations.
 * Provides comprehensive session CRUD operations and session lifecycle management.
 */

import express from 'express';
import {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  startSession,
  endSession,
  checkAndStartAutoSessions
} from '../controller/session/index';

const router = express.Router();

/**
 * POST /sessions
 * Create a new session
 * 
 * Body: {
 *   title: string (required),
 *   subject: string (required),
 *   teacherId: string (required),
 *   startTime: string (required, ISO date),
 *   isAutoStart?: boolean (optional, default: false),
 *   duration?: number (optional, in minutes)
 * }
 * 
 * Response: {
 *   message: string,
 *   session: Session
 * }
 */
router.post('/', createSession);

/**
 * GET /sessions
 * Retrieve sessions with filtering and pagination
 * 
 * Query Parameters:
 *   teacherId?: string - Filter sessions by teacher
 *   status?: SessionStatus - Filter by session status (SCHEDULED, ACTIVE, ENDED, CANCELLED)
 *   startDate?: string - Filter sessions starting from this date (ISO date)
 *   endDate?: string - Filter sessions ending before this date (ISO date)
 *   page?: number - Page number for pagination (default: 1)
 *   limit?: number - Number of sessions per page (default: 10)
 * 
 * Response: {
 *   sessions: Session[],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     pages: number
 *   }
 * }
 */
router.get('/', getSessions);

/**
 * GET /sessions/:id
 * Retrieve individual session by ID
 * 
 * Parameters:
 *   id: string - Session ID
 * 
 * Response: {
 *   session: Session (with attendance data)
 * }
 */
router.get('/:id', getSessionById);

/**
 * PUT /sessions/:id
 * Update session details
 * 
 * Parameters:
 *   id: string - Session ID
 * 
 * Body: Partial<Session> - Fields to update
 * 
 * Response: {
 *   message: string,
 *   session: Session
 * }
 */
router.put('/:id', updateSession);

/**
 * DELETE /sessions/:id
 * Delete session
 * 
 * Parameters:
 *   id: string - Session ID
 * 
 * Note: Cannot delete active sessions
 * 
 * Response: {
 *   message: string
 * }
 */
router.delete('/:id', deleteSession);

/**
 * POST /sessions/:id/start
 * Manually start a scheduled session
 * 
 * Parameters:
 *   id: string - Session ID
 * 
 * Note: Only scheduled sessions can be started
 * 
 * Response: {
 *   message: string,
 *   session: Session
 * }
 */
router.post('/:id/start', startSession);

/**
 * POST /sessions/:id/end
 * Manually end an active session
 * 
 * Parameters:
 *   id: string - Session ID
 * 
 * Note: Only active sessions can be ended
 * 
 * Response: {
 *   message: string,
 *   session: Session
 * }
 */
router.post('/:id/end', endSession);

/**
 * GET /sessions/auto-start
 * Trigger auto-start check for eligible sessions
 * 
 * Response: {
 *   message: string,
 *   autoStartedSessions: Session[]
 * }
 */
router.get('/auto-start', checkAndStartAutoSessions);

export default router;