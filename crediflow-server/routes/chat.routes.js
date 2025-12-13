import express from 'express';
import { processMessage, getChatHistory } from '../controllers/chat.controller.js';

const router = express.Router();

// Chat endpoints
router.post('/message', processMessage);
router.get('/:applicationId/history', getChatHistory);

export default router;
