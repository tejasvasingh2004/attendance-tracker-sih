import { SessionStatus } from '@prisma/client';
import type { Request, Response } from 'express';
import type { Session as PrismaSession } from '@prisma/client';
import { prisma } from '../prisma/client';

/**
 * Record individual attendance from BLE scan data
 * Handles validation, duplicate prevention, and automatic status assignment
 */
export const recordAttendance = async (req: Request, res: Response) => {
  try {
    const { sessionId, studentId, enrollmentNumber, bleData } = req.body;

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
        isPresent: attendanceStatus
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
    const { sessionId, attendanceRecords} = req.body;

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
              isPresent: determineAttendanceStatus(session)
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
    const { includeStats = 'false', status } = req.query;

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
      attendanceWhere.isPresent = status === 'true';
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
    if (updateData.isPresent !== undefined && !isValidAttendanceChange(existingAttendance.isPresent, updateData.isPresent)) {
      return res.status(400).json({
        error: `Invalid status transition from ${existingAttendance.isPresent ? 'present' : 'absent'} to ${updateData.isPresent ? 'present' : 'absent'}`
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

//**
 
const determineAttendanceStatus = (session: PrismaSession): boolean => {
  const now = new Date();
  const sessionStart = new Date(session.startTime);

  // You can still apply a threshold if you want to block attendance after start,
  // or just always mark true when they check in.
  const presentThreshold = new Date(sessionStart.getTime() + 15 * 60 * 1000); // optional

  // return true = present, false = absent
  return now <= presentThreshold;
};


/**
 * Helper function to validate attendance change
 */
const isValidAttendanceChange = (currentIsPresent: boolean, newIsPresent: boolean): boolean => {
  // For example, only allow changing from false -> true, not from true -> false
  if (currentIsPresent && !newIsPresent) {
    return false; // disallow marking absent after present
  }
  return true;
};

/**
 * Helper function to calculate attendance statistics
 */
const calculateAttendanceStats = async (sessionId: string) => {
  const [totalCount, presentCount, absentCount] = await Promise.all([
    prisma.attendance.count({ where: { sessionId } }),
    prisma.attendance.count({ where: { sessionId, isPresent: true } }),
    prisma.attendance.count({ where: { sessionId, isPresent: false } })
  ]);

  const attendancePercentage =
    totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

  return {
    total: totalCount,
    present: presentCount,
    absent: absentCount,
    attendancePercentage: Math.round(attendancePercentage * 100) / 100
  };
};

