/**
 * Attendance Controller
 * 
 * Comprehensive attendance management controller with BLE data processing,
 * proxy detection, and full CRUD operations for attendance records.
 */

import { PrismaClient, AttendanceStatus, SessionStatus } from '@prisma/client';
import type { Request, Response } from 'express';

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Record individual attendance from BLE scan data
 * Handles validation, duplicate prevention, and automatic status assignment
 */
export const recordAttendance = async (req: Request, res: Response) => {
  try {
    const { sessionId, studentId, enrollmentNumber, location, bleData } = req.body;

    // Validate required fields
    if (!sessionId || (!studentId && !enrollmentNumber)) {
      return res.status(400).json({
        error: 'Missing required fields: sessionId and either studentId or enrollmentNumber are required'
      });
    }

    // Validate session exists and is active
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    if (session.status !== SessionStatus.ACTIVE) {
      return res.status(400).json({
        error: 'Attendance can only be recorded for active sessions'
      });
    }

    // Find student by ID or enrollment number
    let student;
    if (studentId) {
      student = await prisma.student.findUnique({
        where: { id: studentId }
      });
    } else if (enrollmentNumber) {
      student = await prisma.student.findUnique({
        where: { rollNumber: enrollmentNumber }
      });
    }

    if (!student) {
      return res.status(404).json({
        error: 'Student not found'
      });
    }

    // Check for existing attendance record
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        sessionId,
        studentId: student.id
      }
    });

    if (existingAttendance) {
      return res.status(409).json({
        error: 'Attendance already recorded for this student in this session',
        existingAttendance
      });
    }

    // Determine attendance status based on session timing
    const attendanceStatus = determineAttendanceStatus(session);

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        sessionId,
        studentId: student.id,
        location: location || null,
        status: attendanceStatus
      },
      include: {
        student: {
          select: {
            id: true,
            rollNumber: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      message: 'Attendance recorded successfully',
      attendance
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({
      error: 'Failed to record attendance'
    });
  }
};

/**
 * Record bulk attendance from BLE scan results
 * Processes multiple student attendance records in a transaction
 */
export const recordBulkAttendance = async (req: Request, res: Response) => {
  try {
    const { sessionId, attendanceRecords, location } = req.body;

    // Validate required fields
    if (!sessionId || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({
        error: 'Missing required fields: sessionId and attendanceRecords array are required'
      });
    }

    // Validate session exists and is active
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    if (session.status !== SessionStatus.ACTIVE) {
      return res.status(400).json({
        error: 'Attendance can only be recorded for active sessions'
      });
    }

    // Process attendance records in transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdAttendances = [];
      const skippedRecords = [];
      const errors = [];

      for (const record of attendanceRecords) {
        try {
          const { studentId, enrollmentNumber, bleData } = record;

          // Find student
          let student;
          if (studentId) {
            student = await tx.student.findUnique({
              where: { id: studentId }
            });
          } else if (enrollmentNumber) {
            student = await tx.student.findUnique({
              where: { rollNumber: enrollmentNumber }
            });
          }

          if (!student) {
            errors.push({
              record,
              error: 'Student not found'
            });
            continue;
          }

          // Check for existing attendance
          const existingAttendance = await tx.attendance.findFirst({
            where: {
              sessionId,
              studentId: student.id
            }
          });

          if (existingAttendance) {
            skippedRecords.push({
              studentId: student.id,
              rollNumber: student.rollNumber,
              reason: 'Attendance already recorded'
            });
            continue;
          }

          // Create attendance record
          const attendance = await tx.attendance.create({
            data: {
              sessionId,
              studentId: student.id,
              location: location || null,
              status: determineAttendanceStatus(session)
            },
            include: {
              student: {
                select: {
                  id: true,
                  rollNumber: true,
                  user: {
                    select: {
                      name: true,
                      email: true
                    }
                  }
                }
              }
            }
          });

          createdAttendances.push(attendance);
        } catch (error) {
          errors.push({
            record,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return {
        createdAttendances,
        skippedRecords,
        errors
      };
    });

    res.status(201).json({
      message: 'Bulk attendance processing completed',
      summary: {
        totalProcessed: attendanceRecords.length,
        created: result.createdAttendances.length,
        skipped: result.skippedRecords.length,
        errors: result.errors.length
      },
      createdAttendances: result.createdAttendances,
      skippedRecords: result.skippedRecords,
      errors: result.errors
    });
  } catch (error) {
    console.error('Error recording bulk attendance:', error);
    res.status(500).json({
      error: 'Failed to record bulk attendance'
    });
  }
};

/**
 * Get session attendance with optional filtering and statistics
 */
export const getSessionAttendance = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { includeStats = 'false', status, detectProxy = 'false' } = req.query;

    // Validate session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Build attendance filter
    const attendanceWhere: any = { sessionId };
    if (status) {
      attendanceWhere.status = status;
    }

    // Get attendance records
    const attendances = await prisma.attendance.findMany({
      where: attendanceWhere,
      include: {
        student: {
          select: {
            id: true,
            rollNumber: true,
            year: true,
            semester: true,
            section: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    let response: any = {
      session: {
        id: session.id,
        title: session.title,
        subject: session.subject,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status
      },
      attendances
    };

    // Include statistics if requested
    if (includeStats === 'true') {
      const stats = await calculateAttendanceStats(sessionId);
      response.statistics = stats;
    }

    // Include proxy detection if requested
    if (detectProxy === 'true') {
      const proxyAnalysis = await performProxyDetectionAnalysis(sessionId);
      response.proxyAnalysis = proxyAnalysis;
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching session attendance:', error);
    res.status(500).json({
      error: 'Failed to fetch session attendance'
    });
  }
};

/**
 * Get individual attendance record by ID
 */
export const getAttendanceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            rollNumber: true,
            year: true,
            semester: true,
            section: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        session: {
          select: {
            id: true,
            title: true,
            subject: true,
            startTime: true,
            endTime: true,
            status: true
          }
        }
      }
    });

    if (!attendance) {
      return res.status(404).json({
        error: 'Attendance record not found'
      });
    }

    res.json({ attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      error: 'Failed to fetch attendance record'
    });
  }
};

/**
 * Update attendance record
 */
export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if attendance exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        session: true
      }
    });

    if (!existingAttendance) {
      return res.status(404).json({
        error: 'Attendance record not found'
      });
    }

    // Validate session status for updates
    if (existingAttendance.session.status === SessionStatus.ENDED) {
      return res.status(400).json({
        error: 'Cannot update attendance for ended sessions'
      });
    }

    // Validate status transitions
    if (updateData.status && !isValidAttendanceStatusTransition(existingAttendance.status, updateData.status)) {
      return res.status(400).json({
        error: `Invalid status transition from ${existingAttendance.status} to ${updateData.status}`
      });
    }

    // Update attendance
    const attendance = await prisma.attendance.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            rollNumber: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Attendance updated successfully',
      attendance
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      error: 'Failed to update attendance'
    });
  }
};

/**
 * Delete attendance record
 */
export const deleteAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if attendance exists
    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        session: true
      }
    });

    if (!attendance) {
      return res.status(404).json({
        error: 'Attendance record not found'
      });
    }

    // Validate session status for deletion
    if (attendance.session.status === SessionStatus.ENDED) {
      return res.status(400).json({
        error: 'Cannot delete attendance for ended sessions'
      });
    }

    // Delete attendance
    await prisma.attendance.delete({
      where: { id }
    });

    res.json({
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({
      error: 'Failed to delete attendance record'
    });
  }
};

/**
 * Detect proxy attendance patterns
 */
export const detectProxyAttendance = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    // Validate session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    const analysis = await performProxyDetectionAnalysis(sessionId);

    res.json({
      sessionId,
      proxyAnalysis: analysis
    });
  } catch (error) {
    console.error('Error detecting proxy attendance:', error);
    res.status(500).json({
      error: 'Failed to detect proxy attendance'
    });
  }
};

/**
 * Get attendance statistics for a session
 */
export const getAttendanceStats = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    // Validate session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    const stats = await calculateAttendanceStats(sessionId);

    res.json({
      sessionId,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({
      error: 'Failed to fetch attendance statistics'
    });
  }
};

/**
 * Helper function to determine attendance status based on session timing
 */
const determineAttendanceStatus = (session: any): AttendanceStatus => {
  const now = new Date();
  const sessionStart = new Date(session.startTime);
  const lateThreshold = new Date(sessionStart.getTime() + 15 * 60 * 1000); // 15 minutes after start

  if (now <= lateThreshold) {
    return AttendanceStatus.PRESENT;
  } else {
    return AttendanceStatus.LATE;
  }
};

/**
 * Helper function to validate attendance status transitions
 */
const isValidAttendanceStatusTransition = (currentStatus: AttendanceStatus, newStatus: AttendanceStatus): boolean => {
  const validTransitions: Record<AttendanceStatus, AttendanceStatus[]> = {
    [AttendanceStatus.PRESENT]: [AttendanceStatus.LATE, AttendanceStatus.ABSENT],
    [AttendanceStatus.LATE]: [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT],
    [AttendanceStatus.ABSENT]: [AttendanceStatus.PRESENT, AttendanceStatus.LATE]
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Helper function to calculate attendance statistics
 */
const calculateAttendanceStats = async (sessionId: string) => {
  const [totalCount, presentCount, lateCount, absentCount] = await Promise.all([
    prisma.attendance.count({
      where: { sessionId }
    }),
    prisma.attendance.count({
      where: { sessionId, status: AttendanceStatus.PRESENT }
    }),
    prisma.attendance.count({
      where: { sessionId, status: AttendanceStatus.LATE }
    }),
    prisma.attendance.count({
      where: { sessionId, status: AttendanceStatus.ABSENT }
    })
  ]);

  const attendancePercentage = totalCount > 0 ? ((presentCount + lateCount) / totalCount) * 100 : 0;

  return {
    total: totalCount,
    present: presentCount,
    late: lateCount,
    absent: absentCount,
    attendancePercentage: Math.round(attendancePercentage * 100) / 100
  };
};

/**
 * Helper function to perform proxy detection analysis
 */
const performProxyDetectionAnalysis = async (sessionId: string) => {
  // Get all attendance records for the session
  const attendances = await prisma.attendance.findMany({
    where: { sessionId },
    include: {
      student: {
        select: {
          id: true,
          rollNumber: true,
          year: true,
          semester: true,
          section: true
        }
      }
    },
    orderBy: { timestamp: 'asc' }
  });

  if (attendances.length === 0) {
    return {
      riskLevel: 'LOW',
      confidence: 0,
      flaggedStudents: [],
      analysis: 'No attendance records to analyze'
    };
  }

  // Analyze timing patterns
  const timingAnalysis = analyzeTimingPatterns(attendances);
  
  // Analyze clustering patterns
  const clusteringAnalysis = analyzeClusteringPatterns(attendances);
  
  // Calculate overall risk
  const riskLevel = calculateRiskLevel(timingAnalysis, clusteringAnalysis);
  
  // Get flagged students
  const flaggedStudents = getFlaggedStudents(attendances, timingAnalysis, clusteringAnalysis);

  return {
    riskLevel,
    confidence: Math.round((timingAnalysis.confidence + clusteringAnalysis.confidence) / 2),
    flaggedStudents,
    analysis: {
      timing: timingAnalysis,
      clustering: clusteringAnalysis,
      totalAttendances: attendances.length,
      suspiciousPatterns: timingAnalysis.suspiciousPatterns + clusteringAnalysis.suspiciousPatterns
    }
  };
};

/**
 * Analyze timing patterns for proxy detection
 */
const analyzeTimingPatterns = (attendances: any[]) => {
  const timestamps = attendances.map(a => new Date(a.timestamp).getTime());
  const intervals = [];
  
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }

  // Look for suspicious patterns
  const suspiciousPatterns = intervals.filter(interval => interval < 5000).length; // Less than 5 seconds apart
  const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
  
  let confidence = 100;
  if (suspiciousPatterns > 0) {
    confidence -= Math.min(suspiciousPatterns * 20, 80);
  }
  if (avgInterval < 10000) { // Less than 10 seconds average
    confidence -= 30;
  }

  return {
    suspiciousPatterns,
    averageInterval: Math.round(avgInterval),
    confidence: Math.max(confidence, 0)
  };
};

/**
 * Analyze clustering patterns for proxy detection
 */
const analyzeClusteringPatterns = (attendances: any[]) => {
  // Group by sections/years to detect proxy patterns
  const sectionGroups = attendances.reduce((groups, attendance) => {
    const section = attendance.student.section || 'unknown';
    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(attendance);
    return groups;
  }, {});

  let suspiciousPatterns = 0;
  let confidence = 100;

  // Check for section-based clustering
  Object.values(sectionGroups).forEach((group: any) => {
    if (group.length > 3) { // More than 3 students from same section
      const timestamps = group.map((a: any) => new Date(a.timestamp).getTime());
      const timeSpan = Math.max(...timestamps) - Math.min(...timestamps);
      
      if (timeSpan < 30000) { // All within 30 seconds
        suspiciousPatterns++;
        confidence -= 25;
      }
    }
  });

  return {
    suspiciousPatterns,
    sectionGroups: Object.keys(sectionGroups).length,
    confidence: Math.max(confidence, 0)
  };
};

/**
 * Calculate overall risk level
 */
const calculateRiskLevel = (timingAnalysis: any, clusteringAnalysis: any): string => {
  const avgConfidence = (timingAnalysis.confidence + clusteringAnalysis.confidence) / 2;
  
  if (avgConfidence >= 80) return 'LOW';
  if (avgConfidence >= 60) return 'MEDIUM';
  if (avgConfidence >= 40) return 'HIGH';
  return 'CRITICAL';
};

/**
 * Get flagged students based on analysis
 */
const getFlaggedStudents = (attendances: any[], timingAnalysis: any, clusteringAnalysis: any) => {
  const flagged: Array<{
    studentId: string;
    rollNumber: string;
    reason: string;
    timestamp: number;
  }> = [];
  
  // Flag students with suspicious timing
  if (timingAnalysis.suspiciousPatterns > 0) {
    const timestamps = attendances.map(a => ({ ...a, timestamp: new Date(a.timestamp).getTime() }));
    const suspiciousGroups: any[][] = [];
    
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i].timestamp - timestamps[i - 1].timestamp < 5000) {
        suspiciousGroups.push([timestamps[i - 1], timestamps[i]]);
      }
    }
    
    suspiciousGroups.forEach(group => {
      group.forEach(attendance => {
        flagged.push({
          studentId: attendance.student.id,
          rollNumber: attendance.student.rollNumber,
          reason: 'Suspicious timing pattern',
          timestamp: attendance.timestamp
        });
      });
    });
  }
  
  return flagged;
};
