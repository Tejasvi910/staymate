import express from 'express';
import {
  register,
  login,
  getMe,
  getStudents,
  updateStudentFee,
  getStaff,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected profile routes
router.get('/me', protect, getMe);

// Student management & fee routes
router.get('/students', protect, authorize('manager', 'warden', 'accountant', 'admin'), getStudents);
router.put('/students/:id/fee', protect, authorize('manager', 'accountant', 'admin'), updateStudentFee);

// Staff lookup (for campus warden assignment)
router.get('/staff', protect, authorize('manager', 'admin'), getStaff);

export default router;
