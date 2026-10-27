import express from 'express';
import { chatWithAssistant } from '../controllers/assistantController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Chat endpoint (Protected)
router.post('/chat', protect, chatWithAssistant);

export default router;
