/**
 * Main Routes Index
 * 
 * Central routing hub that consolidates all route modules.
 * This file serves as the central point for organizing and managing all API endpoints.
 */

import express from 'express';
import sessionRoutes from './sessionRoutes';
import attendanceRoutes from './attendanceRoutes';

// Create main router instance
const router = express.Router();

// Mount session routes at /sessions path
router.use('/sessions', sessionRoutes);

// Mount attendance routes at /attendance path
router.use('/attendance', attendanceRoutes);

// Future route modules will be mounted here:
// router.use('/analytics', analyticsRoutes);
// router.use('/users', userRoutes);

export default router;
