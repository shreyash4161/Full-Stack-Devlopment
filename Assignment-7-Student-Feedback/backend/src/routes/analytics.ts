import express from 'express';
import {
  getFormAnalytics,
  getInstructorDashboard,
} from '../controllers/analyticsController.js';
import { instructorOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', instructorOnly, getInstructorDashboard);
router.get('/:formId', instructorOnly, getFormAnalytics);

export default router;
