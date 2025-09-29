/**
 * Session Controller
 * 
 * Comprehensive session management controller with full CRUD operations,
 * auto-start logic, and session status management.
 */

import { PrismaClient, SessionStatus } from '@prisma/client';
import type { Request, Response } from 'express';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Create a new session
 * Handles both manual and auto-start session creation
 */
export const createSession = async (req: Request, res: Response) => {
  try {
    const { title, subject, teacherId, startTime, isAutoStart = false, duration } = req.body;

    // Validate required fields
    if (!title || !subject || !teacherId || !startTime) {
      return res.status(400).json({
        error: 'Missing required fields: title, subject, teacherId, and startTime are required'
      });
    }

    // Validate startTime format
    const startTimeDate = new Date(startTime);
    if (isNaN(startTimeDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid startTime format. Please provide a valid ISO date string'
      });
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        title,
        subject,
        teacherId,
        startTime: startTimeDate,
        isAutoStart,
        duration: duration || null,
        status: SessionStatus.SCHEDULED
      }
    });

    res.status(201).json({
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      error: 'Failed to create session'
    });
  }
};

/**
 * Get sessions with filtering and pagination
 */
export const getSessions = async (req: Request, res: Response) => {
  try {
    const {
      teacherId,
      status,
      startDate,
      endDate,
      page = '1',
      limit = '10'
    } = req.query;

    const where: any = {};

    if (teacherId) {
      where.teacherId = teacherId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate as string);
      }
    }

    // Calculate pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get sessions with pagination
    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { startTime: 'desc' },
        include: {
          attendances: {
            select: {
              id: true,
              timestamp: true,
            }
          }
        }
      }),
      prisma.session.count({ where })
    ]);

    res.json({
      sessions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      error: 'Failed to fetch sessions'
    });
  }
};

/**
 * Get session by ID
 */
export const getSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        attendances: {
          select: {
            id: true,
            studentId: true,
            timestamp: true,

            
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    res.json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      error: 'Failed to fetch session'
    });
  }
};

/**
 * Update session
 */
export const updateSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if session exists
    const existingSession = await prisma.session.findUnique({
      where: { id }
    });

    if (!existingSession) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Validate status transitions
    if (updateData.status && !isValidStatusTransition(existingSession.status, updateData.status)) {
      return res.status(400).json({
        error: `Invalid status transition from ${existingSession.status} to ${updateData.status}`
      });
    }

    // Update session
    const session = await prisma.session.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Session updated successfully',
      session
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({
      error: 'Failed to update session'
    });
  }
};

/**
 * Delete session
 */
export const deleteSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if session exists and is not active
    const session = await prisma.session.findUnique({
      where: { id }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    if (session.status === SessionStatus.ACTIVE) {
      return res.status(400).json({
        error: 'Cannot delete active session. Please end the session first.'
      });
    }

    // Delete session
    await prisma.session.delete({
      where: { id }
    });

    res.json({
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      error: 'Failed to delete session'
    });
  }
};

/**
 * Start session manually
 */
export const startSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    if (session.status !== SessionStatus.SCHEDULED) {
      return res.status(400).json({
        error: 'Only scheduled sessions can be started'
      });
    }

    // Start session
    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        status: SessionStatus.ACTIVE,
        startTime: new Date() // Update start time to actual start time
      }
    });

    res.json({
      message: 'Session started successfully',
      session: updatedSession
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      error: 'Failed to start session'
    });
  }
};

/**
 * End session manually
 */
export const endSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    if (session.status !== SessionStatus.ACTIVE) {
      return res.status(400).json({
        error: 'Only active sessions can be ended'
      });
    }

    // End session
    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        status: SessionStatus.ENDED,
        endTime: new Date()
      }
    });

    res.json({
      message: 'Session ended successfully',
      session: updatedSession
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      error: 'Failed to end session'
    });
  }
};

/**
 * Check and start auto-start sessions
 */
export const checkAndStartAutoSessions = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    // Find sessions that should be auto-started
    const eligibleSessions = await prisma.session.findMany({
      where: {
        status: SessionStatus.SCHEDULED,
        isAutoStart: true,
        startTime: {
          lte: now
        }
      }
    });

    if (eligibleSessions.length === 0) {
      return res.json({
        message: 'No sessions eligible for auto-start',
        autoStartedSessions: []
      });
    }

    // Start eligible sessions
    const autoStartedSessions = await Promise.all(
      eligibleSessions.map(session =>
        prisma.session.update({
          where: { id: session.id },
          data: {
            status: SessionStatus.ACTIVE,
            startTime: now // Update to actual start time
          }
        })
      )
    );

    res.json({
      message: `${autoStartedSessions.length} sessions auto-started successfully`,
      autoStartedSessions
    });
  } catch (error) {
    console.error('Error in auto-start process:', error);
    res.status(500).json({
      error: 'Failed to process auto-start sessions'
    });
  }
};

/**
 * Helper function to validate status transitions
 */
const isValidStatusTransition = (currentStatus: SessionStatus, newStatus: SessionStatus): boolean => {
  const validTransitions: Record<SessionStatus, SessionStatus[]> = {
    [SessionStatus.SCHEDULED]: [SessionStatus.ACTIVE, SessionStatus.CANCELLED],
    [SessionStatus.ACTIVE]: [SessionStatus.ENDED, SessionStatus.CANCELLED],
    [SessionStatus.ENDED]: [], // No transitions from ENDED
    [SessionStatus.CANCELLED]: [] // No transitions from CANCELLED
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};