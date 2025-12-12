import express from 'express';
import {
  createApplication,
  getApplication,
  getAllApplications,
  updateApplication,
  deleteApplication,
  uploadDocument,
  updateStage,
  approveApplication,
  rejectApplication,
  generateSanctionLetter,
} from '../controllers/application.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// Application CRUD
router.post('/', createApplication);
router.get('/:id', getApplication);
router.get('/', getAllApplications);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

// Document upload
router.post('/:id/upload', upload.single('document'), uploadDocument);

// Stage management
router.put('/:id/stage', updateStage);

// Approval/Rejection
router.put('/:id/approve', approveApplication);
router.put('/:id/reject', rejectApplication);

// Sanction Letter
router.get('/:id/sanction-letter', generateSanctionLetter);

export default router;
