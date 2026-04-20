import express from 'express';
import {
  getAllForms,
  createForm,
  getFormById,
  updateForm,
  deleteForm,
  publishForm,
} from '../controllers/formsController.js';
import { instructorOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllForms);
router.post('/', instructorOnly, createForm);
router.get('/:id', getFormById);
router.put('/:id', instructorOnly, updateForm);
router.delete('/:id', instructorOnly, deleteForm);
router.post('/:id/publish', instructorOnly, publishForm);

export default router;
