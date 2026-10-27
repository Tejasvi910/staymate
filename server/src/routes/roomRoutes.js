import express from 'express';
import {
  getRooms,
  createRoom,
  assignStudentToRoom,
  unassignStudentFromRoom,
  getMyRoom,
} from '../controllers/roomController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

import { reassignStudentRoom } from '../controllers/userController.js';

const router = express.Router();

// Specific routes first to avoid route shadowing by :id
router.get('/my-room', protect, getMyRoom);
router.patch('/reassign', protect, authorize('manager', 'warden', 'admin'), reassignStudentRoom);

// General room routes
router
  .route('/')
  .get(protect, getRooms)
  .post(protect, authorize('manager', 'warden', 'admin'), createRoom);

// Room assignment routes
router.put('/:id/assign', protect, authorize('manager', 'warden', 'admin'), assignStudentToRoom);
router.put('/:id/unassign', protect, authorize('manager', 'warden', 'admin'), unassignStudentFromRoom);

export default router;
