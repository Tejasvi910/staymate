import express from 'express';
import {
  createStaff,
  removeStaff,
  getStaffList,
  createStudent,
  removeStudent,
  reassignStudentRoom,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Staff management (Manager only for create/remove; Manager & Warden for read)
router
  .route('/staff')
  .get(protect, authorize('manager', 'warden', 'admin'), getStaffList)
  .post(protect, authorize('manager', 'admin'), createStaff);

router
  .route('/staff/:id')
  .delete(protect, authorize('manager', 'admin'), removeStaff);

// Student management
router
  .route('/student')
  .post(protect, authorize('manager', 'warden', 'admin'), createStudent);

router
  .route('/student/:id')
  .delete(protect, authorize('manager', 'admin'), removeStudent);

router
  .route('/student/:id/room')
  .patch(protect, authorize('manager', 'warden', 'admin'), reassignStudentRoom);

export default router;
