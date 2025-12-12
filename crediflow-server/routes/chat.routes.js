import express from 'express';
import { 
  processMessage, 
  getChatHistory, 
  triggerKYCVerification,
  triggerUnderwriting 
} from '../controllers/chat.controller.js';

const router = express.Router();

// Chat endpoints
router.post('/message', processMessage);
router.get('/:applicationId/history', getChatHistory);

// Agent trigger endpoints
router.post('/:applicationId/verify-kyc', triggerKYCVerification);
router.post('/:applicationId/underwrite', triggerUnderwriting);

export default router;
