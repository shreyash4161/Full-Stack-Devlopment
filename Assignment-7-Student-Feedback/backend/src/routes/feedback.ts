import express from 'express';
import {
  submitFeedback,
  getFeedbackByFormId,
  deleteFeedback,
} from '../controllers/feedbackController.js';
import { instructorOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', submitFeedback);
router.get('/form/:formId', instructorOnly, getFeedbackByFormId);
router.delete('/:feedbackId', instructorOnly, deleteFeedback);

export default router;
